import { Router } from "express";
import { findNearbyFacilities } from "../mcp/agents/facility-finder-agent";
import { cache } from "../config/cache";
import { facilitiesRateLimiter } from "../middleware/debounce-or-rate";

const router = Router();

const CACHE_TTL = 15 * 60 * 1000;

router.get("/hospitals", facilitiesRateLimiter, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const filtersParam = req.query.filters as string;
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const filters = filtersParam ? filtersParam.split(',').map(f => f.trim()).sort() : [];
    const cacheKey = `${lat}|${lng}|${radius || ''}|${filters.join(',')}|${limit}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[Cache hit]', cacheKey);
      return res.json({
        ...cached,
        meta: { ...cached.meta, cached: true }
      });
    }

    console.log('[Cache miss]', cacheKey);
    
    const result = await findNearbyFacilities(lat, lng, { limit, filters });
    
    cache.set(cacheKey, result, CACHE_TTL);
    
    res.json(result);
  } catch (error) {
    console.error("[GET /hospitals] Error:", error);
    res.status(500).json({ 
      results: [],
      meta: {
        cached: false,
        source: 'error',
        fetched_at: Date.now(),
        error: error instanceof Error ? error.message : 'Failed to fetch facilities'
      }
    });
  }
});

export default router;
