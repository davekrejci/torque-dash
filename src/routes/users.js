const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../models').User;

router.post('/register', async (req, res) => {
    try{

        // Validate if user data ok
        const { error } = validateUser(req.body);
        console.log(error);
        if(error) res.render('register', {
            error: error.message
        });
        let { email, password } = req.body;
        console.log(email,password);

        // Check if user is already registered
        let user = await User.findOne({
            where: { email: email }
        });
        if(user) res.render('register', {
            error: 'Email is already registered'
        });
    
        // Hash password before saving to db
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        // Save new user to db
        user = await User.create({
            email: email,
            password: password
        });

        // Send response
        res.render('login', {
            success: 'Account created. You may now log in.'
        });
    }
    catch(err){
        console.log('Error:', err);
    }
});
router.post('/login', async (req, res) => {
    try{
        // Check if user exists
        let user = await User.findOne({
            where: { email: req.body.email }
        });
        console.log('found user:', user);
        if(!user){
            res.render('login', {
                error: 'Invalid email or password.'
            });
        } 
        else{
            // Validate password
            let validPassword = await bcrypt.compare(req.body.password, user.password);
            if(!validPassword){
                res.render('login', {
                    error: 'Invalid email or password.'
                })
            }
            
            // Send response
            res.send(true);
        }
    }
    catch(err){
        console.log('Error:', err.message);
    }
});

function validateUser(user){
    const schema = {
        email: Joi.string().required().email({ minDomainAtoms: 2 }).error(new Error('Please provide a valid email.')),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password'))
    }
    return Joi.validate(user, schema);
}

module.exports = router;