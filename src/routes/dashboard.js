const express = require('express');
const router = express.Router();
const authenticate = require('../config/auth');

router.get('/', (req, res) => {
    res.redirect('/dashboard')
});

router.get('/dashboard', authenticate, (req, res) => {
    res.render('dashboard', {
        realtime: true
    });
});

module.exports = router;