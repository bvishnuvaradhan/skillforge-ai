const crypto = require("crypto");
const { Router } = require("express");
const { comparePassword, hashPassword, signToken } = require("../lib/auth");
const { requireAuth, hashToken } = require("../middleware/auth");
const { SessionModel } = require("../models/Session");
const { SettingModel } = require("../models/Setting");
const { UserModel } = require("../models/User");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_COOKIE_NAME = "sf_token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
  maxAge: SESSION_TTL_MS,
};

const router = Router();

function toAuthUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
}

async function createSession(user, req) {
  const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await SessionModel.create({
    userId: user._id,
    tokenHash: hashToken(token),
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket?.remoteAddress || "",
    expiresAt,
    lastUsedAt: new Date(),
  });
  return token;
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
}

async function syncSettings(userId, profile) {
  await SettingModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        theme: profile.theme,
        avatarUrl: profile.avatarUrl || "",
      },
    },
    { upsert: true, new: true },
  );
}

router.post("/signup", async (req, res) => {
  const { email, password, fullName = "", targetRole = "", avatarUrl = "", goals = [] } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const passwordHash = await hashPassword(String(password));
  const user = await UserModel.create({
    email: normalizedEmail,
    passwordHash,
    profile: {
      fullName: String(fullName),
      targetRole: String(targetRole),
      avatarUrl: String(avatarUrl),
      goals: Array.isArray(goals) ? goals.map((goal) => String(goal)).filter(Boolean) : [],
      codingProfiles: {},
      theme: "system",
    },
  });

  await syncSettings(user._id, user.profile);

  const token = await createSession(user, req);
  setAuthCookie(res, token);
  res.status(201).json({ token, user: toAuthUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await comparePassword(String(password), user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = await createSession(user, req);
  setAuthCookie(res, token);
  res.json({ token, user: toAuthUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.auth.payload.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user: toAuthUser(user) });
});

router.patch("/profile", requireAuth, async (req, res) => {
  const { fullName, targetRole, avatarUrl, goals, codingProfiles, theme } = req.body ?? {};

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.auth.payload.userId,
    {
      $set: {
        ...(typeof fullName === "string" ? { "profile.fullName": fullName } : {}),
        ...(typeof targetRole === "string" ? { "profile.targetRole": targetRole } : {}),
        ...(typeof avatarUrl === "string" ? { "profile.avatarUrl": avatarUrl } : {}),
        ...(Array.isArray(goals) ? { "profile.goals": goals.map(String) } : {}),
        ...(codingProfiles && typeof codingProfiles === "object"
          ? {
              "profile.codingProfiles.leetcode": String(codingProfiles.leetcode ?? ""),
              "profile.codingProfiles.codechef": String(codingProfiles.codechef ?? ""),
              "profile.codingProfiles.github": String(codingProfiles.github ?? ""),
            }
          : {}),
        ...(typeof theme === "string" ? { "profile.theme": theme } : {}),
      },
    },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }

  await syncSettings(updatedUser._id, updatedUser.profile);

  return res.json({ user: toAuthUser(updatedUser) });
});

router.post("/logout", requireAuth, async (req, res) => {
  await SessionModel.updateOne(
    { tokenHash: hashToken(req.auth.token) },
    { $set: { revokedAt: new Date() } },
  );

  clearAuthCookie(res);

  return res.json({ ok: true });
});

module.exports = { authRouter: router };