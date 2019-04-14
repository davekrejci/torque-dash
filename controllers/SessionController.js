const Session = require('../models').Session;
const Log = require('../models').Log;
const User = require('../models').User;
const sequelize = require('../models').sequelize;
const moment = require('moment');
const shortid = require('shortid');

class SessionController {
    static async delete(req, res) {
        try{
            let userId = req.user.id;
            let sessionId = req.params.sessionId
            let session = await Session.destroy({ where: {id: sessionId, userId: userId } });
            if(!session) return res.status(401).send('Session not found');
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    static async getOne(req, res) {
        try{
            // Get session for user
            let session = await Session.findOne({
                where: { 
                    userId: req.user.id ,
                    id: req.params.sessionId
                },
                include: [ { model: Log, as: 'Logs' } ],
                order: [[ {model: Log, as: 'Logs'}, 'timestamp', 'ASC' ]]
            });
            if(!session) return res.status(404).send('Resource not found');
            await addStartEndData(session)
            res.send(session);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    static async getAll(req, res) {
        try {
            // Check if user exists
            let user = await User.findOne({
                where: { id: req.user.id }
            });
            if(!user) return res.status(401);

            // Get all sessions for user
            let sessions = await Session.findAll({
                where: { userId: user.id },
                // Include array of logs from session
                include: [ { model: Log, as: 'Logs' } ],
                order: [[ {model: Log, as: 'Logs'}, 'timestamp', 'ASC' ]]
            });
            res.send(sessions);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    static async rename(req, res) {
        try {
            await Session.update(
                { name: req.body.name },
                { where: { 
                    id: req.params.sessionId, 
                    userId: req.user.id 
                    } 
                }
            )
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    static async addLocation(req, res) {
        try {
            await Session.update(
                { startLocation: req.body.locations.start,
                  endLocation: req.body.locations.end },
                { where: { 
                    id: req.params.sessionId, 
                    userId: req.user.id 
                    } 
                }
            )
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    static async copy(req, res) {
        try {
            await sequelize.transaction( async (t) => {
                // find the session
                let session = await Session.findOne({
                    where: { 
                        userId: req.user.id,
                        id: req.params.sessionId
                        },
                        include: {all:true}
                });
                // Create a copy of the session
                let sessionCopy = await Session.create({
                    sessionId: shortid.generate(),
                    name: req.body.name,
                    startLocation: session.startLocation,
                    endLocation: session.endLocation,
                    userId: session.userId
                });
                console.log(session);
                // Create copy for each session log
                await Promise.all(session.Logs.map(async log => {
                    console.log(log);
                    try{
                        console.log('original timestamp:', log.timestamp);
                        let newlog = await Log.create({
                            sessionId: sessionCopy.id,
                            timestamp: log.dataValues.timestamp,
                            lon: log.dataValues.lon,
                            lat: log.dataValues.lat,
                            values: log.dataValues.values
                        });
                        console.log('new timestamp:', newlog.timestamp);
                    }
                    catch (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                  }));
            });
            console.log('sending response');
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
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

module.exports = SessionController;