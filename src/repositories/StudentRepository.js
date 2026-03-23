/**
 * DATA ACCESS LAYER – StudentRepository
 *
 * Tầng này chịu trách nhiệm duy nhất: đọc/ghi dữ liệu.
 * Dữ liệu được lưu trong RAM (mảng) và file JSON để phục hồi khi restart.
 * Không chứa bất kỳ business logic nào.
 */

const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");

// Đường dẫn file JSON để persist dữ liệu
const DATA_FILE = path.join(__dirname, "../../data/students.json");

class StudentRepository {
  constructor() {
    /** @type {Student[]} Danh sách sinh viên lưu trong RAM */
    this.students = [];
    this._loadFromFile();
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** Đọc dữ liệu từ file JSON khi khởi động server */
  _loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.students = JSON.parse(raw);
        console.log(`[Repository] Đã tải ${this.students.length} sinh viên từ file.`);
      }
    } catch (err) {
      console.warn("[Repository] Không thể đọc file dữ liệu, khởi tạo mảng rỗng.", err.message);
      this.students = [];
    }
  }

  /** Ghi dữ liệu xuống file JSON (gọi sau mỗi thao tác thay đổi) */
  _saveToFile() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.students, null, 2), "utf-8");
    } catch (err) {
      console.error("[Repository] Lỗi ghi file dữ liệu:", err.message);
    }
  }

  // ─── CRUD Methods ─────────────────────────────────────────────────────────

  /**
   * Lấy toàn bộ danh sách sinh viên
   * @returns {Student[]}
   */
  findAll() {
    return [...this.students];
  }

  /**
   * Tìm sinh viên theo mã
   * @param {string} studentId
   * @returns {Student|null}
   */
  findById(studentId) {
    return this.students.find((s) => s.studentId === studentId) || null;
  }

  /**
   * Tìm sinh viên theo từ khóa (mã hoặc tên, không phân biệt hoa thường)
   * @param {string} keyword
   * @returns {Student[]}
   */
  search(keyword) {
    const lower = keyword.toLowerCase();
    return this.students.filter(
      (s) =>
        s.studentId.toLowerCase().includes(lower) ||
        s.fullName.toLowerCase().includes(lower)
    );
  }

  /**
   * Kiểm tra mã sinh viên đã tồn tại chưa
   * @param {string} studentId
   * @returns {boolean}
   */
  existsById(studentId) {
    return this.students.some((s) => s.studentId === studentId);
  }

  /**
   * Thêm sinh viên mới vào danh sách
   * @param {Student} student
   * @returns {Student}
   */
  create(student) {
    this.students.push(student);
    this._saveToFile();
    return student;
  }

  /**
   * Cập nhật thông tin sinh viên
   * @param {string} studentId
   * @param {Partial<Student>} updateData
   * @returns {Student|null}
   */
  update(studentId, updateData) {
    const index = this.students.findIndex((s) => s.studentId === studentId);
    if (index === -1) return null;

    // Gộp dữ liệu mới, giữ nguyên studentId và createdAt
    this.students[index] = {
      ...this.students[index],
      ...updateData,
      studentId,                              // Không cho thay đổi mã
      createdAt: this.students[index].createdAt, // Giữ nguyên ngày tạo
      updatedAt: new Date().toISOString(),
    };

    this._saveToFile();
    return this.students[index];
  }

  /**
   * Xóa sinh viên khỏi danh sách
   * @param {string} studentId
   * @returns {boolean} true nếu xóa thành công
   */
  delete(studentId) {
    const index = this.students.findIndex((s) => s.studentId === studentId);
    if (index === -1) return false;
    this.students.splice(index, 1);
    this._saveToFile();
    return true;
  }
}

// Singleton – toàn bộ ứng dụng dùng chung một instance
module.exports = new StudentRepository();
