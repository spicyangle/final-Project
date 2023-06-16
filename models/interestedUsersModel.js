module.exports = (sequelize, DataTypes) => {
  const InterestedUser = sequelize.define(
    "interestedUser",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "events",
          key: "event_id",
        },
      },
    },
    {
      timestamps: false,
    }
  );

  InterestedUser.beforeCreate(async (interestedUser) => {
    const existingRecord = await InterestedUser.findOne({
      where: {
        user_id: interestedUser.user_id,
        event_id: interestedUser.event_id,
      },
    });

    if (existingRecord) {
      throw new Error(`You have already shown interest in event.`);
    }
  });

  return InterestedUser;
};
