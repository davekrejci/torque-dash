const pidNames = require('../torquekeys');
const util = require('../util/util');

module.exports = (sequelize, DataTypes) => {
    // define Log
    const Log = sequelize.define('Log', {
        timestamp: {
            type: DataTypes.DATE
        },
        lon : {
            type: DataTypes.FLOAT
        },
        lat: {
            type: DataTypes.FLOAT
        },
        values: {
            type: DataTypes.JSONB,
            // convert keys to names when pulling out of db
            get: function()  {
                var values = this.getDataValue('values'); 
                values = util.renameKeys(pidNames, values);
                return values;
              },
        }
    }, {});

    return Log;
};