const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn(
    "JWT_SECRET should be a unique 32+ character secret before production deployment."
  );
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,

  issuer: process.env.JWT_ISSUER || "arham-fintech",

  audience: process.env.JWT_AUDIENCE || "arham-portal",

  expiresIn: process.env.JWT_EXPIRES_IN || "1h",

  cookieName: "arham_access",

  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 1000,
    path: "/",
  },
};