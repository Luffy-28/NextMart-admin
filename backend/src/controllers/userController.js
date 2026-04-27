import { compareData, hashPassword } from "../helpers/encryptHelper.js";
import { signToken } from "../helpers/tokenHelper.js";
import { User } from "../models/userModel.js";

//Register User
export const registerUser = async (req, res) => {
  try {
    let newUser = req.body;
    newUser.password = hashPassword(newUser.password);
    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(E1100).send({
        status: "error",
        message: "User already exists with this email",
      });
    }
    const userData = await User.insertOne(newUser);
    if (!userData) {
      return res.status(400).send({
        status: "error",
        message: "Error creating User",
      });
    } else {
      return res.status(201).send({
        status: "success",
        message: "User created successfully",
        data: userData,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error creating User",
    });
  }
};

// login User
export const loginUser = async (req, res) => {
  try {
    const loginUser = req.body;
    if (!loginUser) {
      return res.status(400).send({
        status: "error",
        message: "Please provide email and password",
      });
    }
    const userData = await User.findOne({ email: loginUser.email });
    if (userData) {
      const isMatched = compareData(loginUser.password, userData.password);
      if (isMatched) {
        const payload = { email: userData.email };
        const accessToken = signToken(payload);
        return res.status(200).send({
          status: "success",
          message: "User logged in successfully",
          data: userData,
          accessToken,
        });
      } else {
        return res.status(400).send({
          status: "error",
          message: "Invalid email or password",
        });
      }
    } else {
      return res.status(400).send({
        status: "error",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error logging in User",
    });
  }
};
export const getUserDetail = async (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "User details fetched successfully",
    user: req.user,
  });
};
