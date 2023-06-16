module.exports = (Sequelize, DataTypes) => {
  const User = Sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: 
      {
        msg: 'User already exists.'
      },
      allowNull: false,
      validate: {
        notNull: { msg: "Please provide username" },
      },
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
      validate: {
        notNull: {
          msg: "Please provide First Name.",
        },
      },
    },
    lname: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
      validate: {
        notNull: {
          msg: "Please provide Last Name.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      trim: true, // remove spaces on both ends
      allowNull: false,
      validate: {
        notNull: { msg: "Please provide password." },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
      unique: true,
      validate: {
        isEmail: { msg: "Incorrect Email format" },
        notNull: {
          msg: "Please provide E-mail.",
        },
      },
    },

    user_type: {
      type: DataTypes.ENUM("admin", "student", "facilitator"),
      notEmpty: true,
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "facilitator", "Admin", "admin", "Student", "Facilitator"]],
          msg: "Please specify user as facilitator, student or admin",
        },
      },
    },

    adm_confirm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: false });
  return User;
};
