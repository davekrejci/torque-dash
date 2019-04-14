const Log = require('../models').Log;
const User = require('../models').User;
const moment = require('moment');

class PageController {
    static async renderOverview(req, res) {
        try{
            let user = await User.findOne({ where: { email: req.user.email }});
            let sessions = await user.getSessions();
            await addStartEndData(sessions)
            
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
    }
    static async renderMapview(req, res) {
        try{
            let user = await User.findOne({ where: { email: req.user.email }});
            let sessions = await user.getSessions();
            await addStartEndData(sessions)        
            
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
    }
    static async renderLogin(req, res) {
        if (req.user) {
            // user already logged in
            res.redirect('/overview');
        } else {
            // not logged in
            res.render('login');
        }
    }
    static async renderRegister(req, res) {
        res.render('register', {
            register: true
        });
    }
    static async renderEdit(req, res) {
        try{
            res.render('edit', {
                dashboard: true,
                edit: true,
                userEmail: req.user.email,
                loggedIn: true
            });
        }
        catch(err) {
            console.log(err);
        }
    }
}

async function addStartEndData(sessions) {
    if(Array.isArray(sessions)){
        for (const session of sessions) {
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
            let duration = moment.duration(lastLog[0].timestamp - firstLog[0].timestamp);
    
            session.dataValues.startDate = moment(firstLog[0].timestamp).format('DD.MM.YYYY HH:mm:ss');
            session.dataValues.endDate = moment(lastLog[0].timestamp).format('DD.MM.YYYY HH:mm:ss');
            session.dataValues.duration = {
                days: duration.days(),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds()
            };
        }
    }
    else {
        const firstLog = await Log.findAll({
            limit: 1,
            where: {
                sessionId: sessions.id
            },
            order: [ [ 'timestamp', 'ASC' ]]
            });
        const lastLog = await Log.findAll({
            limit: 1,
            where: {
                sessionId: sessions.id
            },
            order: [ [ 'timestamp', 'DESC' ]],
        });
        let duration = moment.duration(lastLog[0].timestamp - firstLog[0].timestamp);

        sessions.dataValues.startDate = moment(firstLog[0].timestamp).format('DD.MM.YYYY HH:mm:ss');
        sessions.dataValues.endDate = moment(lastLog[0].timestamp).format('DD.MM.YYYY HH:mm:ss');
        sessions.dataValues.duration = {
            days: duration.days(),
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    }
}

module.exports = PageController;