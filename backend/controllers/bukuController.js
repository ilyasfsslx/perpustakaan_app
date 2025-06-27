// backend/controllers/bukuController.js
const { pool } = require('../config/db');

// Mengambil semua buku
exports.getAllBuku = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM DaftarBuku');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching all books:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data buku.' });
    }
};

// Mengambil buku berdasarkan ID
exports.getBukuById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM DaftarBuku WHERE BukuID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Buku tidak ditemukan.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching book by ID:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data buku.' });
    }
};

// Menambah buku baru
exports.addBuku = async (req, res) => {
    try {
        const { Judul, Penulis, Penerbit, TahunTerbit, Stok } = req.body;
        if (!Judul || !Penulis || !Stok) {
            return res.status(400).json({ message: 'Judul, Penulis, dan Stok harus diisi.' });
        }
        const [result] = await pool.execute(
            'INSERT INTO DaftarBuku (Judul, Penulis, Penerbit, TahunTerbit, Stok) VALUES (?, ?, ?, ?, ?)',
            [Judul, Penulis, Penerbit, TahunTerbit, Stok]
        );
        res.status(201).json({ message: 'Buku berhasil ditambahkan.', bukuId: result.insertId });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan buku.' });
    }
};

// Memperbarui data buku
exports.updateBuku = async (req, res) => {
    try {
        const { id } = req.params;
        const { Judul, Penulis, Penerbit, TahunTerbit, Stok } = req.body;
        const [result] = await pool.execute(
            'UPDATE DaftarBuku SET Judul = ?, Penulis = ?, Penerbit = ?, TahunTerbit = ?, Stok = ? WHERE BukuID = ?',
            [Judul, Penulis, Penerbit, TahunTerbit, Stok, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Buku tidak ditemukan.' });
        }
        res.json({ message: 'Data buku berhasil diperbarui.' });
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui buku.' });
    }
};

// Menghapus buku
exports.deleteBuku = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM DaftarBuku WHERE BukuID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Buku tidak ditemukan.' });
        }
        res.json({ message: 'Buku berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus buku.' });
    }
};

// Laporan: Buku yang sedang dipinjam
exports.getBorrowedBooks = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                dp.PinjamanID,
                db.Judul,
                db.Penulis,
                a.Nama AS Peminjam,
                dp.TanggalPinjam,
                dp.TanggalJatuhTempo
            FROM
                DaftarPinjaman dp
            JOIN
                DaftarBuku db ON dp.BukuID = db.BukuID
            JOIN
                Anggota a ON dp.AnggotaID = a.AnggotaID
            WHERE
                dp.StatusPinjam = 'Dipinjam'
            ORDER BY
                dp.TanggalPinjam DESC;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching borrowed books:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil daftar buku yang dipinjam.' });
    }
};

// Laporan: Statistik peminjaman buku per bulan
exports.getMonthlyBorrowStats = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(TanggalPinjam, '%Y-%m') AS Bulan,
                COUNT(PinjamanID) AS JumlahPeminjaman
            FROM
                DaftarPinjaman
            GROUP BY
                Bulan
            ORDER BY
                Bulan;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching monthly borrow stats:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil statistik peminjaman.' });
    }
};

// Laporan: Buku yang sudah dikembalikan
exports.getReturnedBooks = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                db.Judul,
                db.Penulis,
                a.Nama AS Peminjam,
                dp.TanggalPinjam,
                dpe.TanggalKembali,
                CASE 
                    WHEN dpe.TanggalKembali <= dp.TanggalJatuhTempo THEN 'Tepat Waktu'
                    ELSE 'Terlambat'
                END AS Status
            FROM
                DaftarPinjaman dp
            JOIN
                DaftarBuku db ON dp.BukuID = db.BukuID
            JOIN
                Anggota a ON dp.AnggotaID = a.AnggotaID
            JOIN
                DaftarPengembalian dpe ON dp.PinjamanID = dpe.PinjamanID
            WHERE
                dp.StatusPinjam = 'Selesai'
            ORDER BY
                dpe.TanggalKembali DESC;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching returned books:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil daftar buku yang dikembalikan.' });
    }
};
