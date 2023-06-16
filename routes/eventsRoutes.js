const express = require("express");
const router = express.Router();
const eventsControllers = require("../controllers/eventsControllers");
const interestedUsersControllers = require("../controllers/interestedUsersControllers");
const authControllers = require("../controllers/authControllers");

router
  .route("/")
  .get(eventsControllers.findAllEvents) // Finds all events
  .post(authControllers.verifyToken, eventsControllers.create); //creates a new event

router
  .route("/:id/users")
  .post(authControllers.verifyToken,interestedUsersControllers.create); //show interest to event

router
  .route("/:id/users")
  .delete(authControllers.verifyToken,interestedUsersControllers.deleteInterest);

router 
  .route("/:id")
  .get(authControllers.verifyToken,interestedUsersControllers.findAllInterestedUsers)
  .put(authControllers.verifyToken, eventsControllers.updateEventInfo) //Manage event details
  .delete(authControllers.verifyToken, eventsControllers.deleteEvent) //Delete event
  .patch(authControllers.verifyToken, eventsControllers.adminConfirmEv); // accept event







router.all("*", (req, res) => {
  res.status(404).json({ message: "Try again, not found" }); //send a predefined error message
});

//export this router
module.exports = router; //sent