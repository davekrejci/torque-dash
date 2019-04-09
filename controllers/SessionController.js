const Session = require('../models').Session;
const User = require('../models').User;

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
            // Check if user exists
            let user = await User.findOne({
                where: { id: req.user.id }
            });
            if(!user) return res.status(401);
    
            // Get session for user
            let session = await Session.findOne({
                where: { 
                    userId: user.id ,
                    sessionId: req.params.sessionId
                },
                include: [ {all: true} ]
            });
            if(!session) return res.status(404).send('Resource not found');
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
                include: [ {all: true} ]
            });
            res.send(sessions);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
}

module.exports = SessionController;