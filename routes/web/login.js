const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.user) {
        // user already logged in
        res.redirect('/dashboard');
    } else {
        // not logged in
        res.render('login');
    }
})

module.exports = router;