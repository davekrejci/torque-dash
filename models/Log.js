const axios = require('axios');

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
            type: DataTypes.JSONB
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