const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer=require('nodemailer')
const checkAuth=require("../middleware/check-auth")
router.get("/",checkAuth,(req, res, next) => {
  User.find()
    .then((result) => {
      res.status(200).json({ UserData: result });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/:id", (req, res, next) => {
  User.findById(req.params.id)
    .then((result) => {
      res.status(200).json({ Studentdata: result });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.put("/:id", (req, res, next) => {
  console.log(req.params.id);
  User.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        userName: req.body.userName,
        email: req.body.email,
        userType: req.body.userType,
        phone: req.body.phone,
      },
    }
  )
    .then((result) => {
      res.status(200).json({ message: "successfully updated", result: result });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.delete("/:id", (req, res, next) => {
  User.remove({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        message: "successfully deleted",
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});
router.post("/signup", (req, res, next) => {
  // bcrypt.hash(plaintextPassword, salt, function(err, hash) {
  //     // Store hash in the database
  // });
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      console.log("hash", hash);
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        userName: req.body.userName,
        email: req.body.email,
        password: hash,
        userType: req.body.userType,
        phone: req.body.phone,
      });
      user
        .save()
        .then((result) => {
          res.status(200).json({
            newUser: result,
          });
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    }
  });
});
router.post("/login", (req, res, next) => {
  User.find({ userName: req.body.userName })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({ msg: "user not exist" });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        console.log(req.body.password, user[0], "Password match");
        console.log("result", result);
        if (!result) {
          return res.status(401).json({ msg: "password macthing fail" });
        }
        if (result) {
          const token = jwt.sign(
            {
              userName: user[0].userName,
              userType: user[0].userType,
              email: user[0].email,
              phone: user[0].phone,
            },
            "this is dummy text",
            {
              expiresIn: "24h",
            }
          );
          res.status(200).json({
            userName: user[0].userName,
            userType: user[0].userType,
            email: user[0].email,
            phone: user[0].phone,
            token: token,
          });
        } 
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.post("/sendemail",(req,res,next)=>{
  async function main() {
    let testAccount = await nodemailer.createTestAccount();
  
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass,
      },
    });
  
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <vikashchbca@gmail.com>', 
      to: "mrshaileshgupta03@gmail.com",
      subject: "Hello ✔",
      text: "Hello world?",
      // html: "<b>Hello world?</b>", 
    });
  if(info.messageId){
    res.send("Email Sent")
  }else{
    res.send("email not sent")
  }
    console.log("Message sent: %s", info.messageId);  
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
  
  main().catch(console.error);
})

module.exports = router;
