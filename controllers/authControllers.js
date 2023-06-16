const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const db = require("../models/index.js");
const config = require("../config/config.js");
const { ValidationError } = require("sequelize"); //necessary for model validations using sequelize
const { Op } = require("sequelize");

exports.verifyToken = (req, res, next) => {
  // search token in headers most commonly used for authorization
  const header = req.headers["x-access-token"] || req.headers.authorization;
  if (typeof header == "undefined")
    return res.status(401).json({ success: false, msg: "No token provided!" });
  const bearer = header.split(" "); // Authorization: Bearer <token>
  const token = bearer[1];

  try {
    let decoded = jwt.verify(token, config.SECRET);
    req.loggedUserId = decoded.id; // save user ID and role into request object
    req.loggedUserRole = decoded.user_type;
    if (!req.loggedUserRole) {
      return res
        .status(403)
        .json({
          success: false,
          msg: "You must be an admin or a logged-in user to perform this request",
        });
    }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        msg: "You must be authenticated to perform this request",
      });
  }
};
