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
      cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
      //   const ext = file.mimetype.split("/")[1];
      console.log("exttt", file)
      cb(null, file.originalname.split('.').join('-' + Date.now() + '.'))
    },
  }),

  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype.split("/")[1] === "wave" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "webm") {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Only png, jpg, gif and jpeg images and pdf mp4 , wav, mp3 , docx are allowed!"), false);
  //   }
  // }
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".wav" &&
      ext !== ".jpg" &&
      ext !== ".webm" &&
      ext !== ".jpeg" &&
      ext !== ".mp4" &&
      ext !== ".pdf" &&
      ext !== ".docx"
    ) {
      return callback(
        "Only png, jpg, gif and jpeg images and pdf mp4 docx are allowed!"
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
})

let sendEmail = async (toEmail, subject, bodyHtml, attachments) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    to: toEmail,
    subject: subject,
    html: `${bodyHtml}`,
    attachments: attachments,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

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