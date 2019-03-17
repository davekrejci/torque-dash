module.exports = (sequelize, DataTypes) => 
    sequelize.define('Log', {
        eml: {
            type: DataTypes.STRING(50)
        },
        v: {
            type: DataTypes.STRING(1)
        },
        session: {
            type: DataTypes.STRING(15)
        },
        t_id: {
            type: DataTypes.STRING(32)
        },
        time: {
            type: DataTypes.STRING(15)
        },
        kc: {
            type: DataTypes.FLOAT
        },
        kd: {
            type: DataTypes.FLOAT
        },

    });