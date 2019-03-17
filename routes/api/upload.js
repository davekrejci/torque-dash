const express = require('express');
const router = express.Router();
const Log = require('../../models').Log;


router.get('/', async (req, res) => {
    try{
        let log = await Log.create({
            eml: req.query.eml,
            v: req.query.v,
            session: req.query.session,
            t_id: req.query.id,
            time: req.query.time,
            kc: req.query.kc,
            kd: req.query.kd
        });
        console.log(log);
        res.sendStatus(200);
    }
    catch(err){
        console.log(err.message);
    }
})

module.exports = router;