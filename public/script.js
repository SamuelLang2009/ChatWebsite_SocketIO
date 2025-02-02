const socket = io();

let name = "";

let counter = 0;

socket.on("Initialize", (id) => {
  name = id;
  document.getElementById("currentName").innerHTML = "Current Name: " + name;
});

document.onkeydown = (event) => {
  if (event.key == "Enter" && document.getElementById("name").value != "") {
    name = document.getElementById("name").value;
    document.getElementById("name").value = "";
    document.getElementById("currentName").innerHTML = "Current Name: " + name;
    socket.emit("nameChange", name);
  }
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

document.getElementById("change").addEventListener("click", () => {
  name = document.getElementById("name").value;
  document.getElementById("name").value = "";
  document.getElementById("currentName").innerHTML = "Current Name: " + name;
  socket.emit("nameChange", name);
});

document.getElementById("send").addEventListener("click", () => {
  const message = document.getElementById("message").value;
  document.getElementById("message").value = "";
  socket.emit("Send", message, name, document.getElementById("dropdown").value);
});

socket.on("Recieve", (message, sender, reciever) => {
  if (counter % 2 == 0) {
    document.getElementById("messages").innerHTML +=
      '<div class="unit" style="background-color: white; padding:4px; outline: 1px solid white"><label id = "d' +
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
      '<div class="unit" style="padding:4px; outline: 1px solid black"><label id = "d' +
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
});

socket.on("sendUsers", (users) => {
  document.getElementById("dropdown").innerHTML =
    '<option value="all">All</option>';
  for (const [key, value] of Object.entries(users)) {
    if (value != name) {
      document.getElementById("dropdown").innerHTML +=
        '<option value="' + key + '">' + value + "</option>";
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

