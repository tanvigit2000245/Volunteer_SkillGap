import test from "node:test";
import assert from "node:assert";
import {
  validateRegister,
  validateLogin,
} from "../src/validators/auth.validator.js";
import {
  validateVolunteerProfile,
} from "../src/validators/volunteer.validator.js";
import {
  validateLocation,
} from "../src/validators/location.validator.js";

// Helper to simulate express req, res, next
const createMockReqRes = (body = {}, method = "POST") => {
  const req = { body, method };
  let statusResult = null;
  let jsonResult = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusResult = code;
      return this;
    },
    json(data) {
      jsonResult = data;
      return this;
    },
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getResponse: () => ({ status: statusResult, json: jsonResult, nextCalled }) };
};

test("validateRegister: blocks missing required fields", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    email: "test@example.com",
    fullName: "Test User",
    // password missing
    role: "volunteer",
  });

  validateRegister(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.json.success, false);
  assert.strictEqual(result.nextCalled, false);
});

test("validateRegister: enforces minimum password length (>=8)", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    email: "test@example.com",
    fullName: "Test User",
    password: "123",
    role: "volunteer",
  });

  validateRegister(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.status, 400);
  assert.match(result.json.message, /Password must be at least 8 characters/);
  assert.strictEqual(result.nextCalled, false);
});

test("validateRegister: passes with valid payload", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    email: "test@example.com",
    fullName: "Test User",
    password: "securePassword123",
    role: "volunteer",
  });

  validateRegister(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.nextCalled, true);
  assert.strictEqual(result.status, null);
});

test("validateLogin: blocks when email or password is missing", () => {
  const { req, res, next, getResponse } = createMockReqRes({ email: "test@example.com" });
  validateLogin(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.nextCalled, false);
});

test("validateVolunteerProfile: validates mobilityLevel enum", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    mobilityLevel: "SuperHigh", // Invalid
  });

  validateVolunteerProfile(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.status, 400);
  assert.match(result.json.message, /mobilityLevel must be one of/);
});

test("validateVolunteerProfile: passes with valid data", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    mobilityLevel: "High",
    experienceYears: 2,
    skills: [{ skill: "First Aid", proficiency: 3 }],
    languages: [{ language: "English", fluency: "FLUENT" }],
  });

  validateVolunteerProfile(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.nextCalled, true);
});

test("validateLocation: requires name, date, shiftStart, and shiftEnd on POST", () => {
  const { req, res, next, getResponse } = createMockReqRes({
    name: "Shelter A",
    // date missing
    shiftStart: "09:00",
    shiftEnd: "17:00",
  }, "POST");

  validateLocation(req, res, next);
  const result = getResponse();
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.nextCalled, false);
});

