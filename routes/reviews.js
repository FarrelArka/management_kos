const express = require("express");
const router = express.Router();
const reviewCtl = require("../controllers/reviewController");
const authenticate = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.get("/reviews", reviewCtl.getAllReviews);
router.get("/reviews/kos/:kosId", reviewCtl.getReviewsByKos);
router.post("/:kosId", authenticate, reviewCtl.addReview);

// Owner reply
router.post(
  "/reply/:reviewId",
  authenticate,
  requireRole("owner"),
  reviewCtl.replyReview
);

module.exports = router;
