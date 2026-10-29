import Auth from "../models/Auth.js";

export const createUser = async (userData) => {
    const user = new Auth(userData);
    await user.save();
    return user;
}

export const findUserByEmail = async (email) => {
    return await Auth.findOne({
        email: email.trim().toLowerCase()
    });
}


export const findUserById = async (id) => {
  return Auth.findById(id);
};
