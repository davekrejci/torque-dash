const Joi = require('joi');
const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCreate: hashPassword,
        }
    }
    );
    // create association
    User.associate = function (models) {
        User.hasMany(models.Session, {
            as: 'Sessions',
            foreignKey: 'userId',
            onDelete: 'cascade'
        });
    };

    // Static method for user data validation
    User.validate = function(user) {
        const schema = {
            email: Joi.string().required().email({ minDomainAtoms: 2 }).error(new Error('Please provide a valid email.')),
            password: Joi.string().min(8).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).error(new Error('Passwords do not match.'))
        }
        return Joi.validate(user, schema);
    }

    // Instance method for password comparison
    User.prototype.comparePassword = async function(password) {
        return await bcrypt.compare(password, this.password)
    }

    return User;
}
    
async function hashPassword (user) {
     // Hash password before saving to db
     const SALT_FACTOR = 8;
     const salt = await bcrypt.genSalt(SALT_FACTOR);
     let hash = await bcrypt.hash(user.password, salt);
     await user.setDataValue('password', hash);
}