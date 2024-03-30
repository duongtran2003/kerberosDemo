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
const serviceSessionKey = 'serviceSessionKey'; // gen ngau nhien

const services = {
  'welcome': 'abcxyz', // service secret key shared
}

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.listen('5000', async () => {
  console.log("ticket granting server's up");
});

app.post('/getTicket', (req, res) => {
  console.log(req.body);
  const ticketGrantingTicket = req.body.ticketGrantingTicket;
  const serviceName = req.body.serviceName;
  const userAuthenticator = req.body.userAuthenticator;
  if (!ticketGrantingTicket || !serviceName || !userAuthenticator) {
    return res.status(400).json({
      "message": "bad request",
    });
  }
  const serviceSecretKey = services[serviceName];
  const decryptedUnparsedGrantingTicket = decrypt(ticketGrantingTicket, tgsKey);
  if (!decryptedUnparsedGrantingTicket) {
    return res.status(401).json({
      "message": "unauthorized"
    });
  }
  const decryptedTicketGrantingTicket = JSON.parse(decrypt(ticketGrantingTicket, tgsKey));
  const tgsSessionKey = decryptedTicketGrantingTicket.tgsSessionKey;
  const decryptedUserAuthenticator = decrypt(userAuthenticator, tgsSessionKey);
  if (!decryptedUserAuthenticator) {
    return res.status(401).json({
      "message": "unauthorized"
    });
  }
  if (decryptedUserAuthenticator !== decryptedTicketGrantingTicket.username) {
    return res.status(401).json({
      "message": "unauthorized"
    });
  }
  
  const message1 = {
    serviceName: serviceName,
    serviceSessionKey: serviceSessionKey
  }
  
  const message2 = {
    username: decryptedUserAuthenticator,
    serviceName: serviceName,
    serviceSessionKey: serviceSessionKey
  }
  

  const encryptedMessage1 = encrypt(JSON.stringify(message1), tgsSessionKey);
  const encryptedMessage2 = encrypt(JSON.stringify(message2), serviceSecretKey);
  return res.status(200).json({
    message: encryptedMessage1,
    serviceTicket: encryptedMessage2
  });
});
