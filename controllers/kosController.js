const { Kos, KosImage, KosFacility, Review, Booking, User } = require('../models');
const { Op } = require('sequelize');

exports.listKos = async (req, res) => {
  try {
    const { gender, q, limit = 20, offset = 0 } = req.query;
    const where = {};
    if (gender) where.gender = gender;
    if (q) where.name = { [Op.like]: `%${q}%` };

    const data = await Kos.findAll({
      where,
      include: [
        { model: KosImage, attributes: ['file'] },
        { model: KosFacility, attributes: ['facility'] },
        { model: User, attributes: ['id', 'name', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getKos = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Kos.findByPk(id, {
      include: [
        { model: KosImage, attributes: ['file'] },
        { model: KosFacility, attributes: ['facility'] },
        { model: Review, include: [User] }
      ]
    });
    if (!data) return res.status(404).json({ message: 'Kos not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE KOS (1x POST = Kos + Images + Facilities)
exports.createKos = async (req, res) => {
  const t = await Kos.sequelize.transaction();
  try {
    const { name, address, price_per_month, gender, images, facilities } = req.body;

    // 1️⃣ Buat Kos utama
    const kos = await Kos.create(
      {
        user_id: req.user.id,
        name,
        address,
        price_per_month,
        gender,
      },
      { transaction: t }
    );

    // 2️⃣ Tambah gambar (kalau ada)
    if (Array.isArray(images) && images.length > 0) {
      const imageData = images.map(img => ({
        kos_id: kos.id,
        file: img.file
      }));
      await KosImage.bulkCreate(imageData, { transaction: t });
    }

    // 3️⃣ Tambah fasilitas (kalau ada)
    if (Array.isArray(facilities) && facilities.length > 0) {
      const facilityData = facilities.map(f => ({
        kos_id: kos.id,
        facility: f.facility
      }));
      await KosFacility.bulkCreate(facilityData, { transaction: t });
    }

    await t.commit();

    // Ambil data lengkap setelah insert
    const created = await Kos.findByPk(kos.id, {
      include: [
        { model: KosImage, attributes: ['file'] },
        { model: KosFacility, attributes: ['facility'] },
        { model: User, attributes: ['id', 'name', 'phone'] }
      ]
    });

    res.json(created);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.updateKos = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: 'Not found' });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: 'Not owner of this kos' });
    await kos.update(req.body);
    res.json(kos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteKos = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: 'Not found' });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: 'Not owner of this kos' });

    // Hapus relasi anak dulu
    await KosImage.destroy({ where: { kos_id: kos.id } });
    await KosFacility.destroy({ where: { kos_id: kos.id } });

    await kos.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Tambahan opsional CRUD gambar kalau mau manual
exports.addImage = async (req, res) => {
  try {
    const { file } = req.body;
    const kos = await Kos.findByPk(req.params.kosId);
    if (!kos) return res.status(404).json({ message: 'Kos not found' });
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const img = await KosImage.create({ kos_id: kos.id, file });
    res.json(img);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const img = await KosImage.findByPk(req.params.imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    const kos = await Kos.findByPk(img.kos_id);
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await img.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CRUD fasilitas tetap sama
exports.addFacility = async (req, res) => {
  try {
    const { facility } = req.body;
    const kos = await Kos.findByPk(req.params.kosId);
    if (!kos) return res.status(404).json({ message: 'Kos not found' });
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const f = await KosFacility.create({ kos_id: kos.id, facility });
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFacility = async (req, res) => {
  try {
    const f = await KosFacility.findByPk(req.params.facilityId);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    const kos = await Kos.findByPk(f.kos_id);
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await f.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
