// Add module dependencies
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
// const logger = require('morgan');
const { sequelize } = require('./models');
const config = require('./config/config');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('cookie-session');
const passport = require('passport');
const User = require('./models').User;
require('./config/passport')(passport); 

// Configure middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(logger('combined'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Set templating engine
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

// Define routes
app.use('/', require('./routes/web/dashboard.js'));
app.use('/login', require('./routes/web/login.js'));
app.use('/register', require('./routes/web/register.js'));
app.use('/upload', require('./routes/api/upload.js'));
app.use('/sessions', require('./routes/api/sessions.js'));
app.use('/users', require('./routes/api/users.js'));

// Connect to database and sync models
sequelize.sync(
    {force:true}
    )
    .then(() => {
        console.log('Connection to database successfully established');  
        
        User.create({
            email: 'test@contoso.com',
            password : 'heslo'
        });

        // Start server
        app.listen(config.port, () => console.log(`Listening on port ${config.port}`));

    }).catch((err) => {
        console.log('Error connecting to the database:', err.message);
    });


