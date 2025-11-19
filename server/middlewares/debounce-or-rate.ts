import rateLimit from 'express-rate-limit';

export const facilitiesRateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
