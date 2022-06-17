const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/Auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwtSecret = config.get("jwtSecret");

//Protectet Route
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500);
  }
});

router.post(
  "/",
  check("email", "Not a valid email").isEmail(),
  check("password", "Give a Strong Password").exists(),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(error.array());
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payLoad = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(payLoad, jwtSecret, { expiresIn: 36000 }, (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token });
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
      process.exit(1);
    }
  }
);

module.exports = router;
