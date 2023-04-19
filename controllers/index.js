import express from 'express'

import  apiRoutes from './api/index.js';
import  homeRoutes from './homeRoutes.js';
const router = express.Router();

router.use('/', homeRoutes);
router.use('/api', apiRoutes);

export default router;
