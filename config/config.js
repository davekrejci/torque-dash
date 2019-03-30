let config = {
    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME || 'torquedash',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'heslo',
        options: {
            dialect: process.env.DIALECT || 'postgres',
            host: process.env.HOST || 'localhost',
            operatorsAliases: false,
            logging: true
        }
    }
};

module.exports = config;