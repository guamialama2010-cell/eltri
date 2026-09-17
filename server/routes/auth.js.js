import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getQuery } from '../db.js';

const router = express.Router();

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol, grado, curso } = req.body;

    // Validaciones
    if (!nombre || !correo || !contraseña || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (!['profesor', 'estudiante'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    if (rol === 'estudiante' && (!grado || !curso)) {
      return res.status(400).json({ error: 'Estudiantes deben proporcionar grado y curso' });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await getQuery('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // Crear usuario
    const resultado = await runQuery(
      `INSERT INTO usuarios (nombre, correo, contraseña, rol, grado, curso) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, correo, contraseñaEncriptada, rol, grado || null, curso || null]
    );

    // Crear token
    const token = jwt.sign(
      { id: resultado.id, correo, rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Registro exitoso',
      token,
      usuario: { id: resultado.id, nombre, correo, rol }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    // Buscar usuario
    const usuario = await getQuery('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        grado: usuario.grado,
        curso: usuario.curso
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

export default router;
