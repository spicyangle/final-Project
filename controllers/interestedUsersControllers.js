const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/config.js");
const db = require("../models");
const usersModel = db.users;
const events = db.events;
const interestedUsers = db.interestedUsers;
const { ValidationError } = require("sequelize");

exports.findAllInterestedUsers = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
   
    // Find the requested event
    const event = await events.findByPk(eventId);
    const user = await usersModel.findByPk(req.loggedUserId);
   
    if (!event) {
      return res.status(404).json({
        error: `The requested event with ${eventId} was not found.`,
      });
    }

    if (!user) {
      return res.status(404).json({
        error: `The user with ID ${req.loggedUserId} does not exist`,
      });
    }

    if (req.loggedUserRole != "admin" && req.loggedUserRole != "facilitator") {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }

    const data = await interestedUsers.findAll({
      where: { event_id: eventId },
    });

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `There is no users who interested of this event with ID ${eventId}`,
      });
    } else {
      res.status(200).json({
        success: true,
        interested_users: data,
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

//show interest to event
exports.create = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    // Find the requested event
    const event = await events.findByPk(eventId);
    const user = await usersModel.findByPk(req.loggedUserId);

    if (!event) {
      return res.status(404).json({
        success: true,
        msg: `The event with ID ${eventId} does not exist`,
      });
    }
    
    if (event.adm_confirm == false)
    {
      return res.status(403).json({
        success: false,
        msg: `The event with ID ${eventId} not validated`,
      });
    }
   
    if (!(req.loggedUserRole === "student")) 
    {
      return res.status(401).json({
        success: false,
        msg: "You must be authenticated to perform this request",
      });
    }  else {

      const newInterest = await interestedUsers.create({
        event_id: eventId,
        user_id: req.loggedUserId,
      });

      return res.status(200).json({
        success: true,
        msg: "Showed interest successfully",
      });
    }
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

//remove interest to event
exports.deleteInterest = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await usersModel.findByPk(eventId);
    const user = await usersModel.findByPk(req.loggedUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `The user with ID ${req.loggedUserId} does not exist`,
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: `The event with ID ${eventId} does not exist`,
      });
    }

    if (req.loggedUserRole !== "student") {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    } else {
      await interestedUsers.destroy({
        where: {
          event_id: eventId,
          user_id: req.loggedUserId,
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
