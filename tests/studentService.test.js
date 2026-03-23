/**
 * UNIT TESTS – StudentService
 * Dùng Jest để kiểm thử business logic trong Service layer.
 * Repository được mock để tránh phụ thuộc vào file system.
 */

// Mock Repository trước khi import Service
jest.mock("../src/repositories/StudentRepository", () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  existsById: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const service = require("../src/services/StudentService");
const repository = require("../src/repositories/StudentRepository");

// Dữ liệu mẫu dùng trong test
const mockStudent = {
  studentId: "B21DCCN001",
  fullName: "Nguyễn Văn An",
  dateOfBirth: "2000-05-15",
  averageScore: 8.5,
  className: "K64 CNTT-A",
};

// Reset mock trước mỗi test
beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getAllStudents ────────────────────────────────────────────────────────────
describe("getAllStudents", () => {
  test("trả về danh sách tất cả sinh viên", () => {
    repository.findAll.mockReturnValue([mockStudent]);
    const result = service.getAllStudents();
    expect(result.students).toHaveLength(1);
    expect(result.students[0].studentId).toBe("B21DCCN001");
  });

  test("trả về mảng rỗng nếu không có sinh viên", () => {
    repository.findAll.mockReturnValue([]);
    const result = service.getAllStudents();
    expect(result.students).toHaveLength(0);
  });

  test("sắp xếp theo averageScore tăng dần", () => {
    const students = [
      { ...mockStudent, studentId: "SV002", averageScore: 9.0 },
      { ...mockStudent, studentId: "SV001", averageScore: 7.0 },
    ];
    repository.findAll.mockReturnValue(students);
    const result = service.getAllStudents({ sort: "averageScore" });
    expect(result.students[0].averageScore).toBe(7.0);
    expect(result.students[1].averageScore).toBe(9.0);
  });

  test("sắp xếp theo averageScore giảm dần với :desc", () => {
    const students = [
      { ...mockStudent, studentId: "SV001", averageScore: 7.0 },
      { ...mockStudent, studentId: "SV002", averageScore: 9.0 },
    ];
    repository.findAll.mockReturnValue(students);
    const result = service.getAllStudents({ sort: "averageScore:desc" });
    expect(result.students[0].averageScore).toBe(9.0);
  });
});

// ─── getStudentById ───────────────────────────────────────────────────────────
describe("getStudentById", () => {
  test("trả về sinh viên nếu tồn tại", () => {
    repository.findById.mockReturnValue(mockStudent);
    const result = service.getStudentById("B21DCCN001");
    expect(result.student.studentId).toBe("B21DCCN001");
  });

  test("ném lỗi 404 nếu không tìm thấy", () => {
    repository.findById.mockReturnValue(null);
    expect(() => service.getStudentById("KHONGTON")).toThrow();
    try {
      service.getStudentById("KHONGTON");
    } catch (err) {
      expect(err.statusCode).toBe(404);
    }
  });
});

// ─── createStudent ────────────────────────────────────────────────────────────
describe("createStudent", () => {
  test("tạo sinh viên thành công với dữ liệu hợp lệ", () => {
    repository.existsById.mockReturnValue(false);
    repository.create.mockImplementation((s) => s);

    const result = service.createStudent(mockStudent);
    expect(result.student.studentId).toBe("B21DCCN001");
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test("ném lỗi 409 nếu mã sinh viên đã tồn tại", () => {
    repository.existsById.mockReturnValue(true);
    try {
      service.createStudent(mockStudent);
    } catch (err) {
      expect(err.statusCode).toBe(409);
      expect(err.message).toContain("đã tồn tại");
    }
  });

  test("ném lỗi 400 nếu thiếu fullName", () => {
    const invalid = { ...mockStudent, fullName: "" };
    try {
      service.createStudent(invalid);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  test("ném lỗi 400 nếu điểm vượt quá 10", () => {
    const invalid = { ...mockStudent, averageScore: 11 };
    try {
      service.createStudent(invalid);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  test("ném lỗi 400 nếu điểm âm", () => {
    const invalid = { ...mockStudent, averageScore: -1 };
    try {
      service.createStudent(invalid);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  test("ném lỗi 400 nếu ngày sinh trong tương lai", () => {
    repository.existsById.mockReturnValue(false);
    const invalid = { ...mockStudent, dateOfBirth: "2099-01-01" };
    try {
      service.createStudent(invalid);
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain("tương lai");
    }
  });

  test("ném lỗi 400 nếu sinh viên dưới 18 tuổi", () => {
    repository.existsById.mockReturnValue(false);
    const currentYear = new Date().getFullYear();
    const invalid = { ...mockStudent, dateOfBirth: `${currentYear - 10}-01-01` };
    try {
      service.createStudent(invalid);
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain("18 tuổi");
    }
  });
});

// ─── updateStudent ────────────────────────────────────────────────────────────
describe("updateStudent", () => {
  test("cập nhật thành công", () => {
    repository.findById.mockReturnValue(mockStudent);
    repository.update.mockReturnValue({ ...mockStudent, fullName: "Trần Thị Bình" });

    const result = service.updateStudent("B21DCCN001", { fullName: "Trần Thị Bình" });
    expect(result.student.fullName).toBe("Trần Thị Bình");
  });

  test("ném lỗi 404 nếu sinh viên không tồn tại", () => {
    repository.findById.mockReturnValue(null);
    try {
      service.updateStudent("KHONGTON", { fullName: "Test" });
    } catch (err) {
      expect(err.statusCode).toBe(404);
    }
  });

  test("ném lỗi 400 nếu body rỗng", () => {
    repository.findById.mockReturnValue(mockStudent);
    try {
      service.updateStudent("B21DCCN001", {});
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });
});

// ─── deleteStudent ────────────────────────────────────────────────────────────
describe("deleteStudent", () => {
  test("xóa thành công và trả về message", () => {
    repository.delete.mockReturnValue(true);
    const result = service.deleteStudent("B21DCCN001");
    expect(result.message).toContain("thành công");
  });

  test("ném lỗi 404 nếu không tìm thấy sinh viên", () => {
    repository.delete.mockReturnValue(false);
    try {
      service.deleteStudent("KHONGTON");
    } catch (err) {
      expect(err.statusCode).toBe(404);
    }
  });
});

// ─── searchStudents ───────────────────────────────────────────────────────────
describe("searchStudents", () => {
  test("trả về kết quả tìm kiếm", () => {
    repository.search.mockReturnValue([mockStudent]);
    const result = service.searchStudents("Nguyễn");
    expect(result.students).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  test("ném lỗi 400 nếu từ khóa rỗng", () => {
    try {
      service.searchStudents("");
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  test("ném lỗi 400 nếu chỉ có khoảng trắng", () => {
    try {
      service.searchStudents("   ");
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });
});
