module.exports = (sequelize, DataTypes) => {
    // define Session
    const Session = sequelize.define('Session', {
        sessionId : {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            default: ''
        },
        startLocation: {
            type: DataTypes.STRING,
            default: ''
        },
        endLocation: {
            type: DataTypes.STRING,
            default: ''
        }
    }, {});

    Session.associate = function (models) {
        Session.hasMany(models.Log, { as: 'Logs', foreignKey: 'sessionId' });
    };

    return Session;
};