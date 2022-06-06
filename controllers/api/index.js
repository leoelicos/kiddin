/*
 * Just Kidding
 * controllers/api/index.js
 * This script contains the necessary code to implement the /api/routes
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

const router = require('express').Router();
const postRoutes = require('./postRoutes');
const userRoutes = require('./userRoutes');

router.use('/posts', postRoutes);
router.use('/users', userRoutes);

module.exports = router;
