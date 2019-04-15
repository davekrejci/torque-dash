
class PageController {
    static async renderOverview(req, res) {
        res.render('dashboard', {
            dashboard: true,
            overview: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    static async renderMapview(req, res) { 
        res.render('mapview', {
            dashboard: true,
            mapview: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    static async renderLogin(req, res) {
        if (req.user) {
            // user already logged in
            res.redirect('/overview');
        } else {
            // not logged in
            res.render('login');
        }
    }
    static async renderRegister(req, res) {
        res.render('register', {
            register: true
        });
    }
    static async renderEdit(req, res) {
        res.render('edit', {
            dashboard: true,
            edit: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
}

module.exports = PageController;