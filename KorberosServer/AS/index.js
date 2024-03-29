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

const tgsSessionKey = 'tgsSessionkey'; // gen ngau nhien
const tgsKey = 'tgsKey'; // shared 

const users = {
  'username1': 'password1'
}

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.listen('4000', async () => {
  console.log("authentication server's up");
});

app.post('/authen', (req, res) => {
  const username = req.body.username;
  if (!users[username]) {
    return res.status(401).json({
      "message": "wrong credentials",
    });
  }
  const encryptedSessionKey = encrypt(tgsSessionKey, users[username]);
  const data = {
    username: username,
    tgsSessionKey: tgsSessionKey
  }
  const ecryptedData = encrypt(JSON.stringify(data), tgsKey);
  
  return res.status(200).json({
    encryptedSessionKey: encryptedSessionKey,
    ticketGrantingTicket: ecryptedData,
  });
});

// client gui len: {
//   username,
// }

// tra ve {
//   encryptedSessionKey,
//   ticketGrantingTicket,
// }