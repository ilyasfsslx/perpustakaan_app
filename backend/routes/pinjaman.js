// backend/routes/pinjaman.js
const express = require('express');
const router = express.Router();
const pinjamanController = require('../controllers/pinjamanController');

// Rute untuk pinjaman
router.get('/', pinjamanController.getAllPinjaman);
router.post('/borrow', pinjamanController.addPinjaman); // Untuk menambah transaksi pinjaman
router.post('/return', pinjamanController.addPengembalian); // Untuk menambah transaksi pengembalian

// Rute laporan terkait pinjaman/pengembalian
router.get('/report/average-duration', pinjamanController.getAverageBorrowDuration);

module.exports = router;
