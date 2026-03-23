/**
 * Model: Student
 * Định nghĩa cấu trúc dữ liệu sinh viên
 */

class Student {
  /**
   * @param {string} studentId   - Mã sinh viên (duy nhất)
   * @param {string} fullName    - Họ và tên
   * @param {string} dateOfBirth - Ngày sinh (ISO: YYYY-MM-DD)
   * @param {number} averageScore - Điểm trung bình (0.0 – 10.0)
   * @param {string} className   - Tên lớp
   */
  constructor({ studentId, fullName, dateOfBirth, averageScore, className }) {
    this.studentId = studentId;
    this.fullName = fullName;
    this.dateOfBirth = dateOfBirth;
    this.averageScore = averageScore;
    this.className = className;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Student;
