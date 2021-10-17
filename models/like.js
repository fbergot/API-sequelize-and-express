'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // relation de User et Message via la table Like (grace aux clé étrangère de Like)
      models.User.belongsToMany(models.Message, {
        through: models.Like,
        foreignKey: "userId",
        otherKey: "messageId"
      });

      models.Message.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: "messageId",
        otherKey: "userId"
      });

      // relation entre Like et User et Message
      models.Like.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user"
      });

      models.Like.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message"
      });
    }
  };
  Like.init(
    {
      messageId: DataTypes.INTEGER,
      // references: {
      //   model: "Message",
      //   key: "id"
      // },
      userId: DataTypes.INTEGER,
      // references: {
      //   model: "User",
      //   key: "id"
      // }
    },
    {
      sequelize,
      modelName: "Like"
    }
  );
  return Like;
};