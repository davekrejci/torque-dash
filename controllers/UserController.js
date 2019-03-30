const User = require('../models').User;
const passport = require('passport');

class UserController {
    static async login(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
        })(req, res, next);
    }
    static logout(req, res) {
        req.logout();
        req.flash('success', 'You have been logged out.');
        res.redirect('/login');
    }
    static async register(req, res) {
        try {
            // Get userdata from request
            let { email, password } = req.body;

            // Validate if user data ok
            const { error } = User.validate(req.body);
            if (error) return res.render('register', { error: error.message });

            // Check if user is already registered
            let user = await User.findOne({ where: { email: email } });
            if (user) return res.render('register', { error: 'This email is already registered' });

            // Save new user to db
            user = await User.create({ email: email, password: password });

            // Send response
            req.flash('success', 'Account created. You may now log in.');
            return res.redirect('/login');

        } catch (err) {
            console.log('Error:', err.message);
        }
    }
}

module.exports = UserController;