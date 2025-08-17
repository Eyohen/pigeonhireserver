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









// models/userFavorite.js - CORRECTED VERSION
// Replace your existing userFavorite.js file with this content

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
      allowNull: true, // CRITICAL: Must be nullable for connector favorites
      references: {
        model: 'Communities',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    connectorId: {
      type: DataTypes.UUID,
      allowNull: true, // CRITICAL: Must be nullable for community favorites
      references: {
        model: 'Connectors',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    favoriteType: {
      type: DataTypes.ENUM('community', 'connector'),
      allowNull: false,
      validate: {
        isIn: [['community', 'connector']]
      }
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
    
    // Custom validation to ensure either communityId OR connectorId is provided
    validate: {
      eitherCommunityOrConnector() {
        if (!this.communityId && !this.connectorId) {
          throw new Error('Either communityId or connectorId must be provided');
        }
        if (this.communityId && this.connectorId) {
          throw new Error('Cannot favorite both community and connector in the same record');
        }
        
        // Ensure favoriteType matches the provided ID
        if (this.communityId && this.favoriteType !== 'community') {
          throw new Error('favoriteType must be "community" when communityId is provided');
        }
        if (this.connectorId && this.favoriteType !== 'connector') {
          throw new Error('favoriteType must be "connector" when connectorId is provided');
        }
      }
    },

    // Custom indexes (Sequelize will create these)
    indexes: [
      // Unique constraint for community favorites
      {
        unique: true,
        fields: ['userId', 'communityId'],
        where: {
          communityId: {
            [sequelize.Sequelize.Op.ne]: null
          }
        },
        name: 'user_community_favorite_unique'
      },
      // Unique constraint for connector favorites
      {
        unique: true,
        fields: ['userId', 'connectorId'],
        where: {
          connectorId: {
            [sequelize.Sequelize.Op.ne]: null
          }
        },
        name: 'user_connector_favorite_unique'
      },
      // Index for faster lookups by favoriteType
      {
        fields: ['favoriteType']
      },
      // Index for faster lookups by userId and favoriteType
      {
        fields: ['userId', 'favoriteType']
      }
    ],

    // Hooks to automatically set favoriteType based on which ID is provided
    hooks: {
      beforeValidate: (favorite, options) => {
        // Auto-set favoriteType if not provided
        if (!favorite.favoriteType) {
          if (favorite.communityId) {
            favorite.favoriteType = 'community';
          } else if (favorite.connectorId) {
            favorite.favoriteType = 'connector';
          }
        }
      }
    }
  });

  return UserFavorite;
};