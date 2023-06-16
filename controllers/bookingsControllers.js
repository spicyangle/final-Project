const db = require("../models/index.js");
const bookings = db.bookings;
const accommodations = db.accommodations;
const users = db.users;
const { ValidationError } = require("sequelize"); //necessary for model validations using sequelize
const { Op } = require("sequelize");

// Creates a new booking
exports.create = async (req, res) => {
  try {
    const accommodationId = req.params.id;
    const bookingData = req.body;

    // Find the requested accommodation
    const accommodation = await accommodations.findByPk(accommodationId);
    // Find the user who requested an accommodation
    const user = await users.findByPk(req.loggedUserId);

    if (req.loggedUserRole !== 'student' || !req.loggedUserId) 
    {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
    });
    } 

    if (!accommodation) {
      return res.status(404).json({ error: `The accommodation with ID ${accommodationId}  was not found` });
    }
    
    if (!user)
    {
      return res.status(404).json({ error: `The user ${bookingData.user_id} does not exist` });
    }
    
    // Check if the number of people exceeds the maximum capacity of the accommodation
    if (bookingData.persons_quantity > accommodation.persons_quantity) {
      return res.status(400).json({ success: false, message: "The number of persons exceeds the maximum capacity of the accommodation" });
    }
    // Create a new booking
    const newBooking = await bookings.create({...bookingData, accommodation_id: accommodationId, user_id: req.loggedUserId});
    res.status(202).json({
      success: true,
      message: 'Your booking request was successfully sent to host',
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, message: err.errors.map((e) => e.message) });
    } else {
      res.status(500).json({
        message: err.message || 'Something went wrong. Please try again later.'
      });
    }
  }
  };

  //Update booking status - accept or cancel booking
  exports.updateBookingStatus = async (req, res) => {

    try {
      const accommodationId = req.params.id;
      const accommodation = await accommodations.findByPk(accommodationId);
      const bookingId = req.params.bid;
      const updateStatus = req.body.status;
      
    if (req.loggedUserRole !== 'student' || !req.loggedUserId) 
    {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
    });
    } 
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        msg: `Accommodation with ID ${accommodationId} was not found`,
      });
    }
    if (!bookingId) {
      return res.status(404).json({
        success: false,
        msg: `The requested booking with ID ${bookingId} was not found.`,
      });
    }
      if (accommodation.adm_confirm == false)
      {
        return res.status(403).json({
          success: false,
          msg: `The accommodation with ID ${accommodationId} not validated`,
        });
      }

      if (req.loggedUserRole == "facilitator" && updateStatus == "Confirmed") 
      {
          await bookings.update(
            { status: updateStatus },
            {
              where: {
                booking_id: bookingId,
                accommodation_id: accommodationId,
              },
            }
          );
          return res.status(200).json({
            success: true,
            msg: `Booking with ID ${bookingId} was successfully accepted.`,
          });
      } 
      else if (req.loggedUserRole == "student" && updateStatus == "Cancelled")
      {
        await bookings.update(
          { status: updateStatus },
          {
            where: {
              booking_id: bookingId,
              accommodation_id: accommodationId,
            },
          }
        );
        return res.status(200).json({
          success: true,
          msg: `Booking with ID ${bookingId} was successfully cancelled.`,
        });
      }
    } catch (err) {
      if (err instanceof ValidationError)
        res.status(400).json({
          success: false,
          msg: err.errors.map((e) => e.message),
        });
      else
        res.status(500).json({
          success: false,
          msg: err.message || "Something went wrong. Please try again later",
        });
    }
  
  };