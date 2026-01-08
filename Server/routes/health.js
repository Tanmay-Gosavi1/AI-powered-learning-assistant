import express from "express";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Service unhealthy",
    });
  }
});

export default router;
