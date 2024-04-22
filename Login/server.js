const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded();
const app = express();

// Cấu hình đường dẫn tĩnh cho thư mục "assets"
app.use("/assets", express.static("assets"));

// Cấu hình kết nối đến cơ sở dữ liệu MySQL
const connection = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "1234",
	database: "qlylichhen",

});

// Kết nối đến cơ sở dữ liệu
connection.connect(function (error) {
	if (error) throw error;
	else console.log("Connect to the database successfully!");
});

// Xử lý yêu cầu GET cho trang chủ "/" (trang đăng nhập)
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

// Xử lý yêu cầu POST cho trang chủ "/" (xử lý đăng nhập)
app.post("/", encoder, function (req, res) {
    var email = req.body.email;
	var password = req.body.password;
	// Truy vấn đến bảng "students"
    connection.query("SELECT * FROM students WHERE email = ? AND password = ?", [email, password], function (error, results, fields) {
        if (results.length > 0) {
            // Đăng nhập thành công (sinh viên)
            res.json({ success: true }); // Gửi thông báo thành công dưới dạng JSON
        } else {
           // Đăng nhập thất bại
           res.json({ error: "Email hoặc mật khẩu không chính xác" }); // Gửi thông báo lỗi dưới dạng JSON
        }
        res.end();
    });
});

// Xử lý yêu cầu GET cho trang "home" (trang sau khi đăng nhập thành công)
app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/home.html")
});

// Khởi động server trên cổng 5000 
app.listen(5000);
