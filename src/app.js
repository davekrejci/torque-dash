// Add module dependencies
const express = require('express');
const app = express();
const path = require('path');
// const morgan = require('morgan');
const dashboard = require('./routes/dashboard.js');
const login = require('./routes/login.js');
const register = require('./routes/register.js');
const upload = require('./routes/upload.js');
const logs = require('./routes/logs.js');
const users = require('./routes/users.js');
const { sequelize } = require('./models');
const config = require('./config/config');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport); 


// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(morgan('combined'));

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
app.use('/', dashboard);
app.use('/login', login);
app.use('/register', register);
app.use('/upload', upload);
app.use('/logs', logs);
app.use('/users', users);

// Connect to database and sync models
sequelize.sync({force: true})
    .then(() => {
        console.log('Connection to database successfully established');  
        
        // Start server
        app.listen(config.port, () => console.log(`Listening on port ${config.port}`));

    }).catch((err) => {
        console.log('Error connecting to the database:', err.message);
    });


