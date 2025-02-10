const socket = io();

let name = "";

let counter = 0;

let mode = 0;

document.onkeydown = (event) => {
  if (event.key == "Enter" && document.getElementById("message").value != "") {
    const message = document.getElementById("message").value;
    document.getElementById("message").value = "";
    socket.emit(
      "Send",
      message,
      name,
      document.getElementById("dropdown").value
    );
  }
};

document.getElementById("send").addEventListener("click", () => {
  const message = document.getElementById("message").value;
  document.getElementById("message").value = "";
  socket.emit("Send", message, name, document.getElementById("dropdown").value);
});

socket.on("Recieve", (message, sender, reciever) => {
  if (reciever == "all" || sender == name || reciever == name) {
    if (counter % 2 == 0) {
      document.getElementById("messages").innerHTML +=
        '<div class="unit" style="margin-bottom: 6px; margin-top: 6px; background-color: lightcyan; padding:4px; outline: 1px solid darkblue"><label id = "d' +
        counter +
        '" class = "lab">' +
        sender +
        " to " +
        reciever +
        ': </label><label id = "' +
        counter +
        '" class = "message"><b>| ' +
        message +
        "</b></label></div>";
    } else {
      document.getElementById("messages").innerHTML +=
        '<div class="unit" style="margin-bottom: 6px; margin-top: 6px; padding:4px; outline: 1px solid darkblue"><label id = "d' +
        counter +
        '" class = "lab">' +
        sender +
        " to " +
        reciever +
        ': </label><label id = "' +
        counter +
        '" class = "message"><b>| ' +
        message +
        "</b></label></div>";
    }
    counter++;
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
    formatText();
    if (sender != name) {
      send_notificataion(sender, message);
    }
  }
});

socket.on("sendUsers", (users) => {
  document.getElementById("dropdown").innerHTML =
    '<option value="all">All</option>';
  for (const [key, value] of Object.entries(users)) {
    if (value != name) {
      document.getElementById("dropdown").innerHTML +=
        '<option value="' + value + '">' + value + "</option>";
    }
  }
});

function formatText() {
  let max_width = 0;
  let labs = document.getElementsByClassName("lab");
  let messages = document.getElementsByClassName("message");
  for (let i = 0; i < labs.length; i++) {
    if (labs[i].getBoundingClientRect().width > max_width) {
      max_width = labs[i].getBoundingClientRect().width;
    }
  }

  for (let i = 0; i < labs.length; i++) {
    document.getElementById(i).style.left =
      max_width -
      document.getElementById("d" + i).getBoundingClientRect().width +
      "px";
  }
}

function send_notificataion(sender, message) {
  // Prüfen, ob der Browser Benachrichtigungen unterstützt
  if ("Notification" in window) {
    // Prüfen, ob die Benachrichtigungserlaubnis bereits erteilt wurde
    if (Notification.permission === "granted") {
      new Notification(sender, {
        body: message,
      });
    }
    // Wenn die Erlaubnis nicht erteilt wurde, Benutzer um Erlaubnis bitten
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Benachrichtigungen aktiviert!", {
            body: "Du hast Benachrichtigungen jetzt aktiviert.",
          });
        }
      });
    }
  } else {
    alert("Benachrichtigungen werden von deinem Browser nicht unterstützt.");
  }
}

document.getElementById("register-button").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("pwd").value;
  if(username.length <  4){
    document.getElementById("errors").innerHTML = "Username must be at least 4 characters long";
  }
  else if(password.length <  4){
    document.getElementById("errors").innerHTML = "Password must be at least 4 characters long";
  }
  else{
    socket.emit("register", username, password);
  }
});

document.getElementById("login-button").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("pwd").value;
  socket.emit("login", username, password);
});

socket.on("loadChat", (username) => {
  document.getElementById("chat").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("currentName").innerHTML = "Current Name: " + username;
  name = username;
});

socket.on("loginMessage", (message) => {
  document.getElementById("errors").innerHTML = message;
});
