
import Auth from "../models/Auth.js";

export const createUser = async (userData) => {
  const user = new Auth({
    ...userData,
    email: userData.email.trim().toLowerCase(),
  });

  await user.save();

  return user;
};

export const findUserByEmail = async (email, includePassword = false) => {
  const query = Auth.findOne({
    email: email.trim().toLowerCase(),
  });

  if (includePassword) {
    query.select("+password");
  }

  return query;
};

export const findUserById = async (id) => {
  return Auth.findById(id);
};
