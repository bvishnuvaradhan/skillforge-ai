const crypto = require("crypto");
const { verifyToken, signToken } = require("../lib/auth");
const { SessionModel } = require("../models/Session");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_COOKIE_NAME = "sf_token";
const ROTATION_THRESHOLD_MS = 24 * 60 * 60 * 1000; // Rotate if less than 24 hours remaining

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS,
};

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.sf_token;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    const tokenHash = hashToken(token);
    const session = await SessionModel.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ error: "Session expired" });
    }

    session.lastUsedAt = new Date();
    await session.save();

    // Check if session is close to expiring (sliding window rotation)
    const timeRemaining = session.expiresAt.getTime() - Date.now();
    let currentToken = token;
    let currentSession = session;

    if (timeRemaining < ROTATION_THRESHOLD_MS) {
      console.log(`[Auth] Session expiring soon (${Math.round(timeRemaining / 1000 / 60)} min left). Rotating token.`);
      
      // 1. Generate new token
      const newToken = signToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      });

      // 2. Create new session in DB
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      const newSession = await SessionModel.create({
        userId: payload.userId,
        tokenHash: hashToken(newToken),
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.ip || req.socket?.remoteAddress || "",
        expiresAt,
        lastUsedAt: new Date(),
      });

      // 3. Revoke old session
      session.revokedAt = new Date();
      await session.save();

      // 4. Set new cookie
      res.cookie(AUTH_COOKIE_NAME, newToken, cookieOptions);
      currentToken = newToken;
      currentSession = newSession;
    }

    // Compatibility layer: populate both req.auth and req.user
    req.auth = { token: currentToken, payload, session: currentSession };
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { requireAuth, hashToken };