document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const path = window.location.pathname;

    // Redirección si no hay token y se intenta entrar a perfil
    if (path.includes("perfil.html") && !token) {
        window.location.href = "index.html";
    }

    // --- REGISTRO ---
    if (path.includes("register.html")) {
        const form = document.getElementById("registerForm");
        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const imagen = document.getElementById("imagen").files[0];

            if (!nombre || !email || !password) {
                alert("Todos los campos obligatorios deben completarse");
                return;
            }

            const formData = new FormData();
            formData.append("nombre", nombre);
            formData.append("email", email);
            formData.append("password", password);
            if (imagen) formData.append("imagen", imagen);

            const res = await fetch("/api/usuarios/registro", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "perfil.html";
            } else {
                alert(data.mensaje || "Error al registrarse");
            }
        });
    }

    // --- PERFIL ---
    if (path.includes("perfil.html")) {
        const form = document.getElementById("perfilForm");
        const logoutBtn = document.getElementById("logoutBtn");

        async function cargarPerfil() {
            const res = await fetch("/api/usuarios/perfil", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "index.html";
                return;
            }

            const user = await res.json();
            document.getElementById("nombre").value = user.nombre;
            document.getElementById("email").value = user.email;
            document.getElementById("intereses").value = user.intereses || "";
            document.getElementById("antecedentes").value = user.antecedentes || "";
            if (user.imagenPerfil) {
                const preview = document.getElementById("previewImagen");
                preview.src = user.imagenPerfil;
                preview.style.display = "block";
            }
        }

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value.trim();
            const intereses = document.getElementById("intereses").value;
            const antecedentes = document.getElementById("antecedentes").value;
            const imagen = document.getElementById("imagenPerfil").files[0];

            if (!nombre) {
                alert("El nombre no puede estar vacío");
                return;
            }

            const formData = new FormData();
            formData.append("nombre", nombre);
            formData.append("intereses", intereses);
            formData.append("antecedentes", antecedentes);
            if (imagen) formData.append("imagenPerfil", imagen);

            const res = await fetch("/api/usuarios/perfil", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "index.html";
                return;
            }

            alert("Perfil actualizado");
        });

        logoutBtn?.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });

        cargarPerfil();
    }
});