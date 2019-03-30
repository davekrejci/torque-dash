const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const Log = require('../../models').Log;

router.get('/', authenticate, async (req, res) => {

    let sessions = await Session.get
    let logs = await Log.findAll({
        where: { eml: req.user.email }
    });
    res.json(logs);
})

module.exports = router;