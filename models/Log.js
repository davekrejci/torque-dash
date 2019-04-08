const axios = require('axios');
const keysMap = require('../torquekeys');
const util = require('../util/util');

module.exports = (sequelize, DataTypes) => {
    // define Log
    const Log = sequelize.define('Log', {
        timestamp: {
            type: 'TIMESTAMP'
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
                values = util.renameKeys(keysMap, values);
                return values;
              },
        }
    }, {});

    // Instance method for reverse geocode - get address from coordinates
    Log.prototype.getAddress = async function() {
        try{
            let response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.gpsLatitude}&lon=${this.gpsLongitude}`);
            return response.data.address
        }
        catch(err){
            console.log(err.message);
        }
    }

    return Log;
};