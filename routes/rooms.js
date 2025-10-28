const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const roomsController = require('../controllers/roomsController');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/rooms/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unik
  }
});

const upload = multer({ storage });

// CRUD kamar
router.get('/', roomsController.getAllRooms);
router.get('/:id', roomsController.getRoomById);
router.get('/kos/:kos_id', roomsController.getRoomsByKos);
router.post('/', roomsController.createRoom);
router.put('/:id', roomsController.updateRoom);
router.delete('/:id', roomsController.deleteRoom);

// Upload gambar kamar
router.post('/:room_id/images', upload.single('file'), roomsController.uploadRoomImage);
router.get('/:room_id/images', roomsController.getRoomImages);
router.delete('/images/:id', roomsController.deleteRoomImage);

module.exports = router;
