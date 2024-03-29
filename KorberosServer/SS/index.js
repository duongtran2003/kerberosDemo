import express from "express";
import cors from "cors";
import CryptoJS from "crypto-js";

const app = express();

function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(encrypted, key) {
  return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
}

const tgsKey = 'tgsKey'; // shared 
const serviceKey = 'abcxyz' // service secret key shared

const services = {
  'welcome': 'abcxyz',
}

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.listen('2000', async () => {
  console.log("service server's up");
});

app.post('/access', (req, res) => {
  const userAuthenticator = req.body.userAuthenticator;
  const serviceTicket = req.body.serviceTicket;
  const decryptedUnparsedServiceTicket = decrypt(serviceTicket, serviceKey);
  if (!decryptedUnparsedServiceTicket) {
    console.log(1);
    return res.status(401).json({
      "message": "unauthorized",
    });
  }
  const decryptedServiceTicket = JSON.parse(decryptedUnparsedServiceTicket);
  const serviceSessionKey = decryptedServiceTicket.serviceSessionKey;
  const decryptedUserAuthenticator = decrypt(userAuthenticator, serviceSessionKey);
  if (!decryptedUserAuthenticator) {
    console.log(2);
    return res.status(401).json({
      "message": "unauthorized",
    });
  }
  if (decryptedUserAuthenticator !== decryptedServiceTicket.username) {
    console.log(3);
    return res.status(401).json({
      "message": "unauthorized",
    });
  }
  const message = "ur in B)";
  const encryptedMessage = encrypt(message, serviceSessionKey);
  return res.status(200).json({
    "message": encryptedMessage
  })
});
