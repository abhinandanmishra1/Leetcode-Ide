import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../../db/models/User.js';
import Snippet from '../../db/models/Snippet.js';
import Follow from '../../db/models/Follow.js';
import config from '../../utils/config.js';
import logger from '../../utils/logger.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(config.googleClientId);

async function generateUniqueUsername(baseString) {
  let clean = (baseString || 'coder')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);

  if (clean.length < 3) {
    clean = (clean + 'coder').slice(0, 15);
  }

  let username = clean;
  let attempt = 1;
  while (await User.findOne({ username })) {
    const suffix = Math.floor(100 + Math.random() * 900);
    username = `${clean.slice(0, 16)}_${suffix}`;
    attempt++;
    if (attempt > 10) {
      username = `user_${Date.now().toString().slice(-6)}`;
      break;
    }
  }
  return username;
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
}

// POST /auth/google - Authenticate with Google ID token
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Validation Error', message: 'Google credential token is required' });
  }

  try {
    let payload;
    if (config.googleClientId) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } else {
      // Fallback decoding if GOOGLE_CLIENT_ID is not configured yet (e.g. initial development)
      const decoded = jwt.decode(credential);
      if (!decoded || !decoded.email) {
        return res.status(400).json({ error: 'Invalid Token', message: 'Unable to decode Google credential token' });
      }
      payload = decoded;
    }

    const { sub: googleId, email, name, picture: avatar } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Invalid Token', message: 'Email missing from Google token' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (!user) {
      const baseName = email.split('@')[0];
      const username = await generateUniqueUsername(baseName);
      user = await User.create({
        googleId,
        email: email.toLowerCase(),
        name: name || baseName,
        username,
        avatar: avatar || '',
      });
      logger.info({ userId: user._id, username }, 'Created new user from Google sign-in');
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (updated) await user.save();
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Google OAuth verification failed');
    res.status(401).json({ error: 'Authentication Failed', message: err.message });
  }
});

// POST /auth/dev-login - Development / Test bypass login
router.post('/dev-login', async (req, res) => {
  const { email = 'dev@codepad.local', name = 'CodePad Developer', username: customUsername } = req.body || {};

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const username = customUsername || (await generateUniqueUsername(email.split('@')[0]));
      user = await User.create({
        email: email.toLowerCase(),
        name,
        username,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username,
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Dev login failed');
    res.status(500).json({ error: 'Dev Login Failed', message: err.message });
  }
});

// GET /auth/me - Fetch current authenticated user with profile stats
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    const [snippetCount, followerCount, followingCount] = await Promise.all([
      Snippet.countDocuments({ author: user._id }),
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
    ]);

    res.json({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      stats: {
        snippets: snippetCount,
        followers: followerCount,
        following: followingCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

// PUT /auth/profile - Update username, name, and bio
router.put('/profile', authenticateUser, async (req, res) => {
  const { username, name, bio } = req.body;
  const user = req.user;

  try {
    if (username && username.toLowerCase() !== user.username) {
      const cleanUsername = username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores',
        });
      }

      const RESERVED = ['api', 'auth', 'ide', 'explore', 'login', 'signup', 'settings', 'u', 'snippets', 'null', 'undefined'];
      if (RESERVED.includes(cleanUsername)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Username '${cleanUsername}' is reserved`,
        });
      }

      const existing = await User.findOne({ username: cleanUsername });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(409).json({ error: 'Conflict', message: 'Username is already taken' });
      }

      user.username = cleanUsername;
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim().slice(0, 50);
    }

    if (typeof bio === 'string') {
      user.bio = bio.slice(0, 250);
    }

    await user.save();
    res.json({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

export default router;
