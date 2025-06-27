// backend/controllers/pinjamanController.js
const { pool } = require('../config/db');

// Mengambil semua transaksi pinjaman
exports.getAllPinjaman = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                dp.PinjamanID,
                a.Nama AS NamaAnggota,
                db.Judul AS JudulBuku,
                dp.TanggalPinjam,
                dp.TanggalJatuhTempo,
                dp.StatusPinjam
            FROM
                DaftarPinjaman dp
            JOIN
                Anggota a ON dp.AnggotaID = a.AnggotaID
            JOIN
                DaftarBuku db ON dp.BukuID = db.BukuID
            ORDER BY
                dp.TanggalPinjam DESC;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching all borrowings:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pinjaman.' });
    }
};

// Menambah transaksi pinjaman baru menggunakan Stored Procedure
exports.addPinjaman = async (req, res) => {
    try {
        const { AnggotaID, BukuID, TanggalJatuhTempo } = req.body;
        if (!AnggotaID || !BukuID || !TanggalJatuhTempo) {
            return res.status(400).json({ message: 'AnggotaID, BukuID, dan TanggalJatuhTempo harus diisi.' });
        }

        // Panggil Stored Procedure MySQL
        const [result] = await pool.execute('CALL SP_TambahPinjaman(?, ?, ?)', [AnggotaID, BukuID, TanggalJatuhTempo]);

        // SP MySQL mengembalikan hasil sebagai SELECT statement, perlu diakses dengan benar
        // result[0][0] untuk message dan PinjamanID
        if (result && result[0] && result[0][0] && result[0][0].message) {
             res.status(201).json({
                message: result[0][0].message,
                pinjamanId: result[0][0].PinjamanID
            });
        } else {
            // Ini akan menangani SIGNAL SQLSTATE dari SP
            res.status(400).json({ message: 'Operasi pinjaman gagal, cek log server untuk detail.' });
        }

    } catch (err) {
        console.error('Error adding borrowing:', err);
        // Tangani pesan kesalahan dari SIGNAL SQLSTATE di Stored Procedure
        if (err.sqlMessage && err.sqlState === '45000') {
            return res.status(400).json({ message: err.sqlMessage });
        }
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pinjaman.', error: err.message });
    }
};

// Menambah transaksi pengembalian baru menggunakan Stored Procedure
exports.addPengembalian = async (req, res) => {
    try {
        const { PinjamanID, TanggalKembali } = req.body;
        if (!PinjamanID) {
            return res.status(400).json({ message: 'PinjamanID harus diisi.' });
        }

        // Jika TanggalKembali tidak disediakan, gunakan tanggal hari ini
        const actualTanggalKembali = TanggalKembali || new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

        // Panggil Stored Procedure MySQL
        const [result] = await pool.execute('CALL SP_TambahPengembalian(?, ?)', [PinjamanID, actualTanggalKembali]);

        if (result && result[0] && result[0][0] && result[0][0].message) {
            res.status(201).json({
                message: result[0][0].message,
                dendaDikenakan: result[0][0].DendaDikenakan
            });
        } else {
            res.status(400).json({ message: 'Operasi pengembalian gagal, cek log server untuk detail.' });
        }

    } catch (err) {
        console.error('Error adding return:', err);
        // Tangani pesan kesalahan dari SIGNAL SQLSTATE di Stored Procedure
        if (err.sqlMessage && err.sqlState === '45000') {
            return res.status(400).json({ message: err.sqlMessage });
        }
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pengembalian.', error: err.message });
    }
};


// Laporan: Lama waktu peminjaman buku rata-rata
exports.getAverageBorrowDuration = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                AVG(DATEDIFF(dpe.TanggalKembali, dp.TanggalPinjam)) AS RataRataLamaPinjamHari
            FROM
                DaftarPinjaman dp
            JOIN
                DaftarPengembalian dpe ON dp.PinjamanID = dpe.PinjamanID
            WHERE
                dp.StatusPinjam = 'Selesai';
        `);
        // MySQL DATEDIFF returns days
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching average borrow duration:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil rata-rata lama peminjaman.' });
    }
};
