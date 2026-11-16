import { registerUser, loginUser, refreshToken, logoutUser } from '../api/authApi';

export const authApi = {
  register: registerUser,
  login: loginUser,
  refresh: refreshToken,
  logout: logoutUser,
};

export default authApi;
