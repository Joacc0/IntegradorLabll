// backend/models/Usuario.js
const db = require("../db");

const Usuario = {
    crear: async ({ nombre, email, password, imagen }) => {
        const [result] = await db.query(
            "INSERT INTO usuarios (nombre, email, password, imagen) VALUES (?, ?, ?, ?)",
            [nombre, email, password, imagen]
        );
        return result.insertId;
    },

    buscarPorEmail: async (email) => {
        const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        return rows[0];
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
        return rows[0];
    },

    actualizarPerfil: async (id, { nombre, intereses, antecedentes, imagen }) => {
        const campos = [];
        const valores = [];

        if (nombre) {
            campos.push("nombre = ?");
            valores.push(nombre);
        }
        if (intereses !== undefined) {
            campos.push("intereses = ?");
            valores.push(intereses);
        }
        if (antecedentes !== undefined) {
            campos.push("antecedentes = ?");
            valores.push(antecedentes);
        }
        if (imagen) {
            campos.push("imagen = ?");
            valores.push(imagen);
        }

        valores.push(id);
        const query = `UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`;

        await db.query(query, valores);
    },
};

module.exports = Usuario;