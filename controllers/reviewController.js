const { Review, Kos, User } = require("../models");

exports.addReview = async (req, res) => {
  try {
    const { kosId } = req.params;
    const { comment, rating } = req.body;
    const kos = await Kos.findByPk(kosId);
    if (!kos) return res.status(404).json({ message: "Kos not found" });
    const r = await Review.create({
      kos_id: kosId,
      user_id: req.user.id,
      comment,
      rating,
    });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner can reply to reviews (we'll model reply as updating comment with reply field — simple approach)
// Alternatively create separate replies table; untuk sederhana tambahkan 'owner_reply' di response.
exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;
    const rev = await Review.findByPk(reviewId);
    if (!rev) return res.status(404).json({ message: "Review not found" });
    const kos = await Kos.findByPk(rev.kos_id);
    if (kos.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    // We'll store reply in a new column 'owner_reply'. If not present in model, store in comment with a marker.
    rev.owner_reply = reply; // dynamic property; better to add column in real app. For now, update with JSON store not supported; but we can update comment with reply appended:
    rev.comment = rev.comment + "\n\n[Owner reply]: " + reply;
    await rev.save();
    res.json(rev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: Kos, as: "Kos", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByKos = async (req, res) => {
  try {
    const { kosId } = req.params;

    const reviews = await Review.findAll({
      where: { kos_id: kosId },
      include: [{ model: User, as: "User", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: "No reviews for this kos" });
    }

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
