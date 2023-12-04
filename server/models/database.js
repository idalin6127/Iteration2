const mongoose = require("mongoose");
require("dotenv").config();
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect(
//   "mongodb+srv://kansalashutosh24:Ashutosh%407627@cluster0.9esgqkg.mongodb.net/Recipe?retryWrites=true&w=majority",
//   { useNewUrlParser: true, useUnifiedTopology: true }
// );

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection To MongoDb Database Successfull");
});

// Models
require("./Category");
require("./Recipe");
