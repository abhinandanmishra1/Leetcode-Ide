import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addSubmission, getSubmission } from '../../queue/producer.js';
import { getLanguageById, getStatusById } from '../../languages/index.js';
import { decodeIfNeeded, encodeIfNeeded } from '../../utils/base64.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';
import logger from '../../utils/logger.js';

const router = Router();

function formatSubmission(sub, isBase64) {
  return {
    token: sub.token,
    status: sub.status || getStatusById(1),
    stdout: encodeIfNeeded(sub.stdout, isBase64),
    stderr: encodeIfNeeded(sub.stderr, isBase64),
    compile_output: encodeIfNeeded(sub.compile_output, isBase64),
    time: sub.time || null,
    memory: sub.memory || null,
    exit_code: sub.exit_code ?? null,
  };
}

router.post('/', submissionRateLimiter, async (req, res, next) => {
  try {
    const { language_id, source_code, stdin } = req.body;
    const isBase64 = req.query.base64_encoded === 'true';
    const isWait = req.query.wait === 'true';

    const language = getLanguageById(language_id);
    if (!language) {
      return res.status(400).json({ error: 'Bad Request', message: `Unsupported language id: ${language_id}` });
    }

    const decodedSource = decodeIfNeeded(source_code, isBase64);
    const decodedStdin = decodeIfNeeded(stdin, isBase64);

    const submission = {
      token: uuidv4(),
      language_id,
      language,
      source_code: decodedSource,
      stdin: decodedStdin,
      created_at: new Date().toISOString(),
      status: getStatusById(1),
    };

    await addSubmission(submission);
    logger.info({ token: submission.token, language: language.name, id: language_id }, `📥 Queued submission [${language.name}]`);

    if (isWait) {
      const maxWait = 25000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        const result = await getSubmission(submission.token);
        if (result && result.status && result.status.id >= 3) {
          return res.json(formatSubmission(result, isBase64));
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      return res.status(504).json({ error: 'Gateway Timeout', message: 'Execution timed out' });
    }

    res.status(201).json({ token: submission.token });
  } catch (err) {
    next(err);
  }
});

router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const isBase64 = req.query.base64_encoded === 'true';
    const sub = await getSubmission(token);

    if (!sub) {
      return res.status(404).json({ error: 'Not Found', message: 'Submission not found' });
    }

    res.json(formatSubmission(sub, isBase64));
  } catch (err) {
    next(err);
  }
});

export default router;
