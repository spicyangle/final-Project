const db = require("../models/index.js");
const accommodations = db.accommodations;
const users = db.users;
const { ValidationError } = require("sequelize"); //necessary for model validations using sequelize
const { Op } = require("sequelize");
const reviewsController = require("../controllers/reviewsControllers.js");
const usersModel = require("../models/usersModel.js");

// Finds all accommodations by criteria
exports.findAllAccommodations = async (req, res) => {
  try {
  let where = {};
    const {
      area,
      price_min,
      price_max,
      persons_quantity,
      beds_quantity,
      rating,
      room_type,
      minimum_stay_days, ...otherParams
    } = req.query;

    if (area) {
      //Filters by the area
      where.area = {
        [Op.eq]: area,
      };
    }
    
    if (price_min) {
      //Filters by minimal price
      where.price = {
        [Op.gte]: price_min,
      };

      if (price_max) {
        //Filters by maximum price
        where.price = {
          [Op.gte]: price_min,
          [Op.lte]: price_max
        };
      };
    }
  
    if (price_max && !price_min) {
      //Filters by maximum price
      where.price = {
        [Op.lte]: price_max,
      };
    }

    if (persons_quantity) {
      //Filters by max number of persons in accommodation
      where.persons_quantity = {
        [Op.eq]: persons_quantity,
      };
    }

    if (beds_quantity) {
      //Filters by number of beds
      where.beds_quantity = {
        [Op.eq]: beds_quantity,
      };
    }
    
    if (rating) {
      //filters by rating
      where.rating = {
        [Op.eq]: rating,
      };
    }

    if (room_type) {
      //filters by room_type
      where.room_type = {
        [Op.eq]: room_type,
      };
    }

    if (minimum_stay_days) {
      //Filters by Minimum days of staying
      where.minimum_stay_days = {
        [Op.eq]: minimum_stay_days,
      };
    }
    if (Object.keys(otherParams).length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid query parameter(s)" });
    }
  const allAccommodations = await accommodations.findAll();
   const getFilteredAccommodations = await accommodations.findAll({where});
    if (!allAccommodations.length) 
    {
      return res.status(404).json({
        success: false, message: "No accommodations were found in this server.",
      });
    }
    if (!getFilteredAccommodations.length) {
      return res.status(404).json({
        success: false, message: "The requested accommodation by chosen criteria was not found",
      });
    }

    return res.status(200).json({
      success: true,
      results: getFilteredAccommodations,
    });

  } catch (err) {
    if (err instanceof ValidationError)
      res.status(400).json({ success: false });
    else
      res.status(500).json({
        message: err || "Some error occurred while getting the accommodations.",
      });
  }
};

exports.findOneAccommodation = async (req, res) => {
  try{
    const accommodationId = req.params.id;
    const accommodation = await accommodations.findByPk(accommodationId);
    
    if (!accommodation)
    {
      return res.status(404).json({
      message: "The requested accommodation with ID xx was not found",
    });
    }
    else
    {
      const { sumOfRatings, count } = await reviewsController.calculateSumOfRatings(req);
      console.log(sumOfRatings);
      if (count === 0){
        accommodation.rating = null;
      }
      else
      {
        accommodation.rating = sumOfRatings/count;
      }

      const getOneAccommodation = await accommodation.save();
      return res.status(200).json({
      success: true,
      results: getOneAccommodation,
    });

    }
   
  }
  catch (err) {
    if (err instanceof ValidationError)
      res.status(400).json({ success: false });
    else
      res.status(500).json({
        message: err || "Some error occurred while getting the accommodations.",
      });
  }

}

// Creates a new accommodation
exports.create = async (req, res) => {
  try {
    if (
      req.loggedUserRole !== "facilitator" ||
      !req.loggedUserId
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }
    const user = await users.findByPk(req.loggedUserId);
    if (user.adm_confirm === false)
    {
      return res.status(403).json({
        success: false,
        msg: `The facilitator with ID ${req.loggedUserId} not validated`,
      });
    }
    await accommodations.create({
      ...req.body,
      creator_id: req.loggedUserId,
    });
    
    res.status(202).json({
      success: true,
      msg: "Your new accommodation request was successfully sent to administrator",
    });
  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        message:
          err.message ||
          "Some error occurred while creating the accommodation.",
      });
  }
};


// Update accommodation details
exports.updateAccommodationInfo = async (req, res) => {

  try {
    const accommodationId = req.params.id;
    const updateInfo = req.body;

    if (!accommodationId) {
      return res.status(404).json({
        success: false,
        msg: `Accommodation with ID ${accommodationId} was not found`,
      });
    }
    if (
      req.loggedUserRole != "facilitator"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    } 
      const update = await accommodations.update(updateInfo, {
  where: {
    accommodation_id: accommodationId,
  },
});
      return res.status(200).json({
        success: true,
        msg: `Accommodation information with ID ${accommodationId} was successfully updated.`,
      });
    
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

// delete the accommodation
exports.deleteAccommodation = async (req, res) => {
  try {
    const accommodationId = req.params.id;
    const accommodation = await accommodations.findByPk(accommodationId);
 
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        msg: `The accommodation with ID ${accommodationId} was not found.`,
      });
    }

    if (req.loggedUserId  !== accommodation.creator_id && req.loggedUserRole !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    } else {
      await accommodations.destroy({
        where: {
          accommodation_id: accommodationId,
        },
    });
      return res.status(204).json({});
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({
        success: false,
        msg: err.errors.map((e) => e.message),
      });
    } else {
      res.status(500).json({
        success: false,
        msg:
          err.message || "Something went wrong. Please try again later",
      });
    }
  }
};

exports.adminConfirmAcc = async (req, res) => { // accept accommodation
  try {
    const accommodationId = req.params.id;
    const accommodation = await accommodations.findByPk(accommodationId);
    const updateInfo = req.body;

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        msg: `The accommodation with ID ${accommodationId} was not found`,
      });
    }

    if (
      req.loggedUserRole !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    } 
      const update = await accommodations.update(updateInfo, {
  where: {
    accommodation_id: accommodationId,
  },
});
      return res.status(200).json({
        success: true,
        msg: `The accommodation with ID ${accommodationId} was accepted`,
      });
    
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

