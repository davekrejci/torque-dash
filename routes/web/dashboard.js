const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const Log = require('../../models').Log;
const User = require('../../models').User;
const moment = require('moment');

router.get('/', (req, res) => {
    res.redirect('/dashboard')
});

router.get('/dashboard', authenticate, async (req, res) => {
    
    let user = await User.findOne({ where: { email: req.user.email }});
    let sessions = await user.getSessions();

    let sessionList = [];
    async function getPageData() {
        for (const session of sessions) {
            const sessionStart = await Log.min('timestamp', { where: {sessionId: session.id}});
            const sessionEnd = await Log.max('timestamp', { where: {sessionId: session.id}});            
            const firstLog = await Log.findOne({ where: {timestamp: sessionStart }});
            const lastLog = await Log.findOne({ where: {timestamp: sessionEnd }});
            let duration = moment.duration(sessionEnd - sessionStart);


            sessionList.push({
                id: session.id,
                name: session.name,
                startDate: moment(+sessionStart).format("DD.MM.YYYY HH:mm:ss"),
                endDate: moment(+sessionEnd).format("DD.MM.YYYY HH:mm:ss"),
                duration: {
                    days: duration.days(),
                    hours: duration.hours(),
                    minutes: duration.minutes(),
                    seconds: duration.seconds()
                },
                startLocation: await firstLog.getAddress(),
                endLocation: await lastLog.getAddress()
            });
        }
    }
    await getPageData();
    
    res.render('dashboard', {
        sessions: sessionList,
        dashboard: true,
        overview: true,
        userEmail: req.user.email,
        loggedIn: true
    });
});

router.get('/dashboard/mapview', authenticate, async (req, res) => {
    //Get sessions from db

    // TODO: move functionality to model 
    // let sessions = Log.getUserSessions(req.user);

    var sessions = [];
    
    res.render('mapview', {
        dashboard: true,
        mapview: true,
        sessions: sessions,
        userEmail: req.user.email,
        loggedIn: true
    });
});

router.get('/dashboard/chartview', authenticate, async (req, res) => {
    //Render view
    res.render('chartview', {
        dashboard: true,
        chartview: true,
        userEmail: req.user.email,
        loggedIn: true
    });
});


module.exports = router;