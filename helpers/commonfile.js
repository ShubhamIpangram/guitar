const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
dotenv.config();
const CryptoJS = require("crypto-js");
const multer = require("multer");
const nodeMailer = require("nodemailer");
const admin = require("firebase-admin");
let serviceAccount = require("../config/guitar-5c757-firebase-adminsdk-ywtae-fff2102d7a.json");


// bcrypt password
const validPassword = (dbPassword, passwordToMatch) => {
  return bcrypt.compareSync(passwordToMatch, dbPassword);
};

const safeModel = () => {
  return _.omit(this.toObject(), ["password", "__v"]);
};

const generatePassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// generateOTP
function generateOTP() {
  const digits = "123456789";
  let otp = "";
  for (let i = 1; i <= 6; i++) {
    let index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
}


// Encrypt
const encrypt = (message) => {
  return CryptoJS.AES.encrypt(message, process.env.CRYPTO_SECRET).toString();
}
// Decrypt
const decrypt = (ciphertext) => {
  var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.CRYPTO_SECRET);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/musicfiles");
    },
    filename: (req, file, cb) => {
      //   const ext = file.mimetype.split("/")[1];
      console.log("exttt", file)
      cb(null, file.originalname);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "wave") {
      cb(null, true);
    } else {
      cb(new Error("Not a wav File!!"), false);
    }
  }
})

let sendEmail = async (data) => {
  console.log("calling");
  let transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  let info = await transporter.sendMail({
    from: 'noreply@guitar.com',
    to: data.email,
    subject: data.subject,
    html: mailTemp(data.info, data.otp)
  });
  console.log("Message sent: %s", info.messageId);
}
let mailTemp = (info, otp) => {
  let temp = `
    <div>${info}</div>
    <div>OTP: ${otp}</div>
    `
  return temp;
}

const resetPasswordValidation = (data) => {
  var errors = {}

  if (isEmpty(data.otp)) {
    errors.otp = 'otp is required';
  } else {
    if (data.otp.length !== 6) {
      errors.otp = 'otp length 6 digit required';
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "mailto:firebase-adminsdk-c6j06@amap-7235c.iam.gserviceaccount.com",
});




module.exports = {
  validPassword,
  safeModel,
  generatePassword,
  // generateToken,
  generateOTP,
  encrypt,
  decrypt,
  upload,
  sendEmail,
  resetPasswordValidation,
  admin
};