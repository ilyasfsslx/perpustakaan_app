// backend/controllers/anggotaController.js
const { pool } = require('../config/db');

// Mengambil semua anggota
exports.getAllAnggota = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Anggota');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching all members:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data anggota.' });
    }
};

// Mengambil anggota berdasarkan ID
exports.getAnggotaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM Anggota WHERE AnggotaID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Anggota tidak ditemukan.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching member by ID:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data anggota.' });
    }
};

// Menambah anggota baru
exports.addAnggota = async (req, res) => {
    try {
        const { Nama, Alamat, Telepon } = req.body;
        if (!Nama) {
            return res.status(400).json({ message: 'Nama harus diisi.' });
        }
        const [result] = await pool.execute(
            'INSERT INTO Anggota (Nama, Alamat, Telepon) VALUES (?, ?, ?)',
            [Nama, Alamat, Telepon]
        );
        res.status(201).json({ message: 'Anggota berhasil ditambahkan.', anggotaId: result.insertId });
    } catch (err) {
        console.error('Error adding member:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan anggota.' });
    }
};

// Memperbarui data anggota
exports.updateAnggota = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nama, Alamat, Telepon } = req.body;
        const [result] = await pool.execute(
            'UPDATE Anggota SET Nama = ?, Alamat = ?, Telepon = ? WHERE AnggotaID = ?',
            [Nama, Alamat, Telepon, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Anggota tidak ditemukan.' });
        }
        res.json({ message: 'Data anggota berhasil diperbarui.' });
    } catch (err) {
        console.error('Error updating member:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui anggota.' });
    }
};

// Menghapus anggota
exports.deleteAnggota = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM Anggota WHERE AnggotaID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Anggota tidak ditemukan.' });
        }
        res.json({ message: 'Anggota berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting member:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus anggota.' });
    }
};

// Laporan: Daftar peminjam buku paling aktif
exports.getActiveMembers = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                a.Nama AS NamaPeminjam,
                COUNT(dp.AnggotaID) AS TotalPeminjaman
            FROM
                Anggota a
            JOIN
                DaftarPinjaman dp ON a.AnggotaID = dp.AnggotaID
            WHERE
                dp.StatusPinjam = 'Selesai' -- Hitung hanya pinjaman yang sudah selesai
            GROUP BY
                a.Nama
            ORDER BY
                TotalPeminjaman DESC;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching active members:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil daftar peminjam aktif.' });
    }
};
