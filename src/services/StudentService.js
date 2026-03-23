/**
 * BUSINESS LOGIC LAYER – StudentService
 *
 * Tầng này xử lý toàn bộ nghiệp vụ (business rules):
 *  - Validate dữ liệu đầu vào
 *  - Kiểm tra ràng buộc (mã duy nhất, tuổi ≥ 18, điểm hợp lệ, ...)
 *  - Sắp xếp kết quả theo query param
 *
 * Không trực tiếp truy cập dữ liệu – luôn thông qua Repository.
 */

const repository = require("../repositories/StudentRepository");
const Student = require("../models/Student");
const { createStudentSchema, updateStudentSchema, validate } = require("../utils/validation");

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Tính tuổi từ ngày sinh
 * @param {string} dateOfBirth - "YYYY-MM-DD"
 * @returns {number}
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Kiểm tra ngày sinh hợp lệ và không nằm trong tương lai
 * @param {string} dateOfBirth
 * @returns {{ valid: boolean, message?: string }}
 */
function validateDateOfBirth(dateOfBirth) {
  const birth = new Date(dateOfBirth);

  // Kiểm tra ngày hợp lệ (VD: 2000-02-31 sẽ bị lỗi)
  if (isNaN(birth.getTime())) {
    return { valid: false, message: "Ngày sinh không hợp lệ" };
  }

  // Ngày sinh không được trong tương lai
  if (birth > new Date()) {
    return { valid: false, message: "Ngày sinh không được ở tương lai" };
  }

  // Sinh viên phải ≥ 18 tuổi
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    return { valid: false, message: `Sinh viên phải đủ 18 tuổi (hiện tại: ${age} tuổi)` };
  }

  return { valid: true };
}

/**
 * Sắp xếp danh sách sinh viên theo query param
 * @param {Student[]} students
 * @param {string} sortParam - VD: "fullName", "averageScore:desc", "studentId"
 * @returns {Student[]}
 */
function sortStudents(students, sortParam) {
  if (!sortParam) return students;

  const [field, order] = sortParam.split(":");
  const allowedFields = ["fullName", "averageScore", "studentId", "dateOfBirth", "className"];

  if (!allowedFields.includes(field)) return students;

  const sorted = [...students].sort((a, b) => {
    if (typeof a[field] === "string") {
      return a[field].localeCompare(b[field], "vi");
    }
    return a[field] - b[field];
  });

  return order === "desc" ? sorted.reverse() : sorted;
}

// ─── Service Class ─────────────────────────────────────────────────────────────

class StudentService {
  /**
   * Lấy toàn bộ danh sách sinh viên, hỗ trợ sắp xếp
   * @param {object} options
   * @param {string} [options.sort] - Query param sắp xếp
   * @returns {{ students: Student[] }}
   */
  getAllStudents({ sort } = {}) {
    let students = repository.findAll();
    students = sortStudents(students, sort);
    return { students };
  }

  /**
   * Lấy thông tin 1 sinh viên theo mã
   * @param {string} studentId
   * @returns {{ student: Student }}
   * @throws {Error} 404 nếu không tìm thấy
   */
  getStudentById(studentId) {
    const student = repository.findById(studentId);
    if (!student) {
      const err = new Error(`Không tìm thấy sinh viên với mã: ${studentId}`);
      err.statusCode = 404;
      throw err;
    }
    return { student };
  }

  /**
   * Tìm kiếm sinh viên theo từ khóa, hỗ trợ sắp xếp
   * @param {string} keyword
   * @param {string} [sort]
   * @returns {{ students: Student[], total: number }}
   */
  searchStudents(keyword, sort) {
    if (!keyword || !keyword.trim()) {
      const err = new Error("Từ khóa tìm kiếm không được để trống");
      err.statusCode = 400;
      throw err;
    }
    let students = repository.search(keyword.trim());
    students = sortStudents(students, sort);
    return { students, total: students.length };
  }

  /**
   * Thêm sinh viên mới
   * @param {object} data - Dữ liệu từ request body
   * @returns {{ student: Student }}
   * @throws {Error} 400 nếu dữ liệu không hợp lệ | 409 nếu mã đã tồn tại
   */
  createStudent(data) {
    // 1. Validate schema bằng Joi
    const { error, value } = validate(data, createStudentSchema);
    if (error) {
      const err = new Error(error);
      err.statusCode = 400;
      throw err;
    }

    // 2. Kiểm tra mã sinh viên trùng lặp
    if (repository.existsById(value.studentId)) {
      const err = new Error(`Mã sinh viên "${value.studentId}" đã tồn tại`);
      err.statusCode = 409;
      throw err;
    }

    // 3. Validate ngày sinh (ngày hợp lệ, không tương lai, tuổi ≥ 18)
    const dobCheck = validateDateOfBirth(value.dateOfBirth);
    if (!dobCheck.valid) {
      const err = new Error(dobCheck.message);
      err.statusCode = 400;
      throw err;
    }

    // 4. Tạo và lưu sinh viên
    const student = new Student(value);
    repository.create(student);
    return { student };
  }

  /**
   * Cập nhật thông tin sinh viên
   * @param {string} studentId
   * @param {object} data - Dữ liệu cập nhật (một phần hoặc toàn bộ)
   * @returns {{ student: Student }}
   * @throws {Error} 400 | 404
   */
  updateStudent(studentId, data) {
    // 1. Kiểm tra sinh viên tồn tại
    const existing = repository.findById(studentId);
    if (!existing) {
      const err = new Error(`Không tìm thấy sinh viên với mã: ${studentId}`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Validate schema
    const { error, value } = validate(data, updateStudentSchema);
    if (error) {
      const err = new Error(error);
      err.statusCode = 400;
      throw err;
    }

    // 3. Validate ngày sinh nếu có cập nhật
    if (value.dateOfBirth) {
      const dobCheck = validateDateOfBirth(value.dateOfBirth);
      if (!dobCheck.valid) {
        const err = new Error(dobCheck.message);
        err.statusCode = 400;
        throw err;
      }
    }

    // 4. Cập nhật
    const student = repository.update(studentId, value);
    return { student };
  }

  /**
   * Xóa sinh viên
   * @param {string} studentId
   * @returns {{ message: string }}
   * @throws {Error} 404 nếu không tìm thấy
   */
  deleteStudent(studentId) {
    const deleted = repository.delete(studentId);
    if (!deleted) {
      const err = new Error(`Không tìm thấy sinh viên với mã: ${studentId}`);
      err.statusCode = 404;
      throw err;
    }
    return { message: `Đã xóa sinh viên "${studentId}" thành công` };
  }
}

module.exports = new StudentService();
