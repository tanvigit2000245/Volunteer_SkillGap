export const validateLocation = (req, res, next) => {
  const { name, date, shiftStart, shiftEnd, status, requirements } = req.body;

  // On POST (creation), name, date, shiftStart, shiftEnd are mandatory
  if (req.method === "POST") {
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Location name is required" });
    }
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, message: "A valid operational date is required" });
    }
    if (!shiftStart || typeof shiftStart !== "string" || !shiftStart.trim()) {
      return res.status(400).json({ success: false, message: "shiftStart time is required (e.g., '09:00')" });
    }
    if (!shiftEnd || typeof shiftEnd !== "string" || !shiftEnd.trim()) {
      return res.status(400).json({ success: false, message: "shiftEnd time is required (e.g., '17:00')" });
    }
  }

  // On PUT/PATCH, if fields are provided, validate them
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ success: false, message: "Location name must be a non-empty string" });
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, message: "A valid operational date is required" });
  }

  if (status !== undefined && !["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be one of: 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'",
    });
  }

  if (requirements !== undefined) {
    if (!Array.isArray(requirements)) {
      return res.status(400).json({ success: false, message: "requirements must be an array" });
    }

    for (let i = 0; i < requirements.length; i++) {
      const r = requirements[i];
      if (!r.task || typeof r.task !== "string" || !r.task.trim()) {
        return res.status(400).json({
          success: false,
          message: `Requirement at index ${i} requires a valid task name`,
        });
      }
      if (!r.requiredSkill || typeof r.requiredSkill !== "string" || !r.requiredSkill.trim()) {
        return res.status(400).json({
          success: false,
          message: `Requirement '${r.task}' requires a valid requiredSkill string`,
        });
      }
      if (
        r.minProficiency !== undefined &&
        (typeof r.minProficiency !== "number" || r.minProficiency < 1 || r.minProficiency > 5)
      ) {
        return res.status(400).json({
          success: false,
          message: `Requirement '${r.task}' minProficiency must be between 1 and 5`,
        });
      }
      if (
        r.minLanguageFluency !== undefined &&
        !["BASIC", "CONVERSATIONAL", "FLUENT"].includes(r.minLanguageFluency)
      ) {
        return res.status(400).json({
          success: false,
          message: `Requirement '${r.task}' minLanguageFluency must be 'BASIC', 'CONVERSATIONAL', or 'FLUENT'`,
        });
      }
      if (
        r.minMobilityLevel !== undefined &&
        !["Low", "Medium", "High"].includes(r.minMobilityLevel)
      ) {
        return res.status(400).json({
          success: false,
          message: `Requirement '${r.task}' minMobilityLevel must be 'Low', 'Medium', or 'High'`,
        });
      }
      if (
        r.requiredCount === undefined ||
        typeof r.requiredCount !== "number" ||
        r.requiredCount < 1
      ) {
        return res.status(400).json({
          success: false,
          message: `Requirement '${r.task}' requires a valid requiredCount (at least 1)`,
        });
      }
    }
  }

  next();
};

export const validateRequirement = (req, res, next) => {
  const { task, requiredSkill, minProficiency, minLanguageFluency, minMobilityLevel, requiredCount } = req.body;

  if (!task || typeof task !== "string" || !task.trim()) {
    return res.status(400).json({ success: false, message: "Task description/role is required" });
  }

  if (!requiredSkill || typeof requiredSkill !== "string" || !requiredSkill.trim()) {
    return res.status(400).json({ success: false, message: "requiredSkill is required" });
  }

  if (minProficiency !== undefined && (typeof minProficiency !== "number" || minProficiency < 1 || minProficiency > 5)) {
    return res.status(400).json({ success: false, message: "minProficiency must be between 1 and 5" });
  }

  if (minLanguageFluency !== undefined && !["BASIC", "CONVERSATIONAL", "FLUENT"].includes(minLanguageFluency)) {
    return res.status(400).json({ success: false, message: "minLanguageFluency must be 'BASIC', 'CONVERSATIONAL', or 'FLUENT'" });
  }

  if (minMobilityLevel !== undefined && !["Low", "Medium", "High"].includes(minMobilityLevel)) {
    return res.status(400).json({ success: false, message: "minMobilityLevel must be 'Low', 'Medium', or 'High'" });
  }

  if (requiredCount === undefined || typeof requiredCount !== "number" || requiredCount < 1) {
    return res.status(400).json({ success: false, message: "requiredCount must be a number >= 1" });
  }

  next();
};
