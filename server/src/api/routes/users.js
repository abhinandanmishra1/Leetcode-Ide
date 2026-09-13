import express from 'express';
import User from '../../db/models/User.js';
import Snippet from '../../db/models/Snippet.js';
import Follow from '../../db/models/Follow.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import logger from '../../utils/logger.js';

const router = express.Router();

// GET /users/search - Search users by username or name
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .limit(10)
      .select('name username avatar bio createdAt')
      .lean();

    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to search users');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /users/:username - Fetch user public profile and stats
router.get('/:username', optionalAuth, async (req, res) => {
  let username = req.params.username.toLowerCase().trim();
  if (username === 'author') {
    username = 'admin';
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const [snippetCount, followerCount, followingCount, isFollowingRecord] = await Promise.all([
      Snippet.countDocuments({ author: user._id, isPublic: true }),
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
      req.user ? Follow.findOne({ follower: req.user._id, following: user._id }) : null,
    ]);

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      stats: {
        snippets: snippetCount,
        followers: followerCount,
        following: followingCount,
      },
      isFollowing: !!isFollowingRecord,
      isSelf: req.user ? req.user._id.toString() === user._id.toString() : false,
    });
  } catch (err) {
    logger.error({ err: err.message, username }, 'Failed to fetch user profile');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /users/:username/snippets - Fetch snippets authored by user (all if self, public only for others)
router.get('/:username/snippets', optionalAuth, async (req, res) => {
  let username = req.params.username.toLowerCase().trim();
  if (username === 'author') {
    username = 'admin';
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const isSelf = req.user && req.user._id.toString() === user._id.toString();
    const filter = { author: user._id };
    if (!isSelf) {
      filter.$or = [{ visibility: 'public' }, { isPublic: true, visibility: { $ne: 'private' } }];
    }

    const snippets = await Snippet.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(
      snippets.map((s) => ({
        id: s._id.toString(),
        snippetId: s.snippetId,
        title: s.title,
        command: s.command || '',
        description: s.description || '',
        visibility: s.visibility || (s.isPublic ? 'public' : 'unlisted'),
        isPublic: s.visibility ? s.visibility === 'public' : Boolean(s.isPublic),
        languageId: s.languageId,
        languageName: s.languageName,
        code: s.code,
        testCases: s.testCases || [],
        viewsCount: s.viewsCount || 0,
        forksCount: s.forksCount || 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt || s.createdAt,
        author: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        },
      }))
    );
  } catch (err) {
    logger.error({ err: err.message, username }, 'Failed to fetch user snippets');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// POST /users/:username/follow - Toggle follow / unfollow
router.post('/:username/follow', authenticateUser, async (req, res) => {
  const username = req.params.username.toLowerCase().trim();

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Bad Request', message: 'You cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: targetUser._id,
    });

    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      const followerCount = await Follow.countDocuments({ following: targetUser._id });
      logger.info({ follower: req.user.username, following: targetUser.username }, 'Unfollowed user');
      return res.json({
        following: false,
        message: `Unfollowed @${targetUser.username}`,
        followersCount: followerCount,
      });
    } else {
      await Follow.create({
        follower: req.user._id,
        following: targetUser._id,
      });
      const followerCount = await Follow.countDocuments({ following: targetUser._id });
      logger.info({ follower: req.user.username, following: targetUser.username }, 'Followed user');
      return res.json({
        following: true,
        message: `Followed @${targetUser.username}`,
        followersCount: followerCount,
      });
    }
  } catch (err) {
    logger.error({ err: err.message, username }, 'Failed to toggle follow');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /users/:username/followers - List followers of user
router.get('/:username/followers', optionalAuth, async (req, res) => {
  let username = req.params.username.toLowerCase().trim();
  if (username === 'author') {
    username = 'admin';
  }

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const followRecords = await Follow.find({ following: targetUser._id })
      .populate('follower', 'name username avatar bio createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const followerUserIds = followRecords
      .map((r) => r.follower?._id)
      .filter(Boolean);

    let followedSet = new Set();
    if (req.user && followerUserIds.length > 0) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        following: { $in: followerUserIds },
      })
        .select('following')
        .lean();
      followedSet = new Set(myFollows.map((f) => f.following.toString()));
    }

    const result = followRecords
      .filter((r) => r.follower)
      .map((r) => {
        const u = r.follower;
        const uid = u._id.toString();
        return {
          id: uid,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio || '',
          isFollowing: followedSet.has(uid),
          isSelf: req.user ? req.user._id.toString() === uid : false,
          createdAt: r.createdAt,
        };
      });

    res.json(result);
  } catch (err) {
    logger.error({ err: err.message, username }, 'Failed to fetch followers');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// GET /users/:username/following - List users followed by user
router.get('/:username/following', optionalAuth, async (req, res) => {
  let username = req.params.username.toLowerCase().trim();
  if (username === 'author') {
    username = 'admin';
  }

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const followRecords = await Follow.find({ follower: targetUser._id })
      .populate('following', 'name username avatar bio createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const followingUserIds = followRecords
      .map((r) => r.following?._id)
      .filter(Boolean);

    let followedSet = new Set();
    if (req.user && followingUserIds.length > 0) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        following: { $in: followingUserIds },
      })
        .select('following')
        .lean();
      followedSet = new Set(myFollows.map((f) => f.following.toString()));
    }

    const result = followRecords
      .filter((r) => r.following)
      .map((r) => {
        const u = r.following;
        const uid = u._id.toString();
        return {
          id: uid,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio || '',
          isFollowing: followedSet.has(uid),
          isSelf: req.user ? req.user._id.toString() === uid : false,
          createdAt: r.createdAt,
        };
      });

    res.json(result);
  } catch (err) {
    logger.error({ err: err.message, username }, 'Failed to fetch following users');
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

export default router;
