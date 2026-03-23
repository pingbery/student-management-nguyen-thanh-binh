/**
 * Entry Point – index.js
 * Khởi tạo Express app và lắng nghe cổng
 */

const express = require("express");
const studentRoutes = require("./routes/studentRoutes");
const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware toàn cục ──────────────────────────────────────────────────────
app.use(express.json());           // Parse JSON request body
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🎓 Student Management API",
    version: "1.0.0",
    endpoints: {
      getAllStudents:  "GET    /api/students",
      searchStudents: "GET    /api/students/search?q=keyword",
      getStudent:     "GET    /api/students/:studentId",
      createStudent:  "POST   /api/students",
      updateStudent:  "PUT    /api/students/:studentId",
      deleteStudent:  "DELETE /api/students/:studentId",
    },
  });
});

app.use("/api/students", studentRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);       // 404 nếu không có route nào khớp
app.use(globalErrorHandler);    // Xử lý tất cả các lỗi còn lại

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/\n`);
});

// Graceful shutdown – lưu dữ liệu khi tắt server bằng Ctrl+C
process.on("SIGTERM", () => {
  console.log("\n[Server] Nhận tín hiệu SIGTERM, đang tắt server...");
  server.close(() => {
    console.log("[Server] Đã tắt server. Dữ liệu đã được lưu.");
    process.exit(0);
  });
});

module.exports = app; // Export để dùng trong test
