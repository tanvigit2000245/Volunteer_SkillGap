
import Auth from "../models/Auth.js";

export const createUser = async (userData) => {
  const user = new Auth({
    ...userData,
    email: userData.email.trim().toLowerCase(),
  });

  await user.save();

  return user;
};

export const findUserByEmail = async (email) => {
  return Auth.findOne({
    email: email.trim().toLowerCase(),
  });
};

export const findUserById = async (id) => {
  return Auth.findById(id);
};
