const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const salt = await bcrypt.genSalt(+process.env.SALT);
  const hashedPassword = await bcrypt.hash(password, salt);
  const tempUser = { name, password: hashedPassword, email };
  const user = await User.create({ ...tempUser });
  res.status(StatusCodes.CREATED).json(tempUser);
};

const login = async (req, res) => {
  res.send("login user");
};

module.exports = {
  register,
  login,
};
