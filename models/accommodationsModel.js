module.exports = (Sequelize, DataTypes) => {
  const Accommodation = Sequelize.define(
    "accommodations",
    {
      accommodation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide title of the accommodation.",
          },
          len: {
            args: [5, 40],
            msg: "Title should have between 5 and 40 characters.",
          },
        },
      },
      area: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide area of accommodation.",
          },
          len: {
            args: [3, 30],
            msg: "Area should have between 3 and 30 characters.",
          },
        },
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide price of the accommodation.",
          },
          min: 1,
        },
      },
      amenities: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      persons_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide maximum number of persons.",
          },
          min: 1,
        },
      },

      beds_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide number of beds.",
          },
          min: 1,
        },
      },

      beds_type: {
        type: DataTypes.STRING,
        allowNull: true,
        len: {
          args: [3, 30],
          msg: "beds type  could have between 3 and 30 characters.",
        },
      },

      minimum_stay_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide minimum stay days in accommodation",
          },
          min: 1,
        },
      },
      room_type: {
        type: DataTypes.STRING,
        allowNull: false,
        len: [5, 35],
        validate: {
          isIn: {
            args: [
              [
                "Single Room",
                "Double Room",
                "Twin Room",
                "Tripple Room",
                "Quad Room",

                "single room",
                "double room",
                "twin room",
                "tripple room",
                "quad room",

                "Single room",
                "Double room",
                "Twin room",
                "Tripple room",
                "Quad room",
              ],
            ],
            msg: "Incorrect room type, please provide these types: Single Room, Double Room, Twin Room, Tripple Room, Quad Room",
          },
        },
      },
      rating: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        min: 0,
        max: 5,
      },

      rules: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [5, 150],
            msg: "Description could have between 5 and 150 characters",
          },
        },
      },

      adm_confirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: false }
  );

  return Accommodation;
};
