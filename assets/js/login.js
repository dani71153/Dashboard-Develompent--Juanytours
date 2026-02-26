// 1️⃣ Esperar que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  
    // Obtenemos el elemento del DOM para poder trabajar sobre el.
  // 2️⃣ Referencias a elementos
  const form = document.getElementById("login_form");

  // 3️⃣ Escuchar submit  : Agregamos un evento para que al momento de presionar el boton o darle a enter 
  // (Definido)
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    //Al presionar se envian los valores a estas constantes. 
    // 4️⃣ Obtener valores
    const email = document.getElementById("email").value.trim(); // Recortamos de espacios.
    const password = document.getElementById("password").value;


    // Basicamente, esto aqui verifica que tengan contenido.
    // 5️⃣ Validación básica
    if (!email || !password) {
      return;
    }

    //Proceso de verificacion de si existe un usuario. 
    // 6️⃣ Autenticación mock
    const usuarioValido = autenticar(email, password);

  if (usuarioValido) {
      console.log("Login correcto");
      // Aquí luego irá la sesión y redirección

    // Se crea una constante que sera basicamente la prueba de que tenemos acceso de manera temporal a la pagina web.
    const session = {
    user: email,
    expires: Date.now() + (30 * 60 * 1000) // 30 minutos 
    };

      localStorage.setItem("session", JSON.stringify(session));
      window.location.href="http://127.0.0.1:3000/index.html"

    } else {
        console.log("Contraseña o Email incorrectos che :)");
    }
  });

  // 🔹 Función autenticación mock
  function autenticar(email, password) {
    const MOCK_USER = {
      email: "admin@juanytours.com",
      password: "123456"
    };

    return email === MOCK_USER.email && password === MOCK_USER.password; //retorna true.
  }
});