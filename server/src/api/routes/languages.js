import { Router } from 'express';
import { getAllLanguages } from '../../languages/index.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getAllLanguages());
});

export default router;
