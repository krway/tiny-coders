const jwt = require("jsonwebtoken");
const config = require("config");

const jwtSecret = config.get("jwtSecret");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No Token Found" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token Validation Failed" });
  }
};

module.exports = auth;
