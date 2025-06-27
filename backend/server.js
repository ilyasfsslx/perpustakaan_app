        // backend/server.js
        const express = require('express');
        const cors = require('cors');
        require('dotenv').config(); // Untuk memuat variabel lingkungan dari .env
        const { pool } = require('./config/db'); // Hanya import pool, tidak lagi fungsi create
        const bukuRoutes = require('./routes/buku');
        const anggotaRoutes = require('./routes/anggota');
        const pinjamanRoutes = require('./routes/pinjaman');

        const app = express();
        const PORT = process.env.PORT || 5000;

        // Middleware
        app.use(cors()); // Izinkan semua permintaan lintas asal (Cross-Origin Resource Sharing)
        app.use(express.json()); // Parser untuk body permintaan JSON

        // Rute API
        app.use('/api/buku', bukuRoutes);
        app.use('/api/anggota', anggotaRoutes);
        app.use('/api/pinjaman', pinjamanRoutes);

        // Rute dasar untuk menguji server
        app.get('/', (req, res) => {
            res.send('Perpustakaan API is running!');
        });

        // Penanganan kesalahan umum
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Ada yang salah!');
        });

        // Mulai server
        app.listen(PORT, () => {
            console.log(`Server backend berjalan di port ${PORT}`);
            console.log(`Akses: http://localhost:${PORT}`);
        });
        