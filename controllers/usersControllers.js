const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/config.js");
const db = require("../models");
const usersModel = db.users;
const { ValidationError } = require("sequelize");

//login
exports.login = async (req, res) => {
  try {
    let user = await usersModel.findOne({
      where: { username: req.body.username },
    }); //get user data from DB
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found." });

    // tests a string (password in body) against a hash (password in database)
    const check = bcrypt.compareSync(req.body.password, user.password);
    if (!check)
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Incorrect username or password.",
      });
    // sign the given payload (user ID and role) into a JWT payload – builds JWT token, using secret key
    const token = jwt.sign(
      { id: user.id, user_type: user.user_type },
      config.SECRET,
      {
        expiresIn: "24h", // 24 hours
      }
    );
    return res.status(200).json({ success: true, accessToken: token });
  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        success: false,
        msg: err.message || "Something went wrong. Please try again later.",
      });
  }
};

//Gets one user
exports.getOneUser = async (req, res) => {
  try {
    if (req.loggedUserRole == "admin" || req.loggedUserId == req.params.id) {
      const user = await usersModel.findOne({
        where: { id: req.params.id },
        attributes: [
          "id",
          "username",
          "email",
          "fname",
          "lname",
          "user_type",
          "adm_confirm",
        ],
      });
      if (!user)
        return res
          .status(404)
          .json({
            success: false,
            msg: `User  with ID ${req.params.id} was not found.`,
          });
      return res.status(200).json({ success: true, user: user });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving user.",
    });
  }
};

//Gets the all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.loggedUserRole !== "admin")
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    let users = await usersModel.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "fname",
        "lname",
        "user_type",
        "adm_confirm",
      ],
    });
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all users.",
    });
  }
};

//register
exports.create = async (req, res) => {
  try {
    if (req.body.user_type === "admin")
    {
      return res.status(403).json({
        success: true,
        msg: `You do not have access to the administrator role! Please choose between facilitator or student roles`,
      });
    }
    const newUser = await usersModel.create({
      username: req.body.username,
      email: req.body.email,
      fname: req.body.fname,
      lname: req.body.lname,
      password: bcrypt.hashSync(req.body.password, 10),
      user_type: req.body.user_type,
    });

    return res.status(201).json({
      success: true,
      msg: `The user with ID ${newUser.id} was registered successfully!`,
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

//Update personal account information
exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.loggedUserId;
    const user = await usersModel.findByPk(userId);
    const updateInfo = req.body;

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `The user with ID ${userId} was not found`,
      });
    }

    const update = await user.update(updateInfo);

    if (
      req.loggedUserRole != "student" &&
      req.loggedUserRole != "facilitator" && !userId
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    } else {
      return res.status(200).json({
        success: true,
        msg: `Profile information of user with ID ${userId} was successfully updated`,
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

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await usersModel.findByPk(userId);
    const deleteInfo = req.body;

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `The user with ID ${userId} does not exist`,
      });
    }
    if (
      req.loggedUserId  !== user.id && req.loggedUserRole !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });
    } else {
      const deleteUser = await user.destroy(deleteInfo);
      return res.status(204).json({});
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

exports.adminConfirmFac = async (req, res) => {  //accept facilitator

  try {
    const facilitatorId = req.params.id;
    const facilitator = await usersModel.findByPk(facilitatorId);
    const updateInfo = req.body;

    if (!facilitator) {
      return res.status(404).json({
        success: false,
        msg: `Facilitator with ID ${facilitatorId} was not found`,
      });
    }

    if (facilitator.user_type != "facilitator")
    {
      return res.status(400).json({
        success: false,
        msg: `The user with ID ${facilitatorId} is not facilitator`,
      });
      
    }
    if (
      req.loggedUserRole != "admin"
    ) {
      return res.status(403).json({
        success: false,
        msg: "Your credentials rights are not sufficient.",
      });

    } 
      const update = await usersModel.update(updateInfo, {
  where: {
    id: facilitatorId,
  },
});
      return res.status(200).json({
        success: true,
        msg: `Facilitator with ID ${facilitatorId} was accepted`,
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
