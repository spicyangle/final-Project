const express = require("express");
const router = express.Router();
// import controller middleware
const accommodationsControllers = require("../controllers/accommodationsControllers");
const bookingsControllers = require("../controllers/bookingsControllers");
const reviewsControllers = require("../controllers/reviewsControllers");
const authControllers = require("../controllers/authControllers");

  router
  .route("/")
  .get(accommodationsControllers.findAllAccommodations) // Finds all accommodations
  .post(authControllers.verifyToken, accommodationsControllers.create); //creates a new accommodation
  
  router 
  .route("/:id")
  .get(accommodationsControllers.findOneAccommodation) // Finds one accommodation
  .put(authControllers.verifyToken, accommodationsControllers.updateAccommodationInfo) //Manage accommodation details
  .delete(authControllers.verifyToken, accommodationsControllers.deleteAccommodation) //Delete accommodation
  .patch(authControllers.verifyToken, accommodationsControllers.adminConfirmAcc); // accept accommodation

  router
  .route("/:id/bookings")
  .post(authControllers.verifyToken, bookingsControllers.create); //creates a new booking

  router
  .route("/:id/bookings/:bid")
  .patch(authControllers.verifyToken, bookingsControllers.updateBookingStatus) //accept or cancel a booking

  router
  .route("/:id/reviews")
  .get(reviewsControllers.findAllReviews) // Finds all reviews of accommodation
  .post(authControllers.verifyToken, reviewsControllers.create); //creates a review for accommodation

router.all("*", (req, res) => {
  res.status(404).json({ message: "Try again, not found" }); //send a predefined error message
});

//export this router
module.exports = router; //sent
