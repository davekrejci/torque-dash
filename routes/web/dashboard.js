const express = require('express');
const router = express.Router();
const authenticate = require('../../config/auth');
const Log = require('../../models').Log;


router.get('/', (req, res) => {
    res.redirect('/dashboard')
});

router.get('/dashboard', authenticate, (req, res) => {
    res.render('dashboard', {
        dashboard: true,
        overview: true,
        userEmail: req.user.email,
        loggedIn: true
    });
});

router.get('/dashboard/tableview', authenticate, async (req, res) => {
    let logs = await Log.findAll();
    console.log(logs);
    res.render('tableview', {
        logs: logs,
        dashboard: true,
        tableview: true,
        userEmail: req.user.email,
        loggedIn: true
    });
});

router.get('/dashboard/mapview', authenticate, (req, res) => {
    res.render('mapview', {
        dashboard: true,
        mapview: true,
        userEmail: req.user.email,
        loggedIn: true
    });
});


module.exports = router;