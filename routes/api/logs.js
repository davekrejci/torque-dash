const express = require('express');
const router = express.Router();
const Log = require('../../models').Log;

router.get('/', async (req, res) => {
    let logs = await Log.findAll();
    console.log(logs);
    res.json(logs);
})

module.exports = router;