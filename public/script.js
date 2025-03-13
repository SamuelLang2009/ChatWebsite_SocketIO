const socket = io();

let name = "";

let counter = 0;

let mode = 0;

var selectedFile = 0;

let u = getCookie("name")

if(u!=""){
  load(u);
  socket.emit("request", u);
}

const fileInput = document.getElementById('files');
fileInput.onchange = () => {
  selectedFile = fileInput.files[0];
  console.log(selectedFile);
}

document.onkeydown = (event) => {
  if (event.key == "Enter") {
    if(name==""){
      $("#login-button").click();
      return;
    }
    $("#send").click();
  }
};

$("#send").click(function () {
  const message = $("#message").val();
  $("#message").val("");
  let check = 1;
  for(let i = 0; i<message.length; i++){
    if(message[i]=="<"){
      check = 0;
      break;
    }
  }
  if(check && message.length!=0 && message.length<85){
    socket.emit("Send", message, name, $("#dropdown").val(), selectedFile);
  }
});

socket.on("Recieve", (message, sender, reciever) => {
  let check = 1;
  for(let i = 0; i<message.length; i++){
    if(message[i]=="<"){
      check = 0;
      break;
    }
  }
  for(let i = 0; i<sender.length; i++){
    if(sender[i]=="<"){
      check = 0;
      break;
    }
  }
  if(check && message.length!=0){
  if (reciever == "all" || sender == name || reciever == name) {
    if (counter % 2 == 0) {
      $("#messages").append(
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
          "</b></label></div>"
      );
    } else {
      $("#messages").append(
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
          "</b></label></div>"
      );
    }
    counter++;
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
    if ($(window).width() > 600) {
      formatText();
    }
  }
}
});

socket.on("sendUsers", (users) => {
  $("#dropdown").html('<option value="all">All</option>');
  for (const [key, value] of Object.entries(users)) {
    let check = 1
    for(let i = 0; i<value.length; i++){
      if(value[i]=="<"){
        check = 0;
        break;
      }
    }
    if (check) {
      if(value!=name){
        $("#dropdown").append(
          '<option value="' + value + '">' + value + "</option>"
        );
      }
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

$("#register-button").click(function () {
  const username = $("#username").val();
  let check = 1;
  for(let i = 0; i<username.length; i++){
    if(username[i]=="<"){
      check = 0;
      break;
    }
  }
  if(check){
  const password = $("#pwd").val();
  if (username.length > 50) {
    $("#errors").html("Username can't be longer than 40 characters!");
  } else if (username.length < 4) {
    $("#errors").html("Username must be at least 4 characters long!");
  } else if (password.length < 4) {
    $("#errors").html("Password must be at least 4 characters long!");
  } else {
    socket.emit("register", username, password);
  }
}
});

document.getElementById("login-button").addEventListener("click", () => {
  const username = $("#username").val();
  let check = 1;
  for(let i = 0; i<username.length; i++){
    if(username[i]=="<"){
      check = 0;
      break;
    }
  }
  if(check){
  const password = $("#pwd").val();
  socket.emit("login", username, password);
  }
});

socket.on("loadChat", (username) => {
  load(username);
});

socket.on("loginMessage", (message) => {
  $("#errors").html(message);
});

function load(username){
  setCookie("name", username, 3);
  $("#chat").css("display", "block");
  $("#login").css("display", "none");
  $("#currentName").html("Current Name: " + username);
  name = username;
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

$("#logout").click(function(){
  setCookie("name", "", -1);
  location.reload();
})
