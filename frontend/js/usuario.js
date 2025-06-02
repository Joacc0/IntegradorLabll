// frontend/js/usuario.js

const API_URL = 'http://localhost:3000'; // Cambia si tu backend está en otro puerto

// REGISTRO
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        formData.append('imagen', document.getElementById('imagen').files[0]);

        const res = await fetch(`${API_URL}/usuarios/registro`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registro exitoso. Inicia sesión.');
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Error en el registro');
        }
    });
}

// PERFIL
if (document.getElementById('perfilForm')) {
    document.addEventListener('DOMContentLoaded', cargarPerfil);
    document.getElementById('perfilForm').addEventListener('submit', actualizarPerfil);
}

async function cargarPerfil() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status === 401) {
        alert('Debes iniciar sesión');
        window.location.href = 'index.html';
        return;
    }

    const usuario = await res.json();

    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('email').value = usuario.email;
    document.getElementById('intereses').value = usuario.intereses || '';
    document.getElementById('antecedentes').value = usuario.antecedentes || '';
    if (usuario.imagenUrl) {
        document.getElementById('previewImagen').src = usuario.imagenUrl;
        document.getElementById('previewImagen').style.display = 'block';
    }
}

async function actualizarPerfil(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('intereses', document.getElementById('intereses').value);
    formData.append('antecedentes', document.getElementById('antecedentes').value);
    if (document.getElementById('imagenPerfil').files[0]) {
        formData.append('imagen', document.getElementById('imagenPerfil').files[0]);
    }

    const res = await fetch(`${API_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (res.ok) {
        alert('Perfil actualizado');
        cargarPerfil();
    } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar perfil');
    }
}