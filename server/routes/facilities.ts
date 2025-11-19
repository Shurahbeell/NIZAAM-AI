import { Router } from "express";
import { findNearbyFacilities } from "../mcp/agents/facility-finder-agent";

const router = Router();

router.get("/api/facilities/hospitals", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string) : 200000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const facilities = await findNearbyFacilities(lat, lng, radius);
    res.json({ facilities });
  } catch (error) {
    console.error("[GET /api/facilities/hospitals] Error:", error);
    res.status(500).json({ error: "Failed to fetch facilities" });
  }
});

export default router;
