const crypto = require("crypto");
const { verifyToken } = require("../lib/auth");
const { SessionModel } = require("../models/Session");

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

    // Compatibility layer: populate both req.auth and req.user
    req.auth = { token, payload, session };
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { requireAuth, hashToken };