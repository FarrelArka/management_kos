const {
  Kos,
  KosImage,
  KosFacility,
  Review,
  Booking,
  User,
} = require("../models");
const { Op } = require("sequelize");

// 🟢 List semua kos (dengan filter optional)
exports.listKos = async (req, res) => {
  try {
    const { gender, q, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (gender) where.gender = gender;
    if (q) where.name = { [Op.like]: `%${q}%` };

    const data = await Kos.findAll({
      where,
      include: [
        { model: KosImage, as: "Images", attributes: ["file"] },
        { model: KosFacility, as: "Facilities", attributes: ["facility"] },
        { model: User, as: "Owner", attributes: ["id", "name", "phone"] }, // ✅ pakai alias
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 LIST KOS BY GENDER
exports.getKosByGender = async (req, res) => {
  try {
    const gender = req.params.gender;

    const data = await Kos.findAll({
      where: { gender },
      include: [
        { model: KosImage, as: "Images", attributes: ["file"] },
        { model: KosFacility, as: "Facilities", attributes: ["facility"] },
        { model: User, as: "Owner", attributes: ["id", "name", "phone"] }, // ✅ pakai alias
      ],
    });

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: `No kos found for gender: ${gender}` });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟣 Detail 1 kos
exports.getKos = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Kos.findByPk(id, {
      include: [
        { model: KosImage, as: "Images", attributes: ["file"] },
        { model: KosFacility, as: "Facilities", attributes: ["facility"] },
        { model: User, as: "Owner", attributes: ["id", "name", "phone"] }, // ✅ pakai alias
      ],
    });
    if (!data) return res.status(404).json({ message: "Kos not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟠 CREATE (Kos + Images + Facilities)
exports.createKos = async (req, res) => {
  try {
    console.log("==== DEBUG FILES ====");
    console.log(req.files);
    console.log("FIELD YANG DITERIMA POSTMAN:", req.body);
    console.log("FILES YANG DITERIMA:", req.files);

    const created = await Kos.sequelize.transaction(async (t) => {
      const { name, address, price_per_month, gender, facilities } = req.body;

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

      // images
      if (req.files && req.files.length > 0) {
        const imageData = req.files.map((file) => ({
          kos_id: kos.id,
          file: file.filename,
        }));
        await KosImage.bulkCreate(imageData, { transaction: t });
      }

      // facilities
      if (facilities) {
        const parsed = Array.isArray(facilities)
          ? facilities
          : JSON.parse(facilities);

        const facilityData = parsed.map((f) => ({
          kos_id: kos.id,
          facility: f,
        }));

        await KosFacility.bulkCreate(facilityData, { transaction: t });
      }

      return kos;
    });

    const data = await Kos.findByPk(created.id, {
      include: [
        { model: KosImage, as: "Images", attributes: ["file"] },
        { model: KosFacility, as: "Facilities", attributes: ["facility"] },
        { model: User, as: "Owner", attributes: ["id", "name", "phone"] },
      ],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟡 UPDATE Kos
// 🟡 UPDATE Kos (support upload foto baru)
exports.updateKos = async (req, res) => {
  const t = await Kos.sequelize.transaction();
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: "Not found" });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Not owner of this kos" });

    const { name, address, price_per_month, gender, facilities } = req.body;

    // Update data utama kos
    await kos.update(
      { name, address, price_per_month, gender },
      { transaction: t }
    );

    // Kalau ada foto baru
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        kos_id: kos.id,
        file: file.filename,
      }));
      await KosImage.bulkCreate(imageData, { transaction: t });
    }

    // Kalau ada update fasilitas (replace semua)
    if (facilities) {
      const parsedFacilities = Array.isArray(facilities)
        ? facilities
        : JSON.parse(facilities);

      await KosFacility.destroy({ where: { kos_id: kos.id }, transaction: t });

      const facilityData = parsedFacilities.map((f) => ({
        kos_id: kos.id,
        facility: f,
      }));
      await KosFacility.bulkCreate(facilityData, { transaction: t });
    }

    await t.commit();

    const updated = await Kos.findByPk(kos.id, {
      include: [
        { model: KosImage, attributes: ["file"] },
        { model: KosFacility, attributes: ["facility"] },
        { model: User, attributes: ["id", "name", "phone"] },
      ],
    });

    res.json(updated);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// 🔴 DELETE Kos
exports.deleteKos = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: "Not found" });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Not owner of this kos" });

    await KosImage.destroy({ where: { kos_id: kos.id } });
    await KosFacility.destroy({ where: { kos_id: kos.id } });
    await kos.destroy();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧩 ADD Image
exports.addImage = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.kosId);
    if (!kos) return res.status(404).json({ message: "Kos not found" });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const img = await KosImage.create({
      kos_id: kos.id,
      file: req.file.filename,
    });
    res.json(img);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧩 REMOVE Image
exports.removeImage = async (req, res) => {
  try {
    const img = await KosImage.findByPk(req.params.imageId);
    if (!img) return res.status(404).json({ message: "Image not found" });
    const kos = await Kos.findByPk(img.kos_id);
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await img.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⚙️ ADD Facility
exports.addFacility = async (req, res) => {
  try {
    const { facility } = req.body;
    const kos = await Kos.findByPk(req.params.kosId);
    if (!kos) return res.status(404).json({ message: "Kos not found" });
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const f = await KosFacility.create({ kos_id: kos.id, facility });
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⚙️ REMOVE Facility
exports.removeFacility = async (req, res) => {
  try {
    const f = await KosFacility.findByPk(req.params.facilityId);
    if (!f) return res.status(404).json({ message: "Facility not found" });
    const kos = await Kos.findByPk(f.kos_id);
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await f.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
