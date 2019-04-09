module.exports = (sequelize, DataTypes) => {
    // define Session
    const Session = sequelize.define('Session', {
        sessionId : {
            type: DataTypes.STRING,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: 'Unnamed session'
        },
        startLocation: {
            type: DataTypes.STRING,
            defaultValue: '-'
        },
        endLocation: {
            type: DataTypes.STRING,
            defaultValue: '-'
        }
    }, {});

    Session.associate = function (models) {
        Session.hasMany(models.Log, {
            as: 'Logs',
            foreignKey: { name: 'sessionId'},
            onDelete: 'cascade'
        });
    };

    return Session;
};