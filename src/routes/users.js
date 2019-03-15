const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../models').User;
const passport = require('passport');

// Register Handle
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
        req.flash('success', 'Account created. You may now log in.');
        res.redirect('/login');
    }
    catch(err){
        console.log('Error:', err);
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out.');
    res.redirect('/login');
});

// User data Validation
function validateUser(user){
    const schema = {
        email: Joi.string().required().email({ minDomainAtoms: 2 }).error(new Error('Please provide a valid email.')),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password'))
    }
    return Joi.validate(user, schema);
}

module.exports = router;