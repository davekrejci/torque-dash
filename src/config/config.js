let config = {
    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME || 'torque-dash',
        user: process.env.DB_USER || 'dave',
        password: process.env.DB_PASS || 'heslo',
        options: {
            dialect: process.env.DIALECT || 'mysql',
            host: process.env.HOST || 'localhost',
            operatorsAliases: false,
            logging: false
        }
    }
};

module.exports = config;