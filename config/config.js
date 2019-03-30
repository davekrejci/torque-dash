let config = {
    port: process.env.PORT || 3000,
    db: {
        uri: process.env.DATABASE_URL || 'postgres://postgres:heslo@localhost:5432/torquedash',
        options: {
            operatorsAliases: false,
            logging: false
        }
    }
};

module.exports = config;