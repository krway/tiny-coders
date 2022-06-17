const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/Auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//personal Profile
//private route
router.get("/", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "Profile not created" });
    }
    //profile = profile.concat(user);
    res.json(profile);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//update and create profile
//private route
router.post("/", auth, async (req, res) => {
  const {
    company,
    location,
    bio,
    status,
    githubUsername,
    skills,
    youtube,
    twitter,
    instagram,
    linkedin,
  } = req.body;
  let profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubUsername) profileFields.githubUsername = githubUsername;
  if (company) profileFields.company = company;
  if (skills)
    profileFields.skills = skills.split(",").map((skill) => skill.trim());
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      res.json(profile);
    } else {
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//All profiles Route
//public route
router.get("/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//Delete User and Profile
//Private Route
router.delete("/", auth, async (req, res) => {
  try {
    //Delete Profile
    await Profile.findOneAndDelete({ user: req.user.id });

    //Delete User
    await User.findByIdAndDelete(req.user.id);
    res.send("User deleted Successfully");
  } catch (err) {
    res.status(500).send("server error");
  }
});

//Add experience
//Private Route
router.put("/experience", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    const { title, company, from, to, current, description } = req.body;
    const newExperience = {
      title,
      company,
      from,
      to,
      current,
      description,
    };
    profile.experience.push(newExperience);
    await profile.save();
    res.send(profile);
  } catch (err) {
    res.status(500).send("Server Errors");
  }
});

//Delete experience
//Private Route
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    const index = profile.experience
      .map((object) => object.id)
      .indexOf(req.params.exp_id);
    if (index != -1) profile.experience.splice(index, 1);
    await profile.save();
    res.send(profile);
  } catch {
    res.status(500).send("Server Errors");
  }
});

//Add Education
//Private Route
router.put("/education", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    const { school, degree, from, to, current } = req.body;
    const newEducation = {
      school,
      degree,
      from,
      to,
      current,
    };
    profile.education.push(newEducation);
    await profile.save();
    res.send(profile);
  } catch (err) {
    res.status(500).send("Server Errors");
  }
});

//Delete experience
//Private Route
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    const index = profile.education
      .map((object) => object.id)
      .indexOf(req.params.edu_id);
    console.log(index);
    if (index != -1) profile.education.splice(index, 1);
    await profile.save();
    res.send(profile);
  } catch {
    res.status(500).send("Server Errors");
  }
});

module.exports = router;
