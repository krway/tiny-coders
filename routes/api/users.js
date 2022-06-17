const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSecret = config.get("jwtSecret");

router.post(
  "/",
  check("email", "Not a valid email").isEmail(),
  check("password", "Give a Strong Password").isLength({ min: 8 }),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(error.array());
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ error: [{ msg: "Already Registered" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(8);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
