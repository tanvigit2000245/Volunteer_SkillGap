
import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Clock,
  Save,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Trash2,
} from "lucide-react";

import {
  createVolunteerProfile,
  getMyProfile,
  updateMyProfile,
} from "../../../api/volunteerApi.js";

const initialForm = {
  phone: "",
  mobilityLevel: "High",
  experienceYears: 0,
  skills: [],
  languages: [],
  availability: [],
};

const VolunteerProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(3);

  const [languageName, setLanguageName] = useState("");
  const [languageLevel, setLanguageLevel] = useState("FLUENT");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full mt-2 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500";

  // Normalize possible API response formats.
  const extractProfile = (response) => {
    return (
      response?.profile ||
      response?.volunteer ||
      response?.data?.profile ||
      response?.data?.volunteer ||
      response?.data ||
      response
    );
  };

  // Load the logged-in volunteer's profile.
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyProfile();

      console.log("Volunteer profile API response:", response);

      const data =
        response?.profile ||
        response?.volunteer ||
        response?.data?.profile ||
        response?.data?.volunteer ||
        response?.data ||
        response;

      setProfile(data);
      setFormData({
        ...initialForm,
        ...data,
        skills: data.skills || [],
        languages: data.languages || [],
        availability: data.availability || [],
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Profile fetching error:", error);

      if (error.response?.status === 404) {
        setProfile(null);
        setFormData(initialForm);
        setIsEditing(true);
      } else {
        setError(
          error.response?.data?.message ||
          "Unable to fetch volunteer profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update simple form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "experienceYears"
        ? Number(value)
        : value,
    }));
  };

  // Add skill as an object.
  const addSkill = () => {
    const value = skillName.trim();

    if (!value) return;

    const alreadyExists = formData.skills.some(
      (skill) =>
        skill.skillName.toLowerCase() === value.toLowerCase()
    );

    if (alreadyExists) return;

    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          skillName: value,
          proficiency: Number(skillLevel),
        },
      ],
    }));

    setSkillName("");
    setSkillLevel(3);
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Add language as an object.
  const addLanguage = () => {
    const value = languageName.trim();

    if (!value) return;

    const alreadyExists = formData.languages.some(
      (item) =>
        item.language.toLowerCase() === value.toLowerCase()
    );

    if (alreadyExists) return;

    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          language: value,
          proficiency: languageLevel,
        },
      ],
    }));

    setLanguageName("");
    setLanguageLevel("FLUENT");
  };

  const removeLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Add availability date and time.
  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        {
          date: "",
          startTime: "09:00",
          endTime: "17:00",
        },
      ],
    }));
  };

  const updateAvailability = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const removeAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Convert dates to ISO format expected by backend.
  const preparePayload = () => ({
    phone: formData.phone,
    mobilityLevel: formData.mobilityLevel,
    experienceYears: Number(formData.experienceYears),

    skills: formData.skills.map((skill) => ({
      skillName: skill.skillName,
      proficiency: Number(skill.proficiency),
    })),

    languages: formData.languages.map((language) => ({
      language: language.language,
      proficiency: language.proficiency,
    })),

    availability: formData.availability.map((item) => ({
      date: new Date(`${item.date}T00:00:00.000Z`).toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
    })),
  });

  // Create or update profile.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        phone: formData.phone,
        mobilityLevel: formData.mobilityLevel,
        experienceYears: Number(formData.experienceYears),
        skills: formData.skills,
        languages: formData.languages,
        availability: formData.availability.map((item) => ({
          date: new Date(item.date).toISOString(),
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      };

      console.log("Submitting payload:", payload);

      if (profile) {
        await updateMyProfile(payload);
      } else {
        await createVolunteerProfile(payload);
      }

      await fetchProfile();

      setIsEditing(false);
      setSuccess("Profile saved successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      setError(
        error.response?.data?.message || "Failed to save profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={30} />
        <span className="ml-3 text-gray-600">
          Loading volunteer profile...
        </span>
      </div>
    );
  }

  // Error screen.
  if (error && !profile && !isEditing) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <strong>Unable to load profile</strong>
        </div>

        <p className="mt-2">{error}</p>

        <button
          onClick={fetchProfile}
          className="mt-4 underline font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Volunteer Profile
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your skills, experience and availability.
          </p>
        </div>

        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg"
          >
            <Edit size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {isEditing ? (

        /* CREATE / EDIT FORM */
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-6 space-y-7"
        >

          <div>
            <h3 className="text-lg font-semibold">
              {profile ? "Update Volunteer Profile" : "Create Volunteer Profile"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter your information to get matched with suitable volunteer opportunities.
            </p>
          </div>

          {/* Basic information */}
          <section className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <User size={18} />
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Mobility Level
                </label>
                <select
                  name="mobilityLevel"
                  value={formData.mobilityLevel}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Award size={18} />
              Skills and Proficiency
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Skill name"
                className={inputClass + " mt-0"}
              />

              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(Number(e.target.value))}
                className={inputClass + " mt-0"}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addSkill}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-3"
              >
                <Plus size={18} />
                Add Skill
              </button>
            </div>

            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-blue-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-blue-800">
                      {skill.skillName}
                    </p>
                    <p className="text-xs text-blue-600">
                      Proficiency: {skill.proficiency}/5
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500"
                    aria-label="Remove skill"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-4">
            <h4 className="font-semibold">
              Languages
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={languageName}
                onChange={(e) => setLanguageName(e.target.value)}
                placeholder="Language name"
                className={inputClass + " mt-0"}
              />

              <select
                value={languageLevel}
                onChange={(e) => setLanguageLevel(e.target.value)}
                className={inputClass + " mt-0"}
              >
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="FLUENT">Fluent</option>
                <option value="NATIVE">Native</option>
              </select>

              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-3"
              >
                <Plus size={18} />
                Add Language
              </button>
            </div>

            {formData.languages.map((language, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-purple-50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-purple-800">
                    {language.language}
                  </p>
                  <p className="text-xs text-purple-600">
                    {language.proficiency}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-red-500"
                  aria-label="Remove language"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </section>

          {/* Availability */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock size={18} />
                Availability
              </h4>

              <button
                type="button"
                onClick={addAvailability}
                className="flex items-center gap-2 text-blue-600 font-medium"
              >
                <Plus size={18} />
                Add Date
              </button>
            </div>

            {formData.availability.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 border p-4 rounded-xl"
              >
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <input
                    type="date"
                    value={item.date ? item.date.slice(0, 10) : ""}
                    onChange={(e) =>
                      updateAvailability(index, "date", e.target.value)
                    }
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Start Time</label>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) =>
                      updateAvailability(index, "startTime", e.target.value)
                    }
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">End Time</label>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) =>
                      updateAvailability(index, "endTime", e.target.value)
                    }
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="flex items-center justify-center text-red-500"
                  aria-label="Remove availability"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            ))}
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t pt-5">
            {profile && (
              <button
                type="button"
                onClick={() => {
                  setFormData(profile);
                  setIsEditing(false);
                  setError("");
                  setSuccess("");
                }}
                className="px-5 py-2.5 border rounded-lg"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
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

        /* PROFILE DISPLAY */
        <div className="bg-white border rounded-2xl p-6 space-y-6">

          <div className="flex items-center gap-4 border-b pb-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <User size={32} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Volunteer Profile
              </h3>
              <p className="text-gray-500 text-sm">
                {profile.phone}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile.phone || "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mobility Level</p>
              <p className="font-medium">{profile.mobilityLevel || "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium">
                {profile.experienceYears ?? 0} years
              </p>
            </div>
          </div>

          {/* Skills display */}
          <div className="border-t pt-5">
            <h4 className="font-semibold mb-3">Skills</h4>

            <div className="flex flex-wrap gap-3">
              {profile.skills?.length ? (
                profile.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg"
                  >
                    <p className="font-medium">{skill.skillName}</p>
                    <p className="text-xs">
                      Proficiency: {skill.proficiency}/5
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No skills added.</p>
              )}
            </div>
          </div>

          {/* Languages display */}
          <div className="border-t pt-5">
            <h4 className="font-semibold mb-3">Languages</h4>

            <div className="flex flex-wrap gap-3">
              {profile.languages?.length ? (
                profile.languages.map((language, index) => (
                  <div
                    key={index}
                    className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg"
                  >
                    {language.language} — {language.proficiency}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No languages added.</p>
              )}
            </div>
          </div>

          {/* Availability display */}
          <div className="border-t pt-5">
            <h4 className="font-semibold mb-3">Availability</h4>

            <div className="space-y-2">
              {profile.availability?.length ? (
                profile.availability.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <span>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "No date"}
                    </span>

                    <span className="text-gray-500">
                      {item.startTime} – {item.endTime}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No availability added.
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default VolunteerProfileTab;
