import express from 'express';
import Learning from '../../db/models/Learning.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import logger from '../../utils/logger.js';

const router = express.Router();

// Helper to format learning document for client response
function formatLearning(learning, currentUserId = null) {
  const obj = learning.toObject ? learning.toObject() : learning;
  const authorId = obj.author?._id ? obj.author._id.toString() : (obj.author?.id || (obj.author ? obj.author.toString() : null));
  const isAuthor = Boolean(
    currentUserId && authorId && currentUserId.toString() === authorId.toString()
  );

  return {
    id: obj._id ? obj._id.toString() : obj.id,
    learningId: obj.learningId,
    title: obj.title,
    content: obj.content,
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    relatedProblems: Array.isArray(obj.relatedProblems) ? obj.relatedProblems : [],
    visibility: obj.visibility || 'private',
    viewsCount: obj.viewsCount || 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    isAuthor,
    author: obj.author && typeof obj.author === 'object' && obj.author.username
      ? {
          id: authorId,
          username: obj.author.username,
          name: obj.author.name,
          avatar: obj.author.avatar,
        }
      : null,
  };
}

// Sanitization helpers
function sanitizeTags(rawTags) {
  if (!Array.isArray(rawTags)) return [];
  const clean = rawTags
    .map((t) => (typeof t === 'string' ? t.trim().toLowerCase().slice(0, 30) : ''))
    .filter((t) => t.length > 0);
  return Array.from(new Set(clean)).slice(0, 15);
}

function sanitizeRelatedProblems(rawProblems) {
  if (!Array.isArray(rawProblems)) return [];
  return rawProblems
    .filter((p) => p && typeof p === 'object' && typeof p.title === 'string' && typeof p.url === 'string')
    .map((p) => ({
      title: p.title.trim().slice(0, 200),
      url: p.url.trim().slice(0, 500),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(p.difficulty) ? p.difficulty : 'Medium',
      problemNumber: typeof p.problemNumber === 'string' ? p.problemNumber.trim().slice(0, 20) : '',
    }))
    .slice(0, 20);
}

// ==================== GET /learnings (Public Explore Feed) ====================
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const { tag, search, sort } = req.query;

    // Strict filter: Public notes only! Private and unlisted must NEVER leak.
    const filter = { visibility: 'public' };

    if (tag && tag.trim()) {
      filter.tags = tag.trim().toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { viewsCount: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const currentUserId = req.user ? req.user._id : null;

    const [learnings, total] = await Promise.all([
      Learning.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name avatar')
        .lean(),
      Learning.countDocuments(filter),
    ]);

    res.json({
      learnings: learnings.map((l) => formatLearning(l, currentUserId)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to list public learnings');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// ==================== GET /learnings/me (Personal Notes Library) ====================
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const { visibility, tag, search, sort } = req.query;

    const baseFilter = { author: req.user._id };
    const queryFilter = { ...baseFilter };

    if (visibility && ['private', 'unlisted', 'public'].includes(visibility)) {
      queryFilter.visibility = visibility;
    }

    if (tag && tag.trim()) {
      queryFilter.tags = tag.trim().toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      queryFilter.$or = [
        { title: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
      ];
    }

    let sortOption = { updatedAt: -1 };
    if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { viewsCount: -1, updatedAt: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const [learnings, total, totalAll, privateCount, unlistedCount, publicCount] = await Promise.all([
      Learning.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name avatar')
        .lean(),
      Learning.countDocuments(queryFilter),
      Learning.countDocuments(baseFilter),
      Learning.countDocuments({ ...baseFilter, visibility: 'private' }),
      Learning.countDocuments({ ...baseFilter, visibility: 'unlisted' }),
      Learning.countDocuments({ ...baseFilter, visibility: 'public' }),
    ]);

    res.json({
      learnings: learnings.map((l) => formatLearning(l, req.user._id)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: totalAll,
        private: privateCount,
        unlisted: unlistedCount,
        public: publicCount,
      },
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user._id }, 'Failed to fetch personal learnings');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// ==================== POST /learnings (Create Note) ====================
router.post('/', authenticateUser, async (req, res) => {
  const { title, content, tags, relatedProblems, visibility } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title is required',
    });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content is required and must be a string',
    });
  }

  const chosenVisibility = visibility && ['private', 'unlisted', 'public'].includes(visibility)
    ? visibility
    : 'private';

  try {
    const learning = await Learning.create({
      title: title.trim().slice(0, 150),
      content,
      tags: sanitizeTags(tags),
      relatedProblems: sanitizeRelatedProblems(relatedProblems),
      visibility: chosenVisibility,
      author: req.user._id,
    });

    await learning.populate('author', 'username name avatar');
    logger.info({ learningId: learning.learningId, title: learning.title }, 'Created learning note');

    res.status(201).json(formatLearning(learning, req.user._id));
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to create learning note');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// ==================== GET /learnings/:learningId (Read Note) ====================
router.get('/:learningId', optionalAuth, async (req, res) => {
  const { learningId } = req.params;

  try {
    const learning = await Learning.findOne({ learningId }).populate(
      'author',
      'username name avatar'
    );

    if (!learning) {
      return res.status(404).json({ error: 'Not Found', message: 'Learning note not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const authorId = learning.author?._id ? learning.author._id.toString() : learning.author.toString();

    // Strict Privacy Barrier
    if (learning.visibility === 'private') {
      const isAuthor = currentUserId && currentUserId === authorId;
      if (!isAuthor) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'This learning note is private. Only the author can access it.',
        });
      }
    }

    // Increment views count asynchronously
    await Learning.updateOne({ _id: learning._id }, { $inc: { viewsCount: 1 } });
    learning.viewsCount = (learning.viewsCount || 0) + 1;

    res.json(formatLearning(learning, req.user?._id));
  } catch (err) {
    logger.error({ err: err.message, learningId }, 'Failed to fetch learning note');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// ==================== PUT /learnings/:learningId (Update Note) ====================
router.put('/:learningId', authenticateUser, async (req, res) => {
  const { learningId } = req.params;
  const { title, content, tags, relatedProblems, visibility } = req.body;

  try {
    const learning = await Learning.findOne({ learningId });
    if (!learning) {
      return res.status(404).json({ error: 'Not Found', message: 'Learning note not found' });
    }

    const currentUserId = req.user._id.toString();
    const authorId = learning.author.toString();

    if (currentUserId !== authorId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not the author of this learning note',
      });
    }

    if (title && typeof title === 'string' && title.trim()) {
      learning.title = title.trim().slice(0, 150);
    }

    if (typeof content === 'string') {
      learning.content = content;
    }

    if (tags !== undefined) {
      learning.tags = sanitizeTags(tags);
    }

    if (relatedProblems !== undefined) {
      learning.relatedProblems = sanitizeRelatedProblems(relatedProblems);
    }

    if (visibility && ['private', 'unlisted', 'public'].includes(visibility)) {
      learning.visibility = visibility;
    }

    await learning.save();
    await learning.populate('author', 'username name avatar');

    logger.info({ learningId: learning.learningId, title: learning.title }, 'Updated learning note');
    res.json(formatLearning(learning, req.user._id));
  } catch (err) {
    logger.error({ err: err.message, learningId }, 'Failed to update learning note');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// ==================== DELETE /learnings/:learningId (Delete Note) ====================
router.delete('/:learningId', authenticateUser, async (req, res) => {
  const { learningId } = req.params;

  try {
    const learning = await Learning.findOne({ learningId });
    if (!learning) {
      return res.status(404).json({ error: 'Not Found', message: 'Learning note not found' });
    }

    const currentUserId = req.user._id.toString();
    const authorId = learning.author.toString();

    if (currentUserId !== authorId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not the author of this learning note',
      });
    }

    await Learning.deleteOne({ _id: learning._id });
    logger.info({ learningId, title: learning.title }, 'Deleted learning note');

    res.json({ message: 'Learning note deleted successfully', learningId });
  } catch (err) {
    logger.error({ err: err.message, learningId }, 'Failed to delete learning note');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

export default router;
