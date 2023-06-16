module.exports = (Sequelize, DataTypes) => {
  const Review = Sequelize.define(
    "review",
    {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      accommodation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "accommodations",
          key: "accommodation_id",
        },
      },
      
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      note: {
        type: DataTypes.STRING,
        notNull: false,
      },

      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
          notNull:
          {
            msg: "You have not provided rating yet. Please provide rating from 1 to 5. ",
          },
          min: 1,          
          max: 5, 
        },
        
      },
    },
    { timestamps: false }
  );
  return Review;
};
