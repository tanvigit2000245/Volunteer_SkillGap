export const validateVolunteerProfile = (req, res, next) => {
  const { mobilityLevel, experienceYears, skills, languages, availability } = req.body;

  if (mobilityLevel && !["Low", "Medium", "High"].includes(mobilityLevel)) {
    return res.status(400).json({
      success: false,
      message: "mobilityLevel must be one of: 'Low', 'Medium', 'High'",
    });
  }

  if (experienceYears !== undefined && (typeof experienceYears !== "number" || experienceYears < 0)) {
    return res.status(400).json({
      success: false,
      message: "experienceYears must be a non-negative number",
    });
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "skills must be an array of skill items",
      });
    }

    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      const name = s.skillName || s.skill;
      if (!name || typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: `Skill at index ${i} requires a valid skillName or skill string`,
        });
      }
      if (s.proficiency !== undefined && (typeof s.proficiency !== "number" || s.proficiency < 1 || s.proficiency > 5)) {
        return res.status(400).json({
          success: false,
          message: `Skill '${name}' proficiency must be a number between 1 and 5`,
        });
      }
    }
  }

  if (languages !== undefined) {
    if (!Array.isArray(languages)) {
      return res.status(400).json({
        success: false,
        message: "languages must be an array of language items",
      });
    }

    for (let i = 0; i < languages.length; i++) {
      const l = languages[i];
      if (!l.language || typeof l.language !== "string") {
        return res.status(400).json({
          success: false,
          message: `Language at index ${i} requires a valid language string`,
        });
      }
      if (l.proficiency && !["BASIC", "CONVERSATIONAL", "FLUENT"].includes(l.proficiency)) {
        return res.status(400).json({
          success: false,
          message: `Language '${l.language}' proficiency must be 'BASIC', 'CONVERSATIONAL', or 'FLUENT'`,
        });
      }
    }
  }

  if (availability !== undefined) {
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "availability must be an array of date/time slots",
      });
    }

    for (let i = 0; i < availability.length; i++) {
      const a = availability[i];
      if (!a.date || isNaN(Date.parse(a.date))) {
        return res.status(400).json({
          success: false,
          message: `Availability at index ${i} requires a valid date`,
        });
      }
      if (!a.startTime || !a.endTime) {
        return res.status(400).json({
          success: false,
          message: `Availability at index ${i} requires startTime and endTime strings`,
        });
      }
    }
  }

  next();
};
