        // backend/config/db.js
        const mysql = require('mysql2/promise');
        require('dotenv').config(); // Load environment variables from .env

        // Konfigurasi koneksi database MySQL
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // Pastikan ini diganti dengan password MySQL Anda
            database: process.env.DB_DATABASE || 'perpustakaan_mysql',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test koneksi database saat startup
        pool.getConnection()
            .then(connection => {
                console.log('Koneksi ke database MySQL berhasil!');
                connection.release(); // Lepaskan koneksi kembali ke pool
            })
            .catch(err => {
                console.error('Gagal terhubung ke database MySQL:', err);
                console.error('Pastikan MySQL server berjalan dan kredensial di .env benar.');
                process.exit(1); // Keluar dari aplikasi jika gagal koneksi
            });

        module.exports = { pool };
        