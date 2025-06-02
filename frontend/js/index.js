document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("formRegistro");
    const formLogin = document.getElementById("formLogin");
    const formAlbum = document.getElementById("formAlbum");

    // Registro de usuario
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const datos = {
                nombre: formRegistro.nombre.value,
                email: formRegistro.email.value,
                password: formRegistro.password.value,
            };

            const res = await fetch("http://localhost:3000/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await res.json();
            alert(resultado.mensaje || "Usuario registrado");
        });
    }

    // Login de usuario
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const datos = {
                email: formLogin.email.value,
                password: formLogin.password.value,
            };

            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await res.json();
            if (resultado.token) {
                localStorage.setItem("token", resultado.token);
                alert("Login exitoso");
                window.location.href = "/frontend/perfil.html";
            } else {
                alert("Error de login");
            }
        });
    }

    // Crear álbum
    if (formAlbum) {
        formAlbum.addEventListener("submit", async (e) => {
            e.preventDefault();

            const titulo = formAlbum.titulo.value;
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:3000/api/albums", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ titulo }),
            });

            const resultado = await res.json();
            alert(resultado.mensaje || "Álbum creado");
        });
    }
});
