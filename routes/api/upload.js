const express = require('express');
const router = express.Router();
const Log = require('../../models').Log;
const User = require('../../models').User;
const Session = require('../../models').Session;


router.get('/', async (req, res) => {
    console.log(req.query);
    try {
        // Check if user exists
        let user = await User.findOne({ where: { email: req.query.eml } });
        console.log('User: ', user);

        // If no user, send forbidden response
        if (!user) {
            res.send(403, 'Invalid user account.');
            return;
        }
        //Check if session already exists
        let session = await Session.findOrCreate({
            where: { sessionId: req.query.session } ,
            defaults: {
                userId: user.id
            }
        });
        console.log('Session: ', session);
        // Create log in database
        let log = await Log.create({
            sessionId: session[0].dataValues.id,
            timestamp: req.query.time,
            engineRPM: req.query.kc,
            speed: req.query.kd,
            gpsLongitude: req.query.kff1005,
            gpsLatitude: req.query.kff1006,
        });
        console.log("Log:", log);
        if (log) res.sendStatus(200);
    } catch (err) {
        console.log(err.message);
    }
});

module.exports = router;