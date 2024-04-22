const express = require('express');
const session = require('express-session');
const loginHandler = require('./Login/loginHandler');

const app = express();

// Sử dụng session middleware
app.use(session({
    secret: 'secret_key', // Khóa bí mật để mã hóa session
    resave: false,
    saveUninitialized: false
}));

// Cấu hình đường dẫn tĩnh cho thư mục "login" chứa tệp login.html và các tệp tĩnh trong thư mục "assets"
app.use("/login", express.static(__dirname + "/login"));

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
app.get("/homepageteacher/hometeacher", function (req, res) {
    res.sendFile(__dirname + "/homepageteacher/hometeacher.html");
});

// Sử dụng loginHandler để xử lý yêu cầu đăng nhập
app.use("/", loginHandler);

// Khởi động server trên cổng 5000 
const PORT = 5000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});
