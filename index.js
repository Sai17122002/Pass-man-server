const express = require("express");
const app = express();
const PORT = 3001;
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./model/Shema");
const Pass = require("./model/Pass");
const bcrypt = require("bcryptjs");
const HttpError = require("./model/httpError");
const { encrypt, decrypt } = require("./Encryption.js");
dotenv.config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.URL)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.post("/puttable", async (req, res, next) => {
  const { usname, passc, pinn } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(passc, 12);
  } catch (err) {
    return next(new HttpError(err));
  }
  const newUser = new User({
    Username: usname,
    Password: hashedPassword,
    Pin: pinn,
  });
  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.post("/addpassword", async (req, res, next) => {
  const { password, title, passcode, username } = req.body;

  const hpass = encrypt(password);
  const newPass = new Pass({
    password: hpass.password,
    title: title,
    iv: hpass.iv,
    passcode: passcode,
    username: username,
  });

  try {
    const savedPass = await newPass.save();
    res.status(200).json(savedPass);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.post("/showpass", async (req, res, next) => {
  console.log("showpass");
  const { email } = req.body;
  console.log(email);
  try {
    const passes = await Pass.find({ passcode: email });
    console.log(passes);
    res.status(200).json(passes);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//Login
app.post("/userdet", async (req, res, next) => {
  let users;
  const { email, password } = req.body;
  try {
    users = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: error });
  }
  if (!users) {
    return next(HttpError("Invalid credentials, could not log you in."));
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, users.Password);
  } catch (err) {
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again."
      )
    );
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials, could not log you in."));
  }
  console.log(users.Username, users.Password);
  res.json({
    email: users.Username,
    password: users.Password,
  });
});

app.post("/allusers", async (req, res, next) => {
  let users = await User.find({}, "-Username");
  console.log(users);
  res.json({ data: users });
});

app.post("/decryptpass", (req, res) => {
  res.send(decrypt(req.body));
});

app.post("/:id", async (req, res, next) => {
  let pass;
  try {
    pass = await Pass.find({ _id: req.body.id });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  Pass.remove({ _id: req.body.id }, function (err) {
    if (!err) {
      console.log("success");
    } else {
      console.log("Error");
    }
    res.json(pass);
  });
});

app.listen(PORT);
