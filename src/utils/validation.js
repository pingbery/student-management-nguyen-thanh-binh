/**
 * UTILS – Validation
 * Dùng thư viện Joi để validate input từ client.
 */

const Joi = require("joi");

// ─── Schema dùng khi tạo mới (tất cả trường đều bắt buộc) ───────────────────
const createStudentSchema = Joi.object({
  studentId: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      "string.empty": "Mã sinh viên không được để trống",
      "any.required": "Mã sinh viên là bắt buộc",
    }),

  fullName: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Họ tên không được để trống",
      "string.min": "Họ tên phải có ít nhất 2 ký tự",
      "any.required": "Họ tên là bắt buộc",
    }),

  dateOfBirth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Ngày sinh phải có định dạng YYYY-MM-DD",
      "any.required": "Ngày sinh là bắt buộc",
    }),

  averageScore: Joi.number()
    .min(0)
    .max(10)
    .required()
    .messages({
      "number.base": "Điểm trung bình phải là số",
      "number.min": "Điểm trung bình phải từ 0.0 đến 10.0",
      "number.max": "Điểm trung bình phải từ 0.0 đến 10.0",
      "any.required": "Điểm trung bình là bắt buộc",
    }),

  className: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      "string.empty": "Tên lớp không được để trống",
      "any.required": "Tên lớp là bắt buộc",
    }),
});

// ─── Schema dùng khi cập nhật (tất cả trường đều tùy chọn) ──────────────────
const updateStudentSchema = Joi.object({
  fullName: Joi.string().trim().min(2).messages({
    "string.empty": "Họ tên không được để trống",
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
  }),

  dateOfBirth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "Ngày sinh phải có định dạng YYYY-MM-DD",
    }),

  averageScore: Joi.number().min(0).max(10).messages({
    "number.base": "Điểm trung bình phải là số",
    "number.min": "Điểm trung bình phải từ 0.0 đến 10.0",
    "number.max": "Điểm trung bình phải từ 0.0 đến 10.0",
  }),

  className: Joi.string().trim().min(1).messages({
    "string.empty": "Tên lớp không được để trống",
  }),
}).min(1); // Phải có ít nhất 1 trường khi update

/**
 * Validate input theo schema cho trước
 * @param {object} data - Dữ liệu cần kiểm tra
 * @param {Joi.Schema} schema
 * @returns {{ error: string|null, value: object }}
 */
function validate(data, schema) {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join("; ");
    return { error: message, value: null };
  }
  return { error: null, value };
}

module.exports = { createStudentSchema, updateStudentSchema, validate };
