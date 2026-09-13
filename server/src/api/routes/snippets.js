import express from 'express';
import Snippet from '../../db/models/Snippet.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import logger from '../../utils/logger.js';

const router = express.Router();

// Helper to format snippet for client response
function formatSnippet(snippet) {
  const obj = snippet.toObject ? snippet.toObject() : snippet;
  return {
    id: obj._id ? obj._id.toString() : obj.id,
    snippetId: obj.snippetId,
    title: obj.title,
    description: obj.description || '',
    languageId: obj.languageId,
    languageName: obj.languageName,
    code: obj.code,
    testCases: obj.testCases || [],
    isPublic: obj.isPublic ?? true,
    viewsCount: obj.viewsCount || 0,
    forksCount: obj.forksCount || 0,
    forkedFrom: obj.forkedFrom || null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    author: obj.author
      ? {
          id: obj.author._id ? obj.author._id.toString() : obj.author.id,
          username: obj.author.username,
          name: obj.author.name,
          avatar: obj.author.avatar,
        }
      : null,
  };
}

// POST /snippets - Save or publish new snippet
router.post('/', optionalAuth, async (req, res) => {
  const { title, description, languageId, languageName, code, testCases, isPublic } = req.body;

  if (!languageId || !languageName || typeof code !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'languageId, languageName, and code are required',
    });
  }

  try {
    const snippet = await Snippet.create({
      title: (title || 'Untitled Snippet').trim().slice(0, 120),
      description: (description || '').trim().slice(0, 500),
      languageId: Number(languageId),
      languageName: String(languageName).trim(),
      code,
      testCases: Array.isArray(testCases) ? testCases : [],
      author: req.user ? req.user._id : null,
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    });

    if (snippet.author) {
      await snippet.populate('author', 'username name avatar');
    }

    logger.info({ snippetId: snippet.snippetId, title: snippet.title }, 'Saved new snippet');
    res.status(201).json(formatSnippet(snippet));
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to save snippet');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /snippets - Explore public snippets feed
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const { languageId, sort, search } = req.query;

    const filter = { isPublic: true };
    if (languageId) {
      filter.languageId = Number(languageId);
    }
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { viewsCount: -1, forksCount: -1, createdAt: -1 };
    }

    const [snippets, total] = await Promise.all([
      Snippet.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name avatar')
        .lean(),
      Snippet.countDocuments(filter),
    ]);

    res.json({
      snippets: snippets.map(formatSnippet),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to list public snippets');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /snippets/:snippetId - Fetch single snippet (and increment view count)
router.get('/:snippetId', async (req, res) => {
  const { snippetId } = req.params;

  try {
    const snippet = await Snippet.findOneAndUpdate(
      { snippetId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    ).populate('author', 'username name avatar');

    if (!snippet) {
      return res.status(404).json({ error: 'Not Found', message: 'Snippet not found' });
    }

    res.json(formatSnippet(snippet));
  } catch (err) {
    logger.error({ err: err.message, snippetId }, 'Failed to fetch snippet');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// PUT /snippets/:snippetId - Update existing snippet (author only)
router.put('/:snippetId', authenticateUser, async (req, res) => {
  const { snippetId } = req.params;
  const { title, description, languageId, languageName, code, testCases, isPublic } = req.body;

  try {
    const snippet = await Snippet.findOne({ snippetId });
    if (!snippet) {
      return res.status(404).json({ error: 'Not Found', message: 'Snippet not found' });
    }

    if (!snippet.author || snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not the author of this snippet' });
    }

    if (title) snippet.title = title.trim().slice(0, 120);
    if (typeof description === 'string') snippet.description = description.trim().slice(0, 500);
    if (languageId) snippet.languageId = Number(languageId);
    if (languageName) snippet.languageName = String(languageName).trim();
    if (typeof code === 'string') snippet.code = code;
    if (Array.isArray(testCases)) snippet.testCases = testCases;
    if (isPublic !== undefined) snippet.isPublic = Boolean(isPublic);

    await snippet.save();
    await snippet.populate('author', 'username name avatar');

    res.json(formatSnippet(snippet));
  } catch (err) {
    logger.error({ err: err.message, snippetId }, 'Failed to update snippet');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// POST /snippets/:snippetId/fork - Fork snippet to own workspace/account
router.post('/:snippetId/fork', optionalAuth, async (req, res) => {
  const { snippetId } = req.params;

  try {
    const original = await Snippet.findOne({ snippetId });
    if (!original) {
      return res.status(404).json({ error: 'Not Found', message: 'Original snippet not found' });
    }

    // Increment fork count on original
    await Snippet.updateOne({ _id: original._id }, { $inc: { forksCount: 1 } });

    // Create cloned snippet
    const forkedTitle = original.title.includes('(Fork)') ? original.title : `${original.title} (Fork)`;
    const forkedSnippet = await Snippet.create({
      title: forkedTitle.slice(0, 120),
      description: original.description || '',
      languageId: original.languageId,
      languageName: original.languageName,
      code: original.code,
      testCases: original.testCases || [],
      author: req.user ? req.user._id : null,
      forkedFrom: original.snippetId,
      isPublic: true,
    });

    if (forkedSnippet.author) {
      await forkedSnippet.populate('author', 'username name avatar');
    }

    logger.info({ originalId: original.snippetId, forkedId: forkedSnippet.snippetId }, 'Forked snippet');
    res.status(201).json(formatSnippet(forkedSnippet));
  } catch (err) {
    logger.error({ err: err.message, snippetId }, 'Failed to fork snippet');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

export default router;
