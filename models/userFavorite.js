// //models/userFavorite.js
// 'use strict';

// const { Model, UUIDV4 } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   class UserFavorite extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // User can have many favorites
//       UserFavorite.belongsTo(models.User, {
//         foreignKey: 'userId',
//         as: 'user'
//       });

//       // Each favorite belongs to a community
//       UserFavorite.belongsTo(models.Community, {
//         foreignKey: 'communityId',
//         as: 'community'
//       });
//     }
//   }

//   UserFavorite.init({
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: UUIDV4,
//       allowNull: false,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'Users',
//         key: 'id'
//       },
//       onDelete: 'CASCADE'
//     },
//     communityId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'Communities',
//         key: 'id'
//       },
//       onDelete: 'CASCADE'
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     }
//   }, {
//     sequelize,
//     modelName: 'UserFavorite',
//     tableName: 'UserFavorites',
//     // Ensure a user can't favorite the same community twice
//     indexes: [
//       {
//         unique: true,
//         fields: ['userId', 'communityId']
//       }
//     ]
//   });

//   return UserFavorite;
// };





// models/userFavorite.js - Safe migration version
'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFavorite extends Model {
    static associate(models) {
      // User can have many favorites
      UserFavorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Each favorite can belong to a community
      UserFavorite.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });

      // Each favorite can belong to a connector
      UserFavorite.belongsTo(models.Connector, {
        foreignKey: 'connectorId',
        as: 'connector'
      });
    }
  }

  UserFavorite.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: true, // Made nullable since we can have either community or connector
      references: {
        model: 'Communities',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    connectorId: {
      type: DataTypes.UUID,
      allowNull: true, // Made nullable since we can have either community or connector
      references: {
        model: 'Connectors',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    favoriteType: {
      type: DataTypes.ENUM('community', 'connector'),
      allowNull: false,
      defaultValue: 'community' // Add default value to help with migration
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'UserFavorites',
    // Remove the complex indexes for now - we'll add them manually via SQL
    // The unique constraints will be handled by the SQL migration above
    validate: {
      eitherCommunityOrConnector() {
        if (!this.communityId && !this.connectorId) {
          throw new Error('Either communityId or connectorId must be provided');
        }
        if (this.communityId && this.connectorId) {
          throw new Error('Cannot favorite both community and connector in the same record');
        }
      }
    }
  });

  return UserFavorite;
};