const { Kos, KosImage, KosFacility, Review, Booking, User } = require('../models');

exports.listKos = async (req, res) => {
  try {
    const { gender, q, limit = 20, offset = 0 } = req.query;
    const where = {};
    if (gender) where.gender = gender;
    if (q) where.name = { [require('sequelize').Op.like]: `%${q}%` };
    const data = await Kos.findAll({
      where,
      include: [
        { model: KosImage, attributes: ['file'] },
        { model: KosFacility, attributes: ['facility'] },
        { model: User, attributes: ['id','name','phone'] }
      ],
      limit: parseInt(limit), offset: parseInt(offset)
    });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getKos = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Kos.findByPk(id, { include: [KosImage, KosFacility, { model: Review, include: [User] }] });
    if (!data) return res.status(404).json({ message: 'Kos not found' });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Owner-only: create
exports.createKos = async (req, res) => {
  try {
    const { name, address, price_per_month, gender } = req.body;
    const kos = await Kos.create({ user_id: req.user.id, name, address, price_per_month, gender });
    res.json(kos);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateKos = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: 'Not found' });
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Not owner of this kos' });
    await kos.update(req.body);
    res.json(kos);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteKos = async (req, res) => {
  try {
    const kos = await Kos.findByPk(req.params.id);
    if (!kos) return res.status(404).json({ message: 'Not found' });
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Not owner of this kos' });
    await kos.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Facilities CRUD (owner)
exports.addFacility = async (req, res) => {
  try {
    const { facility } = req.body;
    const kos = await Kos.findByPk(req.params.kosId);
    if (!kos) return res.status(404).json({ message: 'Kos not found' });
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const f = await KosFacility.create({ kos_id: kos.id, facility });
    res.json(f);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeFacility = async (req, res) => {
  try {
    const f = await KosFacility.findByPk(req.params.facilityId);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    const kos = await Kos.findByPk(f.kos_id);
    if (kos.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await f.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
