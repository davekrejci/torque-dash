const express = require('express');
const router = express.Router();
const Log = require('../../models').Log;
const User = require('../../models').User;
const Session = require('../../models').Session;


router.get('/', async (req, res) => {
    try {
        // Check if user exists
        let user = await User.findOne({ where: { email: req.query.eml } });

        // If no user, send forbidden response
        if (!user) return res.status(403).send('Invalid user account.');
            
        //Check if session already exists or create new
        let session = await Session.findOrCreate({
            where: { sessionId: req.query.session } ,
            defaults: {
                userId: user.id
            }
        });
        //Check if timestamp already exists as torque app is spamming multiple requests
        let log = await Log.findOne({
            where: { 
                sessionId: session[0].dataValues.id ,
                timestamp: req.query.time,
            }
        });
        if(log) return res.status(403).send('Duplicate entry.');

        // Create log in database
        log = await Log.create({
            sessionId: session[0].dataValues.id,
            timestamp: req.query.time,
            engineRPM: req.query.kc,
            speed: req.query.kd,
            gpsLongitude: req.query.kff1005,
            gpsLatitude: req.query.kff1006,
        });
        if (log) res.status(200).send('OK!');
    } catch (err) {
        console.log(err.message);
    }
});

module.exports = router;