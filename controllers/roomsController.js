const db = require('../db');
const path = require('path');
const fs = require('fs');

// ===================== CRUD KAMAR =====================

exports.getAllRooms = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Kamar tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomsByKos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE kos_id = ?', [req.params.kos_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  const { kos_id, room_number, price_per_month, status, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO rooms (kos_id, room_number, price_per_month, status, description) VALUES (?, ?, ?, ?, ?)',
      [kos_id, room_number, price_per_month, status, description]
    );
    res.json({ id: result.insertId, message: 'Kamar berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  const { room_number, price_per_month, status, description } = req.body;
  try {
    await db.query(
      'UPDATE rooms SET room_number=?, price_per_month=?, status=?, description=? WHERE id=?',
      [room_number, price_per_month, status, description, req.params.id]
    );
    res.json({ message: 'Kamar berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await db.query('DELETE FROM rooms WHERE id=?', [req.params.id]);
    res.json({ message: 'Kamar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== GAMBAR KAMAR =====================

exports.uploadRoomImage = async (req, res) => {
  const { room_id } = req.params;
  const file = req.file ? req.file.filename : null;

  if (!file) return res.status(400).json({ message: 'Tidak ada file yang diupload' });

  try {
    await db.query('INSERT INTO room_images (room_id, file) VALUES (?, ?)', [room_id, file]);
    res.json({ message: 'Gambar kamar berhasil diupload', file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomImages = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM room_images WHERE room_id = ?', [req.params.room_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoomImage = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT file FROM room_images WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Gambar tidak ditemukan' });

    const filePath = path.join(__dirname, '..', 'uploads', 'rooms', rows[0].file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM room_images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gambar kamar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
