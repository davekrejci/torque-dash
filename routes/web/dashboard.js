const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const Log = require('../../models').Log;
const Session = require('../../models').Session;
const User = require('../../models').User;
const moment = require('moment');

router.get('/', (req, res) => {
    res.redirect('/dashboard')
});

router.get('/dashboard', authenticate, async (req, res) => {
    
    try{
        let user = await User.findOne({ where: { email: req.user.email }});
        let sessions = await user.getSessions();
        sessions = await getPageData(sessions);
        
        res.render('dashboard', {
            sessions: sessions,
            dashboard: true,
            overview: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    catch(err) {
        console.log(err);
    }
});

router.get('/dashboard/mapview', authenticate, async (req, res) => {
    //Get sessions from db

    try{
        let user = await User.findOne({ where: { email: req.user.email }});
        let sessions = await user.getSessions();
        sessions = await getPageData(sessions);
        
        res.render('mapview', {
            dashboard: true,
            mapview: true,
            sessions: sessions,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    catch(err) {
        console.log(err);
    }
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

async function getPageData(sessions) {
    let sessionList = new Array;
    for (const session of sessions) {
        // const sessionStart = await Log.min('timestamp', { where: {sessionId: session.id}});
        // const sessionEnd = await Log.max('timestamp', { where: {sessionId: session.id}});            
        const firstLog = await Log.findAll({
            limit: 1,
            where: {
                sessionId: session.id
            },
            order: [ [ 'timestamp', 'ASC' ]]
            });
        const lastLog = await Log.findAll({
            limit: 1,
            where: {
                sessionId: session.id
            },
            order: [ [ 'timestamp', 'DESC' ]],
        });
        console.log('first', firstLog);
        console.log('last', lastLog);
        let duration = moment.duration(lastLog[0].timestamp - firstLog[0].timestamp);

        sessionList.push({
            id: session.id,
            name: session.name,
            startDate: moment(firstLog[0].timestamp).format('DD.MM.YYYY hh:mm:ss'),
            endDate: moment(lastLog[0].timestamp).format('DD.MM.YYYY hh:mm:ss'),
            duration: {
                days: duration.days(),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds()
            },
            // startLocation: await firstLog.getAddress(),
            // endLocation: await lastLog.getAddress()
        });
    }
    console.log(sessionList);
    return sessionList;
}


module.exports = router;