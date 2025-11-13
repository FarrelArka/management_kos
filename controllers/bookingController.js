const { Booking, Kos, User } = require("../models");
const { Op } = require("sequelize");

exports.createBooking = async (req, res) => {
  try {
    const { kosId } = req.params;
    const { start_date, end_date } = req.body;

    // =======================
    // ✅ VALIDASI INPUT AWAL
    // =======================
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "start_date dan end_date wajib diisi" });
    }

    // ✅ Cek format YYYY-MM-DD (regex)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res
        .status(400)
        .json({ message: "Format tanggal harus YYYY-MM-DD" });
    }

    // ✅ Cek tanggal valid secara kalender
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Tanggal tidak valid di kalender" });
    }

    // ✅ Pastikan nilai yang dimasukkan sesuai dengan tanggal asli (anti 2025-02-31)
    const formatBack = (date) => date.toISOString().split("T")[0];
    if (formatBack(start) !== start_date || formatBack(end) !== end_date) {
      return res
        .status(400)
        .json({ message: "Tanggal tidak valid atau tidak ada di kalender" });
    }

    // ✅ Cek start_date <= end_date
    if (start > end) {
      return res
        .status(400)
        .json({ message: "start_date tidak boleh setelah end_date" });
    }

    // =======================
    // ✅ CEK KOS ADA
    // =======================
    const kos = await Kos.findByPk(kosId);
    if (!kos) {
      return res.status(404).json({ message: "Kos not found" });
    }

    // =======================
    // ✅ SIMPAN BOOKING
    // =======================
    const b = await Booking.create({
      kos_id: kosId,
      user_id: req.user.id,
      start_date,
      end_date,
      status: "pending",
    });

    res.json(b);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner: change status (accept/reject)
// Owner: change status (accept/reject)
exports.changeStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["accept", "reject"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    // 🔹 Cek booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // 🔹 Cek kos terkait
    const kos = await Kos.findByPk(booking.kos_id);
    if (!kos) return res.status(404).json({ message: "Kos not found" });

    // 🔹 Cek apakah yang ubah adalah owner kos
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    // 🔹 Kalau status = "accept"
    if (status === "accept") {
      if (kos.kamar_tersedia <= 0) {
        return res
          .status(400)
          .json({ message: "Kamar sudah penuh, tidak bisa menerima booking baru" });
      }

      // Kurangi kamar tersedia
      kos.kamar_tersedia -= 1;
      await kos.save();
    }

    // 🔹 Update status booking
    booking.status = status;
    await booking.save();

    res.json({
      message: `Booking berhasil di-${status}`,
      booking,
      kamar_tersedia_sisa: kos.kamar_tersedia,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// History berdasarkan tanggal/bulan (owner)
exports.history = async (req, res) => {
  try {
    const { from, to } = req.query; // format YYYY-MM-DD
    // Ambil semua bookings untuk kos yang dimiliki owner
    const kosList = await Kos.findAll({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
    const ids = kosList.map((k) => k.id);
    const where = { kos_id: ids };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const bookings = await Booking.findAll({ where, include: [Kos, User] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cetak invoice (kembalikan HTML simple untuk dicetak)
exports.invoice = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [
        { model: Kos, as: "Kos" },
        { model: User, as: "User" },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const kos = booking.Kos;
    const pemesan = booking.User;

    if (!kos || !pemesan) {
      return res.status(500).json({
        message:
          "Data relasi Kos atau User tidak ditemukan. Pastikan data konsisten.",
      });
    }

    // Akses hanya untuk owner kos atau user pemesan
    if (req.user.id !== booking.user_id && req.user.id !== kos.user_id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const html = `
      <html>
      <head><meta charset="utf-8"><title>Invoice #${booking.id}</title></head>
      <body>
        <h2>Invoice Pemesanan Kos</h2>
        <p>Booking ID: ${booking.id}</p>
        <p>Kos: ${kos.name}</p>
        <p>Pemesan: ${pemesan.name} (${pemesan.email})</p>
        <p>Periode: ${booking.start_date} s/d ${booking.end_date}</p>
        <p>Status: ${booking.status}</p>
        <p>Harga per bulan: Rp ${kos.price_per_month}</p>
        <hr>
        <p>Terima kasih telah menggunakan Kos Hunter.</p>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ===========================
// 🔹 HISTORY BY DATE (simple)
// ===========================
exports.historyByDate = async (req, res) => {
  try {
    const { from } = req.params;
    const { to } = req.query;

    if (!from)
      return res.status(400).json({ message: "Tanggal awal wajib diisi (format YYYY-MM-DD)" });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from))
      return res.status(400).json({ message: "Format tanggal 'from' harus YYYY-MM-DD" });
    if (to && !dateRegex.test(to))
      return res.status(400).json({ message: "Format tanggal 'to' harus YYYY-MM-DD" });

    const startDate = new Date(`${from}T00:00:00`);
    const endDate = to ? new Date(`${to}T23:59:59`) : new Date(`${from}T23:59:59`);

    // ambil semua kos milik user
    const kosList = await Kos.findAll({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });

    const kosIds = kosList.map((k) => k.id);
    if (kosIds.length === 0)
      return res.status(404).json({ message: "Kamu belum memiliki kos" });

    // cari booking yang aktif di rentang tanggal itu
    const bookings = await Booking.findAll({
      where: {
        kos_id: kosIds,
        [Op.or]: [
          {
            start_date: { [Op.between]: [startDate, endDate] },
          },
          {
            end_date: { [Op.between]: [startDate, endDate] },
          },
          // tambahan: booking yang mencakup seluruh range
          {
            [Op.and]: [
              { start_date: { [Op.lte]: startDate } },
              { end_date: { [Op.gte]: endDate } },
            ],
          },
        ],
      },
      include: [
        { model: Kos, as: "Kos", attributes: ["name", "price_per_month"] },
        { model: User, as: "User", attributes: ["name", "email"] },
      ],
      order: [["start_date", "DESC"]],
    });

    if (bookings.length === 0)
      return res.status(404).json({ message: "Tidak ada booking pada tanggal tersebut" });

    res.json({
      from,
      to: to || from,
      total: bookings.length,
      bookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
