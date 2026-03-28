# 🎓 Student Management

REST API Quản lý Sinh viên xây dựng bằng Node.js + Express, tuân thủ mô hình **3-layer architecture**.

---

## 📁 Cấu trúc dự án

```
student-management/
├── src/
│   ├── models/
│   │   └── Student.js              # Định nghĩa cấu trúc dữ liệu sinh viên
│   ├── repositories/
│   │   └── StudentRepository.js    # [Layer 3] Data Access – đọc/ghi dữ liệu
│   ├── services/
│   │   └── StudentService.js       # [Layer 2] Business Logic – nghiệp vụ
│   ├── controllers/
│   │   └── studentController.js    # [Layer 1] Presentation – nhận & trả HTTP
│   ├── routes/
│   │   └── studentRoutes.js        # Khai báo các endpoint
│   ├── middlewares/
│   │   └── errorHandler.js         # Middleware xử lý lỗi toàn cục
│   └── utils/
│       └── validation.js           # Validate input bằng Joi
├── tests/
│   └── studentService.test.js      # Unit tests cho Service layer (Jest)
├── data/
│   └── students.json               # File lưu dữ liệu (tự tạo khi chạy)
├── src/index.js                    # Entry point
├── package.json
├── jest.config.json
└── README.md
```

---

## ⚙️ Cài đặt và chạy

### Yêu cầu
- Node.js >= 16
- npm >= 8

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy server (production)

```bash
npm start
```

Server sẽ khởi động tại: **http://localhost:3000**

### 3. Chạy server ở chế độ phát triển (tự reload)

```bash
npm run dev
```

### 4. Chạy unit tests

```bash
npm test
```

---

## 🌐 Danh sách Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/students` | Lấy tất cả sinh viên |
| `GET` | `/api/students/search?q=keyword` | Tìm kiếm theo mã hoặc tên |
| `GET` | `/api/students/:studentId` | Lấy 1 sinh viên theo mã |
| `POST` | `/api/students` | Thêm sinh viên mới |
| `PUT` | `/api/students/:studentId` | Cập nhật thông tin sinh viên |
| `DELETE` | `/api/students/:studentId` | Xóa sinh viên |

### Query params hỗ trợ (bonus)
- `?sort=fullName` – Sắp xếp tăng dần theo tên
- `?sort=averageScore:desc` – Sắp xếp giảm dần theo điểm
- `?sort=studentId` – Sắp xếp theo mã

---

## 📡 Ví dụ Request / Response

### 1. Lấy tất cả sinh viên

```bash
curl -X GET http://localhost:3000/api/students
```

```json
{
  "students": [
    {
      "studentId": "B21DCCN001",
      "fullName": "Nguyễn Văn An",
      "dateOfBirth": "2000-05-15",
      "averageScore": 8.5,
      "className": "K64 CNTT-A",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  ]
}
```

### 2. Thêm sinh viên mới

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "B21DCCN001",
    "fullName": "Nguyễn Văn An",
    "dateOfBirth": "2000-05-15",
    "averageScore": 8.5,
    "className": "K64 CNTT-A"
  }'
```

**Response 201:**
```json
{
  "student": {
    "studentId": "B21DCCN001",
    "fullName": "Nguyễn Văn An",
    "dateOfBirth": "2000-05-15",
    "averageScore": 8.5,
    "className": "K64 CNTT-A",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-10T08:00:00.000Z"
  }
}
```

**Response 400 (lỗi validation):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Điểm trung bình phải từ 0.0 đến 10.0"
}
```

**Response 409 (mã đã tồn tại):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Mã sinh viên \"B21DCCN001\" đã tồn tại"
}
```

### 3. Lấy 1 sinh viên

```bash
curl -X GET http://localhost:3000/api/students/B21DCCN001
```

**Response 404:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Không tìm thấy sinh viên với mã: B21DCCN001"
}
```

### 4. Cập nhật sinh viên

```bash
curl -X PUT http://localhost:3000/api/students/B21DCCN001 \
  -H "Content-Type: application/json" \
  -d '{
    "averageScore": 9.0,
    "className": "K64 CNTT-B"
  }'
```

### 5. Xóa sinh viên

```bash
curl -X DELETE http://localhost:3000/api/students/B21DCCN001
```

```json
{
  "message": "Đã xóa sinh viên \"B21DCCN001\" thành công"
}
```

### 6. Tìm kiếm

```bash
curl "http://localhost:3000/api/students/search?q=Nguyễn&sort=averageScore:desc"
```

```json
{
  "students": [...],
  "total": 2
}
```

---

## ✅ Business Rules (Quy tắc nghiệp vụ)

| Trường | Ràng buộc |
|--------|-----------|
| `studentId` | Bắt buộc, không được trùng |
| `fullName` | Bắt buộc, ít nhất 2 ký tự, không chỉ khoảng trắng |
| `dateOfBirth` | Định dạng `YYYY-MM-DD`, không ở tương lai |
| `averageScore` | Số từ 0.0 đến 10.0 |
| `className` | Bắt buộc, không được rỗng |
| Tuổi | Sinh viên phải ≥ 18 tuổi |

---

## 🏗️ Kiến trúc 3 lớp

```
Client (HTTP Request)
        ↓
┌─────────────────────────┐
│  Presentation Layer      │  studentController.js + studentRoutes.js
│  (Nhận request, trả     │  → Không chứa business logic
│   response)             │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│  Business Logic Layer    │  StudentService.js
│  (Validate, nghiệp vụ,  │  → Kiểm tra ràng buộc, tính toán
│   xử lý logic)          │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│  Data Access Layer       │  StudentRepository.js
│  (Đọc/ghi dữ liệu)      │  → RAM (array) + file JSON
└─────────────────────────┘
```

---

## 🎁 Tính năng bonus đã triển khai

- ✅ **Sắp xếp** theo query param `?sort=field` hoặc `?sort=field:desc`
- ✅ **Persist dữ liệu** vào `data/students.json` – tự động đọc lại khi khởi động
- ✅ **Global error middleware** xử lý lỗi tập trung
- ✅ **Joi validation** validate input chặt chẽ
- ✅ **Unit tests** với Jest (mock Repository)

---

## 🛠️ Tech Stack

- **Runtime**: Node.js >= 16
- **Framework**: Express 4
- **Validation**: Joi 17
- **Testing**: Jest + Supertest
- **Dev tool**: Nodemon
