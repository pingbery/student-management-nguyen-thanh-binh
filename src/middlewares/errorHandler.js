/**
 * MIDDLEWARE – Xử lý lỗi toàn cục (Global Error Handler)
 *
 * Express nhận biết đây là error middleware khi có đúng 4 tham số: (err, req, res, next)
 * Đặt middleware này SAU TẤT CẢ routes trong app.js
 */

/**
 * Middleware xử lý lỗi 404 (route không tồn tại)
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`Không tìm thấy route: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

/**
 * Middleware xử lý lỗi toàn cục
 * Chuẩn hóa tất cả lỗi thành JSON response thống nhất
 */
function globalErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ nội bộ";

  // Log lỗi ra console (trong production nên dùng logger như winston)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${statusCode} - ${message}`);
    console.error(err.stack);
  } else {
    console.warn(`[WARN] ${statusCode} - ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, globalErrorHandler };
