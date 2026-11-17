
import React, { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Clock, Award, Save, Edit, Loader2, CheckCircle,
  AlertCircle, Plus, X
} from "lucide-react";

import {
  createVolunteerProfile,
  getMyProfile,
  updateMyProfile,
} from "../../../api/volunteerApi.js";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  education: "",
  experience: "",
  skills: [],
  availability: "",
  bio: "",
};

const VolunteerProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get token from your existing login implementation
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch logged-in volunteer profile
  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/volunteers/me`, {
        method: "GET",
        headers,
      });

      if (response.status === 404) {
        setProfile(null);
        setIsEditing(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch volunteer profile.");
      }

      const data = await response.json();
      const volunteer = data.profile || data;

      setProfile(volunteer);
      setFormData({
        ...initialForm,
        ...volunteer,
        skills: volunteer.skills || [],
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getMyProfile();
      const data = response.profile || response;

      setProfile(data);
      setFormData({
        ...initialForm,
        ...data,
        skills: data.skills || [],
      });

      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
        setIsEditing(true);
      } else {
        setError(
          error.response?.data?.message ||
          "Unable to load volunteer profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (
      skill &&
      !formData.skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Create or update profile
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    setError("");

    let response;

    if (profile) {
      response = await updateMyProfile(formData);
    } else {
      response = await createVolunteerProfile(formData);
    }

    const savedProfile = response.profile || response;

    setProfile(savedProfile);
    setFormData({
      ...initialForm,
      ...savedProfile,
      skills: savedProfile.skills || [],
    });

    setIsEditing(false);
    setSuccess(
      profile
        ? "Profile updated successfully!"
        : "Profile created successfully!"
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to save volunteer profile."
    );
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (error && !isEditing && !profile) {
    return (
      <div className="bg-red-50 text-red-700 p-5 rounded-xl flex gap-3">
        <AlertCircle />
        <div>
          <p className="font-semibold">Unable to load profile</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-3 underline font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full mt-2 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const fields = [
    {
      name: "fullName",
      label: "Full Name",
      icon: User,
      placeholder: "Enter your full name",
    },
    {
      name: "email",
      label: "Email Address",
      icon: Mail,
      placeholder: "Enter your email",
      type: "email",
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: Phone,
      placeholder: "Enter your phone number",
    },
    {
      name: "location",
      label: "Location",
      icon: MapPin,
      placeholder: "City, State",
    },
    {
      name: "education",
      label: "Education",
      icon: GraduationCap,
      placeholder: "Your education",
    },
    {
      name: "experience",
      label: "Experience",
      icon: Briefcase,
      placeholder: "e.g. Fresher or 2 years",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Volunteer Profile
          </h2>
          <p className="text-gray-500 mt-1">
            Manage your information, skills and availability.
          </p>
        </div>

        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg flex gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {isEditing ? (
        /* Create / Edit Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {profile ? "Update Your Profile" : "Create Your Volunteer Profile"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Provide your details so coordinators can match you with suitable
              opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(({ name, label, icon: Icon, placeholder, type }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <Icon size={16} />
                    {label}
                  </span>
                </label>
                <input
                  type={type || "text"}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={["fullName", "email"].includes(name)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              <span className="flex items-center gap-2">
                <Award size={16} />
                Your Skills
              </span>
            </label>

            <div className="flex gap-2 mt-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="e.g. Teaching, First Aid, React"
                className={inputClass + " mt-0"}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
              <Clock size={16} />
              Availability
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select availability</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
              <option value="Both">Weekdays and Weekends</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              About Me
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about yourself, your interests and volunteering experience..."
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
            {profile && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...initialForm,
                    ...profile,
                    skills: profile.skills || [],
                  });
                  setIsEditing(false);
                  setError("");
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      ) : (
        /* Saved Profile View */
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <User size={38} />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900">
                {profile?.fullName || "Volunteer"}
              </h3>
              <p className="text-gray-500 mt-1">{profile?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                Profile Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {[
              ["Phone", profile?.phone, Phone],
              ["Location", profile?.location, MapPin],
              ["Education", profile?.education, GraduationCap],
              ["Experience", profile?.experience, Briefcase],
              ["Availability", profile?.availability, Clock],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex gap-3">
                <div className="p-2 bg-gray-100 rounded-lg h-fit">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900">
                    {value || "Not provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-5">
            <h4 className="font-semibold text-gray-900 mb-3">My Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || []).length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              )}
            </div>
          </div>

          <div className="border-t mt-5 pt-5">
            <h4 className="font-semibold text-gray-900 mb-2">About Me</h4>
            <p className="text-gray-600 leading-relaxed">
              {profile?.bio || "No bio added yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerProfileTab;
