const express = require('express');
const db = require('../database/database');

const router = express.Router();
const encoder = express.urlencoded({ extended: true });

// Xử lý yêu cầu POST cho đăng nhập
router.post("/", encoder, async (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra xem email và password có được gửi từ client không
    if (!email || !password) {
        return res.status(400).json({ error: "Vui lòng cung cấp email và password." });
    }

    try {
        // Kiểm tra trong bảng "students" nếu email và password hợp lệ
        const studentResults = await queryDatabase("students", email, password);
        if (studentResults && studentResults.length > 0) {
            const studentId = studentResults[0].id;
            req.session.userId = studentId;
            req.session.userType = 'student';
            return res.status(200).json({ success: true, message: "Đăng nhập thành công", userType: 'student', userId: studentId });
        }

        // Kiểm tra trong bảng "teachers" nếu email và password hợp lệ
        const teacherResults = await queryDatabase("teachers", email, password);
        if (teacherResults && teacherResults.length > 0) {
            const teacherId = teacherResults[0].id;
            req.session.userId = teacherId;
            req.session.userType = 'teacher';
            return res.status(200).json({ success: true, message: "Đăng nhập thành công", userType: 'teacher', userId: teacherId });
        }

        // Nếu không hợp lệ, trả về thông báo lỗi đăng nhập
        res.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý đăng nhập." });
    }
});

// Hàm truy vấn cơ sở dữ liệu
async function queryDatabase(tableName, email, password) {
    try {
        const sql = `SELECT * FROM ${tableName} WHERE email = ? AND password = ?`;
        // Sử dụng null thay vì undefined nếu một trong các tham số là undefined
        const [rows, fields] = await db.promise().execute(sql, [email || null, password || null]);
        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = router;
