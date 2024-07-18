const socket = io();

let user;

/**
 * Función que se ejecuta al cargar la página.
 */
window.onload = () => {
  Swal.fire({
    title: 'Identifícate',
    text: 'Ingresa tu email',
    input: "text",
    inputValidator: (value) => {
      return !value && "Necesitas escribir un mail valido para continuar";
    },
    confirmButtonText: 'OK'
  }).then((result) => {
    user = result.value;
    socket.emit('auth', user);
  });
};

const chatbox = document.getElementById("chatbox");
const log = document.getElementById("log");
const sendButton = document.getElementById("sendButton");

/**
 * Escucha el evento de clic en el botón de enviar y envía el mensaje al servidor.
 */
sendButton.addEventListener('click', () => {
  const message = chatbox.value.trim();
  if (message !== "") {
    socket.emit('message', { user: user, message: message });
    chatbox.value = "";
  }
});

/**
 * Escucha los mensajes recibidos del servidor y los muestra en el chat.
 * @param {Array} data - Datos de los mensajes recibidos.
 */
socket.on('messageLogs', data => {
  let messages = "";
  data.forEach(msg => {
    messages += `${msg.user} dice ${msg.message}<br/>`;
  });
  log.innerHTML = messages;
});