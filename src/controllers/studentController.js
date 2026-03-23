/**
 * PRESENTATION LAYER – studentController
 *
 * Tầng này chịu trách nhiệm:
 *  - Nhận HTTP request
 *  - Gọi Service tương ứng
 *  - Trả về HTTP response đúng format
 *
 * Không chứa business logic – chỉ điều phối giữa HTTP và Service.
 */

const service = require("../services/StudentService");

// ─── GET /api/students ────────────────────────────────────────────────────────
/**
 * Lấy tất cả sinh viên. Hỗ trợ query:
 *   ?sort=fullName             → sắp xếp tăng dần theo tên
 *   ?sort=averageScore:desc    → sắp xếp giảm dần theo điểm
 */
function getAllStudents(req, res, next) {
  try {
    const { sort } = req.query;
    const result = service.getAllStudents({ sort });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/students/search?q=keyword ──────────────────────────────────────
/**
 * Tìm sinh viên theo mã hoặc tên (không phân biệt hoa thường).
 * Endpoint này PHẢI đặt trước /:studentId trong routes để tránh bị match sai.
 */
function searchStudents(req, res, next) {
  try {
    const { q, sort } = req.query;
    const result = service.searchStudents(q, sort);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/students/:studentId ─────────────────────────────────────────────
/**
 * Lấy thông tin 1 sinh viên theo mã
 */
function getStudentById(req, res, next) {
  try {
    const { studentId } = req.params;
    const result = service.getStudentById(studentId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/students ───────────────────────────────────────────────────────
/**
 * Thêm sinh viên mới
 * Body: { studentId, fullName, dateOfBirth, averageScore, className }
 */
function createStudent(req, res, next) {
  try {
    const result = service.createStudent(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/students/:studentId ─────────────────────────────────────────────
/**
 * Cập nhật thông tin sinh viên (có thể cập nhật một phần)
 * Body: { fullName?, dateOfBirth?, averageScore?, className? }
 */
function updateStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const result = service.updateStudent(studentId, req.body);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/students/:studentId ──────────────────────────────────────────
/**
 * Xóa sinh viên theo mã
 */
function deleteStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const result = service.deleteStudent(studentId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  searchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
