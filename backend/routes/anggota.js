// backend/routes/anggota.js
const express = require('express');
const router = express.Router();
const anggotaController = require('../controllers/anggotaController');

// Rute untuk anggota
router.get('/', anggotaController.getAllAnggota);
router.get('/:id', anggotaController.getAnggotaById);
router.post('/', anggotaController.addAnggota);
router.put('/:id', anggotaController.updateAnggota);
router.delete('/:id', anggotaController.deleteAnggota);

// Rute laporan terkait anggota
router.get('/report/active-members', anggotaController.getActiveMembers);

module.exports = router;
