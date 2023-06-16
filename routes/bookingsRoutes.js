const express = require("express");
const router = express.Router();
// import controller middleware
const bookingsControllers = require("../controllers/bookingsControllers");

// bookingsControllers.use('/accommodations', router);



router.all("*", (req, res) => {
  res.status(404).json({ message: "Try again, not found" }); //send a predefined error message
});

//export this router
module.exports = router; //sent
