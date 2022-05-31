const router = require('express').Router();
const { Thread } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
    try {
        const threadData = await Thread.findAll();

        const threads = threadData.map((thread) => thread.get({ plain: true }));

        res.render('homepage', {
            threads,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/thread/:id', withAuth, async (req, res) => {
    try {
        const threadData = await Thread.findByPk(req.params.id);

        const threads = threadData.get({ plain: true });

        res.render('threads', {
            ...threads,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});


router.get('/login', (req, res) => {

    if (req.session.logged_in) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

module.exports = router;
