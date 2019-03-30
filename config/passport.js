const LocalStrategy = require('passport-local');
const User = require('../models').User;

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            // Search if user in db
            let user;
            try{
                user = await User.findOne({ where: { email: email }}) 
                if(!user){
                    return done(null, false, { message: 'Incorrect username or password.' });
                }
            }
            catch(err){ console.log(err); }

            // Compare password
            let isMatch = await user.comparePassword(password);
            if(isMatch){
                return done(null, user);
            }
            else{
                return done(null, false, { message: 'Incorrect username or password.' });
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
    passport.deserializeUser(async (id, done) => {
        let user = await User.findByPk(id);
        if(user){
            done(null, user.get());
        }
        else{
            done(user.errors, null);
        }
    });
}