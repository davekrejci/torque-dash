const axios = require('axios');

module.exports = (sequelize, DataTypes) => {
    // define Log
    const Log = sequelize.define('Log', {
        timestamp: {
            type: DataTypes.STRING
        },
        engineRPM: {
            type: DataTypes.FLOAT
        },
        speed: {
            type: DataTypes.FLOAT
        },
        gpsLongitude: {
            type: DataTypes.FLOAT
        },
        gpsLatitude: {
            type: DataTypes.FLOAT
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