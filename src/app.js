// Add module dependencies
const express = require('express');
const app = express();
const morgan = require('morgan');
const { sequelize } = require('./models');
const config = require('./config/config');

// Configure middleware
app.use(express.json());
app.use(morgan('combined'));

// Connect to database
sequelize.sync()
    .then(() => {
        console.log('Connection to database successfully established');        
    }).catch((err) => {
        console.log('Error connecting to the database:', err);
    });

// Start server
app.listen(config.port, () => console.log(`Listening on port ${config.port}`));

