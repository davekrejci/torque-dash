// Authentication middleware

function authenticate(req, res, next) {
    // User is allowed, proceed to the next middleware/controller
    if(req.isAuthenticated()) {
        return next();
    }
    // User is not allowed, redirect to login
    res.redirect('/login');
}

module.exports = authenticate;