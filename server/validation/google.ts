import { z } from "zod";

export const PlacesSearchSchema = z.object({
  lat: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, "Invalid latitude")
    .transform(Number)
    .refine((val) => val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
  lng: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, "Invalid longitude")
    .transform(Number)
    .refine((val) => val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
  radius: z
    .string()
    .regex(/^\d+$/, "Radius must be a number")
    .transform(Number)
    .refine((val) => val >= 100 && val <= 50000, "Radius must be between 100 and 50000 meters")
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default("50"),
  filters: z
    .string()
    .regex(/^[a-zA-Z,\s]*$/, "Filters can only contain letters, commas, and spaces")
    .max(200, "Filters string too long")
    .optional(),
  type: z
    .enum(["hospital", "pharmacy", "clinic", "health"], {
      errorMap: () => ({ message: "Type must be hospital, pharmacy, clinic, or health" }),
    })
    .optional(),
  keyword: z
    .string()
    .max(100, "Keyword too long")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Keyword contains invalid characters")
    .optional(),
});

export type PlacesSearchInput = z.infer<typeof PlacesSearchSchema>;
