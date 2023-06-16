module.exports = (Sequelize, DataTypes) => {
  const Event = Sequelize.define(
    "event",
    {
      event_id: {
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
            msg: "Please provide title.",
          },
          len: {
            args: [5, 40],
            msg: "Title should have between 5 and 40 characters.",
          },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide location.",
          },
          len: {
            args: [5, 40],
            msg: "Location should have between 3 and 30 characters.",
          },
        },
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide price.",
          },
          min: 1,
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["Trip", "Cultural", "Party", "Sports"]],
            msg: "Please provide type of event. Possible values: Trip, Cultural, Party, Sports",
          },
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        isDate: true,
        isDate: { msg: "Please provide date format dd-mm-yy" },
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/,
            msg: "Invalid time format. Please use HH:MM or HH:MM:SS format",
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 150],
            msg: "Description must have between 5 and 150 characters.",
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
  return Event;
};
