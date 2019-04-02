const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const User = require('../../models').User;
const Session = require('../../models').Session;

// Get all user sessions
router.get('/', authenticate, async (req, res) => {

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
});

router.get('/:sessionId', authenticate, async (req, res) => {

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
});

module.exports = router;