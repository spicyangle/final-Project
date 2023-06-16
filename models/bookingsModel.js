module.exports = (Sequelize, DataTypes) => {
  const Booking = Sequelize.define(
    "booking",
    {
      booking_id: {
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

      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Please provide date format dd-mm-yy",
          },
          notNull: {
            msg: "Please provide the day of moving into the accommodation",
          },
          isStartDateBeforeEndDate() {
            if (new Date(this.start_date) >= new Date(this.end_date)) {
              throw new Error("Start date must be before the end date.");
            }
          },
        },
      },

      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        isDate: true,
        isDate: { msg: "Please provide date format dd-mm-yy" },
        notNull: {
          msg: "Please provide the day of moving out of the accommodation",
        },
        isEndDateAfterStartDate() {
          if (new Date(this.end_date) <= new Date(this.start_date)) {
            throw new Error("End date must be after the start date.");
          }
        },
      },

      persons_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide how many people will stay in accommodation.",
          },
          min: 1,
        },
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["Confirmed", "Requested", "Cancelled"]],
            msg: "Status only can be - Requested, Confirmed or Cancelled.",
          },
          notNull: {
            msg: "Please provide status.",
          },
        },
      },
    },
    { timestamps: false }
  );
  return Booking;
};
