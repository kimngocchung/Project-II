const express = require('express');
const session = require('express-session');
const loginHandler = require(`./Login/loginHandler`);
const connection = require(`./database/database`)
 
const app = express();
 
// Sử dụng session middleware
app.use(session({
    secret: 'secret_key', // Khóa bí mật để mã hóa session
    resave: false,
    saveUninitialized: false
}));
 
const attachUserIdToRequest = (req, res, next) => {
    const userId = req.session.userId;
    if (userId) {
        req.userId = userId; // Gắn userId vào req để có thể sử dụng trong các endpoint khác
    }
    next(); // Tiếp tục xử lý các middleware hoặc endpoint tiếp theo
};

// Sử dụng middleware để gắn userId vào req từ session
app.use(attachUserIdToRequest);
// Cấu hình đường dẫn tĩnh cho thư mục "login" chứa tệp login.html và các tệp tĩnh trong thư mục "assets"
app.use("/login", express.static(__dirname + "/login"));
 
// Cấu hình đường dẫn tĩnh cho thư mục "Group/HomepageTeacher" chứa tệp hometeacher.css
app.use("/Teacher", express.static(__dirname + "/Teacher"));
 
// Xử lý yêu cầu GET cho trang chủ "/" (trang đăng nhập)
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login/login.html");
});
 
// Định nghĩa route để phục vụ homestudent.html từ thư mục homepagestudent
app.get("/homepagestudent/homestudent", function (req, res) {
    console.log(req.session);
    res.sendFile(__dirname + "/homepagestudent/homestudent.html");
});
 
// Định nghĩa route để phục vụ hometeacher.html từ thư mục homepageteacher
app.get("/Teacher/home", function (req, res) {
    res.sendFile(__dirname + "/Teacher/hometeacher.html");
});

app.get("/Teacher/history", function (req, res) {
    res.sendFile(__dirname + "/Teacher/history.html");
});

app.get("/Teacher/history/personalappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT s.fullname, g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status FROM appointments a JOIN students s ON a.student_id = s.id JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Personal' AND t.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            // Gửi kết quả truy vấn dưới dạng JSON
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
});

app.get("/Teacher/history/groupappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status FROM appointments a JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Group' AND t.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            // Gửi kết quả truy vấn dưới dạng JSON
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
});
// Sử dụng loginHandler để xử lý yêu cầu đăng nhập
app.use("/", loginHandler);
 
// Khởi động server trên cổng 5000
const PORT = 5000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});
 