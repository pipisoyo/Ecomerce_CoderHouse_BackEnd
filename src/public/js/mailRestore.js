const form = document.getElementById("restoreForm");

/**
 * Maneja el envío del formulario de restablecimiento de contraseña.
 * @param {Event} e - Evento de envío del formulario.
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  
  fetch("/api/sessions/mailRestore", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (response.status === 200) {
      alert("Email enviado, revise su correo");
      window.location.replace("/login");
    } else {
      alert("Algo salió mal");
    }
  });
});