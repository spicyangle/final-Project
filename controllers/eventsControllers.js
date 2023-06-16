const db = require("../models/index.js");
const events = db.events;
const users = db.users;
const { ValidationError } = require("sequelize"); //necessary for model validations using sequelize
const { Op } = require("sequelize");

//Finds the all events
exports.findAllEvents = async (req, res) => {
  try {

    const {date,location,price,type, ...otherParams} = req.query;
    let where = {};
    console.log(req.query);
    if (date)
    {
      where.date = {
        [Op.eq]: date,
      };

    }

    if (location)
    {
      where.location = {[Op.eq] : location,};
    }

    if (price)
    {
      where.price = {[Op.eq]: price,};
    }

    if (type)
    {
      where.type = {[Op.eq]: type,};
    }

    if (Object.keys(otherParams).length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid query parameter(s)" });
    }

    const getFilteredEvents = await events.findAll({where});

    if (!getFilteredEvents.length)
    {
     return res.status(404).json({
        message: "The requested event by chosen criteria was not found",
      });
    }


    res
      .status(200)
      .json({
        success: true,
        URL: `/events${req.url}`,
        results: getFilteredEvents,
      });
  } 
  catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false });
        else
      res.status(500).json({
        message:
          err || "Some error occurred while getting the events.",
      });
  }
};

// Creates a new event
exports.create = async (req, res) => {
  try {
    const user = await users.findByPk(req.loggedUserId);
    if (user.adm_confirm === false && user.user_type === 'facilitator')
    {
      return res.status(403).json({
        success: false,
        msg: `The facilitator with ID ${req.loggedUserId} not validated`,
      });
    }
    if (
      req.loggedUserRole !== "facilitator"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }

    const newEvents = await events.create({
      ...req.body, creator_id: req.loggedUserId
    });

    res
      .status(201)
      .json({
        success: true,
        msg: "Your event request was successfully sent to administrator",
      });
  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        message:
          err.message || "Some error occurred while creating the event.",
      });
  }
};

// Update event details
exports.updateEventInfo = async (req, res) => {

  try {
    const eventId = req.params.id;
    const updateInfo = req.body;

    if (!eventId) {
      return res.status(404).json({
        success: false,
        msg: `Event with ID ${eventId} was not found`,
      });
    }
    if (
     req.loggedUserId !== events.creator_id
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    } 
      const update = await events.update(updateInfo, {
  where: {
    event_id: eventId,
  },
});
      return res.status(200).json({
        success: true,
        msg: `Event information with ID ${eventId} was successfully updated.`,
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

//delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await events.findByPk(eventId);

    if (req.loggedUserId  !== event.creator_id && req.loggedUserRole !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: `The event with ID ${eventId} was not found.`,
      });
    }

     else {
      await events.destroy({
        where: {
          event_id: eventId,
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

exports.adminConfirmEv = async (req, res) => { // accept event
  try {
    const eventId = req.params.id;
    const event = await events.findByPk(eventId);
    const updateInfo = req.body;

    if (
      req.loggedUserRole != "admin"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    } 
    
    if (!event) {
      return res.status(404).json({
        success: false,
        msg: `The event with ID ${eventId} was not found`,
      });
    }
      const update = await events.update(updateInfo, {
  where: {
    event_id: eventId,
  },
});
      return res.status(200).json({
        success: true,
        msg: `The event with ID ${eventId} was accepted`,
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




