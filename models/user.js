// 'use strict';

// const { Model, UUIDV4 } = require('sequelize');


// module.exports = (sequelize, DataTypes) => {
//   class User extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */

//     static associate(models) {
//       // define association here

//        // User can have many favorites
//       User.hasMany(models.UserFavorite, {
//         foreignKey: 'userId',
//         as: 'favorites'
//       });


//           // User can have many subscriptions
//       User.hasMany(models.Subscription, {
//         foreignKey: 'userId',
//         as: 'subscriptions'
//       });


//         // New analytics associations
//       User.hasOne(models.UserAnalytics, {
//         foreignKey: 'userId',
//         as: 'analytics'
//       });

//       User.hasMany(models.ContactLog, {
//         foreignKey: 'userId',
//         as: 'contacts'
//       });

//       User.hasMany(models.ProfileView, {
//         foreignKey: 'userId',
//         as: 'profileViews'
//       });

//       User.hasMany(models.Lead, {
//         foreignKey: 'userId',
//         as: 'leads'
//       });

//       User.hasMany(models.Network, {
//         foreignKey: 'userId',
//         as: 'networks'
//       });

//       // User can write reviews
//       User.hasMany(models.Review, {
//         foreignKey: 'reviewerId',
//         as: 'writtenReviews'
//       });

//       // User can receive reviews
//       User.hasMany(models.Review, {
//         foreignKey: 'userId',
//         as: 'receivedReviews'
//       });

//     }
//   }

//   User.init({
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: UUIDV4,
//       allowNull: false,
//       primaryKey: true,
  
//     },
//     restrict: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//   },
//   subscribed: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//     firstName: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     lastName: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     location: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     rating: {
//       type: DataTypes.FLOAT,
//       allowNull: true,
//       defaultValue: 5
//       },
//     review: {
//       type: DataTypes.ARRAY(DataTypes.STRING), 
//       allowNull: true
//         },
//     recognition: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     twitter: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     telegram: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     whatsapp: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     linkedin: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     currency: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       defaultValue:'USD'
//     },
//     role: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         defaultValue:'user'
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     verified: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//   },
//   verificationToken: {
//       type: DataTypes.STRING,
//       allowNull: true,
//   },
//   resetPasswordOTP:{
//     type:DataTypes.STRING,
//     allowNull:true
//   },
//   resetPasswordToken:{
//     type: DataTypes.STRING,
//     allowNull:true
//   },

//   resetPasswordExpires:{
//     type: DataTypes.DATE,
//     allowNull:true
//   },
//   stripeCustomerId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       unique: true
//     },

//   }, {
//     sequelize,
//     modelName: 'User',
//   });

//   return User;
// };





// models/user.js - Complete User model with all associations
'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Existing associations
      User.hasMany(models.UserFavorite, {
        foreignKey: 'userId',
        as: 'favorites'
      });
      
      User.hasMany(models.Subscription, {
        foreignKey: 'userId',
        as: 'subscriptions'
      });

      // Analytics associations
      User.hasOne(models.UserAnalytics, {
        foreignKey: 'userId',
        as: 'analytics'
      });

      User.hasMany(models.ContactLog, {
        foreignKey: 'userId',
        as: 'contacts'
      });

      User.hasMany(models.ProfileView, {
        foreignKey: 'userId',
        as: 'profileViews'
      });

      User.hasMany(models.Lead, {
        foreignKey: 'userId',
        as: 'leads'
      });

      User.hasMany(models.Network, {
        foreignKey: 'userId',
        as: 'networks'
      });

      // Review associations
      User.hasMany(models.Review, {
        foreignKey: 'reviewerId',
        as: 'writtenReviews'
      });

      User.hasMany(models.Review, {
        foreignKey: 'userId',
        as: 'receivedReviews'
      });

      // Community and Connector ownership
      User.hasMany(models.Community, {
        foreignKey: 'userId',
        as: 'ownedCommunities'
      });

      User.hasMany(models.Connector, {
        foreignKey: 'userId',
        as: 'ownedConnectors'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    restrict: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 5
    },
    review: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    recognition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telegram: {
      type: DataTypes.STRING,
      allowNull: true
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordOTP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
