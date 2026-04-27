import { config } from "../config/config.js";
import bcrypt from "bcrypt";

export const hashPassword = (plainData) => {
  const encryptData = bcrypt.hashSync(plainData, config.salt);
  return encryptData;
};

export const compareData = (plainData, hashPassword) => {
  const compare = bcrypt.compareSync(plainData, hashPassword);
  return compare;
};
