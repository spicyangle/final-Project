const dbConfig = require("../config/config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

// test the connection
(async () => {
  try {
    await sequelize.authenticate;
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

const db = {}; //object to be exported
db.sequelize = sequelize; //save the Sequelize instance (actual connection pool)

db.users = require("./usersModel.js")(sequelize, DataTypes);
db.accommodations = require("./accommodationsModel.js")(sequelize, DataTypes);
db.events = require("./eventsModel.js")(sequelize, DataTypes);
db.bookings = require("./bookingsModel.js")(sequelize, DataTypes);
db.interestedUsers = require("./interestedUsersModel.js")(sequelize, DataTypes);
db.reviews = require("./reviewsModel.js")(sequelize, DataTypes);

//Relationship between users and accommodations
db.users.hasMany(db.accommodations, {
  foreignKey: "creator_id",
});
db.accommodations.belongsTo(db.users, {
  foreignKey: "creator_id",
});

//Relationship between users and events
db.users.hasMany(db.events, {
  foreignKey: "creator_id",
});
db.events.belongsTo(db.users, {
  foreignKey: "creator_id",
});

//Relationship between bookings and accommodations
db.accommodations.hasMany(db.bookings, {
  foreignKey: "accommodation_id",
});
db.bookings.belongsTo(db.accommodations, {
  foreignKey: "accommodation_id",
});

//Relationship between users and bookings
db.users.hasMany(db.bookings, {
  foreignKey: "user_id",
});
db.bookings.belongsTo(db.users, {
  foreignKey: "user_id",
});

//Relationship between interestedUsers and events
db.users.hasOne(db.interestedUsers, {
  foreignKey: "user_id",
});

db.interestedUsers.belongsTo(db.users,{
  foreignKey: "user_id",
});

//Relationship between interestedUsers and events

db.events.hasMany(db.interestedUsers, {
  foreignKey: "event_id",
});

db.interestedUsers.belongsTo(db.events,{
  foreignKey: "event_id",
});

//Relationship between reviews and accommodations

db.accommodations.hasMany(db.reviews, {
  foreignKey: "accommodation_id",
});

db.reviews.belongsTo(db.accommodations,{
  foreignKey: "accommodation_id",
});

//Relationship between reviews and users

db.users.hasMany(db.reviews, {
  foreignKey: "user_id",
});

db.reviews.belongsTo(db.users,{
  foreignKey: "user_id",
});

(async () => {
  try {
    // await db.sequelize.sync({ force: true });
    // await db.sequelize.sync({ alter: true });
    await db.sequelize.sync({});
    console.log("DB is successfully synchronized");
  } catch (error) {
    console.log(error);
  }
})();

module.exports = db;
