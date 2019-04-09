// Authentication middleware

function authenticate(req, res, next) {
    if(req.isAuthenticated()) {
        // User is authenticated, proceed to the next middleware/controller
        return next();
    }
    // User is not authenticated, redirect to login
    res.redirect('/login');
}

module.exports = authenticate;