const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.userId = decryptedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
