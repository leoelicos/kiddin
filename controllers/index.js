/*
 * Just Kidding
 * controllers/index.js
 * This script contains the necessary code to delegate the '/' routes and the '/api/' routes
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

const router = require('express').Router();

const apiRoutes = require('./api');
const homeRoutes = require('./homeRoutes');

router.use('/', homeRoutes);
router.use('/api', apiRoutes);

module.exports = router;
