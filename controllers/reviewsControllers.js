const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/config.js");
const sumOfRatings = require("../controllers/accommodationsControllers.js");
const db = require("../models");
const users = db.users;
const accommodations = db.accommodations;
const reviews = db.reviews;
const { ValidationError } = require("sequelize");

//Get all reviews of accommodation
exports.findAllReviews = async (req, res) => {
  try {
    const accommodationId = req.params.id;
    // Find the requested accommodation
    const accommodation = await accommodations.findByPk(accommodationId);

    if (!accommodation) {
      return res.status(404).json({
        error: `The requested accommodation with ${accommodationId} was not found.`,
      });
    }

    const reviewData = await reviews.findAll({
      where: { accommodation_id: accommodationId},
    });

    if (reviewData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "There are no ratings and reviews for this accommodation.",
      });
    } else {
      res.status(200).json({
        success: true,
        reviews: reviewData,
      });
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      res
        .status(400)
        .json({ success: false, message: err.errors.map((e) => e.message) });
    } else {
      res.status(500).json({
        message: err.message || "Something went wrong. Please try again later.",
      });
    }
  }
};

// Creates a new review
exports.create = async (req, res) => {
  try {
    const reviewData = req.body;
    const accommodationId = parseInt(req.params.id);
    // Find the accommodation
    const accommodation = await accommodations.findByPk(accommodationId);
    // Find the user ID
    const user = await users.findByPk(req.loggedUserId);
    
    if (accommodations.adm_confirm == false)
    {
      return res.status(403).json({
        success: false,
        msg: `The accommodation with ID ${accommodationId} not validated`,
      });
    }
    if (!accommodation) {
      return res.status(404).json({
        error: `The accommodation with ID ${accommodationId} was not found`,
      });
    }

    if (!user) {
      return res
        .status(404)
        .json({ error: `The user ${reviewData.user_id} does not exist` });
    }

    if (!req.loggedUserRole == "student" || !req.loggedUserId) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }
    const count = await reviews.count({
      where: { accommodation_id: accommodationId },
    });
  const newRating = (accommodation.rating + req.body.rating)/(count+1);
  const newRatingFixed = +(newRating.toFixed(2));
  accommodation.update({ rating: newRatingFixed }, {
    where: {
      accommodation_id: accommodationId,
    },
  });

    const newReview = await reviews.create({...reviewData, accommodation_id: accommodationId,user_id: req.loggedUserId, 
                                          });                         
    res.status(202).json({
      success: true,
      msg: "Your rate was successfully accepted",
    });
  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        message: err.message || "Something went wrong. Please try again later.",
      });
  }
};

exports.calculateSumOfRatings = async (req) => {
  try {
    const accommodationId = req.params.id;
    const count = await reviews.count({
      where: { accommodation_id: accommodationId },
    });

    const sumOfRatings = await reviews.sum("rating", {
      where: {accommodation_id: accommodationId },
    });
    return {sumOfRatings, count};
  } catch (error) {
    console.error(error);
    return 0;
  }
};





