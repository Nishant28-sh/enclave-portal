import rateLimit from "express-rate-limit";

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 50,               // 50 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again shortly.",
  },
  skipSuccessfulRequests: false,
});

export default contactLimiter;