// server/tempBlock.js
const blockedIPs = new Map(); // IP -> unblock timestamp
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes

export function checkBlockedIP(req, res, next) {
  const now = Date.now();
  const unblockTime = blockedIPs.get(req.ip);

  if (unblockTime && unblockTime > now) {
    return res.status(429).json({
      success: false,
      message: "Too many suspicious requests. Try again later.",
    });
  }

  // Remove expired block
  if (unblockTime && unblockTime <= now) {
    blockedIPs.delete(req.ip);
  }

  next();
}

export function blockIP(ip) {
  const unblockTime = Date.now() + BLOCK_TIME;
  blockedIPs.set(ip, unblockTime);
}
