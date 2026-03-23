/**
 * PRESENTATION LAYER – studentRoutes
 * Khai báo tất cả các endpoint liên quan đến sinh viên.
 */

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");

// QUAN TRỌNG: /search phải đặt TRƯỚC /:studentId
// để Express không hiểu "search" là studentId

/** GET /api/students/search?q=keyword&sort=fullName */
router.get("/search", ctrl.searchStudents);

/** GET /api/students */
router.get("/", ctrl.getAllStudents);

/** POST /api/students */
router.post("/", ctrl.createStudent);

/** GET /api/students/:studentId */
router.get("/:studentId", ctrl.getStudentById);

/** PUT /api/students/:studentId */
router.put("/:studentId", ctrl.updateStudent);

/** DELETE /api/students/:studentId */
router.delete("/:studentId", ctrl.deleteStudent);

module.exports = router;
