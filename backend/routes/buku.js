// backend/routes/buku.js
const express = require('express');
const router = express.Router();
const bukuController = require('../controllers/bukuController');

// Rute untuk buku
router.get('/', bukuController.getAllBuku);
router.get('/:id', bukuController.getBukuById);
router.post('/', bukuController.addBuku);
router.put('/:id', bukuController.updateBuku);
router.delete('/:id', bukuController.deleteBuku);

// Rute laporan terkait buku
router.get('/report/borrowed', bukuController.getBorrowedBooks);
router.get('/report/returned', bukuController.getReturnedBooks);
router.get('/report/monthly-stats', bukuController.getMonthlyBorrowStats);

module.exports = router;
