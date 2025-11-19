import { Router } from "express";
import axios from "axios";
import { cache } from "../config/cache";

const router = Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_MAPS_KEY || "";
const PHOTO_CACHE_TTL = 24 * 60 * 60 * 1000;

router.get("/photo", async (req, res) => {
  try {
    const photoRef = req.query.photoref as string;
    const maxWidth = parseInt(req.query.maxwidth as string) || 400;
    
    if (!photoRef) {
      return res.status(400).json({ error: "Missing photoref parameter" });
    }

    const cacheKey = `photo:${photoRef}:${maxWidth}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      res.set('Content-Type', cached.contentType);
      return res.send(cached.data);
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    cache.set(cacheKey, {
      data: response.data,
      contentType
    }, PHOTO_CACHE_TTL);
    
    res.set('Content-Type', contentType);
    res.send(response.data);
    
  } catch (error) {
    console.error("[GET /photo] Error:", error);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
});

export default router;
