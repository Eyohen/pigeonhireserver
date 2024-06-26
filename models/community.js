'use strict';


const {Model, UUIDV4} = require('sequelize');



// interface CommunityAttributes {
//  id: string;
//  name:string;
//  description:string;
//  communityType:string;
//  location:string;
//  size:string;
//  communityInterest:string;
//  engagementLevel:string;
//  communicationPlatform:string;
//  communityGoal:string;
//  accessType:string;
//  prevCollabType:string;
//  imageUrl:string;
//  usp:string;
//  recognition:string;
//  additionalService:string;
//  whatsapp:string;
//  telegram:string;
//  twitter:string;
//  user:string;

//}


module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

   
 
    static associate(models) {
      // define association here
//       Community.hasOne(models.USER, {
//         foreignKey: 'CommunityId',
//         as: 'Community'
//       }
//   ),
//   Community.hasOne(models.User, {
//     foreignKey: 'CommunityId',
//     as: 'User'
//   }
// )
// Community.hasMany(models.CollaborationType, {
//   foreignKey: 'communityId',
//   as: 'CollaborationType'
// }
// );
    }
  }
  Community.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    communityType: {
        type: DataTypes.STRING,
        allowNull: false
      },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        // defaultValue:"Standard",
      },
    size: {
        type: DataTypes.STRING,
        allowNull: false
      },
    communityInterest: {
          type: DataTypes.STRING,
          allowNull: false
        },
    engagementLevel: {
            type: DataTypes.STRING,
            allowNull: false
          },
    communicationPlatform: {
          type: DataTypes.STRING,
          allowNull: false
        },
    communityGoal: {
            type: DataTypes.STRING,
            allowNull: false
          },
    accessType: {
            type: DataTypes.STRING,
            allowNull: false,
            // defaultValue:"Standard",
          },
    prevCollabType: {
              type: DataTypes.STRING,
              allowNull: true
            },
    imageUrl: {
                type: DataTypes.STRING,
                allowNull: true
              },
    usp: {
              type: DataTypes.STRING,
              allowNull: true
            },
    recognition: {
                type: DataTypes.STRING,
                allowNull: true
              },
    additionalService: {
                type: DataTypes.STRING,
                allowNull: true,
                // defaultValue:"Standard",
              },
    whatsapp: {
                type: DataTypes.STRING,
                allowNull: true
              },
    telegram: {
                  type: DataTypes.STRING,
                  allowNull: true
                },
    twitter: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
               

  }, {
    sequelize,
    modelName: 'Community',
  });
  return Community;
};