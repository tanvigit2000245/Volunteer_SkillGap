import {
  createVolunteerProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getAllVolunteers,
  getVolunteerById
} from '../api/volunteerApi';

export const volunteerApi = {
  createProfile: createVolunteerProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getAllVolunteers,
  getVolunteerById,
};
