const mongoose = require("mongoose");
const config = require("config");

const mongo_uri = config.get("mongo_uri");

const connectDB = async () => {
  try {
    await mongoose.connect(mongo_uri);
    console.log(`Connected`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
