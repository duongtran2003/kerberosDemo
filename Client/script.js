const loginBtn = document.querySelector("#loginBtn");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
var bcrypt = dcodeIO.bcrypt;


let tgsSessionKey = "";
let serviceSessionKey = "";

function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(encrypted, key) {
  return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
}

loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;
  axios.post('http://localhost:4000/authen', {
    username: username,
  })
    .then((res) => {
      tgsSessionKey = decrypt(res.data.encryptedSessionKey, password);
      if (!tgsSessionKey) {
        alert("sai thong tin dang nhap");
      }
      console.log("tgsSessionKey nhan duoc: " + tgsSessionKey);
      axios.post('http://localhost:5000/getTicket', {
        serviceName: 'welcome',
        ticketGrantingTicket: res.data.ticketGrantingTicket,
        userAuthenticator: encrypt(username, tgsSessionKey)
      })
        .then((res) => {
          const unparsedMessage = decrypt(res.data.message, tgsSessionKey);
          if (!unparsedMessage) {
            alert("sai key");
          }
          const message = JSON.parse(unparsedMessage);
          serviceSessionKey = message.serviceSessionKey
          console.log("serviceSessionKey nhan duoc: " + serviceSessionKey);
          axios.post('http://localhost:2000/access', {
            userAuthenticator: encrypt(username, serviceSessionKey),
            serviceTicket: res.data.serviceTicket
          })
            .then((res) => {
              const message = decrypt(res.data.message, serviceSessionKey);
              if (!message) {
                alert("sai key");
              }
              else {
                console.log("message nhan duoc: " + message);
                alert("ok")
              }
            })
            .catch((err) => {
              alert("sai thong tin");
            })
        })
        .catch((err) => {
          alert("sai thong tin");
          console.log(err);
        })
    })
    .catch((err) => {
      alert("sai thong tin dang nhap")
    })
});