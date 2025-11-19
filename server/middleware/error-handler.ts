import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("[Error Handler]", err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  return res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}
