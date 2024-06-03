    const express = require('express');
    const session = require('express-session');
    const loginHandler = require(`./Login/loginHandler`);
    const connection = require(`./database/database`);
    const bodyParser = require('body-parser');
/*const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
    



    const upload = multer({ dest: 'uploads/' });*/
    const app = express();
    app.use(express.json());

    // Sử dụng session middleware

    app.use(express.urlencoded({ extended: true }));

    app.use(session({
        secret: 'secret_key',
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
    app.use("/Student", express.static(__dirname + "/Student"));
    // Xử lý yêu cầu GET cho trang chủ "/" (trang đăng nhập)
    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/login/login.html");
    });
    // Định nghĩa route để phục vụ hometeacher.html từ thư mục homepageteacher
    app.get("/Teacher/home", function (req, res) {
        res.sendFile(__dirname + "/Teacher/hometeacher.html");
    });

    app.get("/Student/home", function (req, res) {
        res.sendFile(__dirname + "/Student/homestudent.html");
    });
    app.get("/Teacher/history", function (req, res) {
        res.sendFile(__dirname + "/Teacher/history.html");
    });

    app.get("/Teacher/history/personalappointment", async function (req, res) {
        try {
            const userId = req.userId;
            const sql = "SELECT s.fullname, g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN students s ON a.student_id = s.id JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Personal' AND t.id = ?;";

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
            const sql = "SELECT g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Group' AND t.id = ?;";

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

    app.get("/Teacher/home/appointments", async function (req, res) {
        try {
            const userId = req.userId; // Lấy userId của giảng viên từ session
            const sql = "SELECT a.id, g.name AS group_name, a.type, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.group_id = p.id JOIN teachers t ON p.teacher_id = t.id JOIN `groups` g ON ap.group_id = g.id WHERE t.id = ? AND a.status = 'Scheduled';";

            connection.query(sql, [userId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                // Gửi danh sách lịch hẹn dưới dạng JSON về trình duyệt
                res.json(results);
            });
        } catch (error) {
            console.error("Error retrieving appointments:", error);
            res.status(500).json({ error: "Error retrieving appointments" });
        }
    });

    app.get("/Student/home/appointments", async function (req, res) {
        try {
            const userId = req.userId;
            console.log(req.userId);
            const sql = `
            SELECT 
                g.name, a.type, 
                DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, 
                DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, 
                DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, 
                a.location, t.fullname  
            FROM appointments a 
            JOIN assigned_projects ap ON a.group_id = ap.group_id 
            JOIN \`groups\` g ON ap.group_id = g.id 
            JOIN projects p ON ap.project_id = p.id 
            JOIN teachers t ON p.teacher_id = t.id 
            LEFT JOIN group_members gm ON g.id = gm.group_id 
            WHERE (a.status = "Scheduled" AND a.type = "Personal" AND a.student_id = ?) 
                OR (a.type = "Group" AND gm.student_id = ? AND a.status = "Scheduled")`;

            connection.query(sql, [userId, userId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                // Gửi danh sách lịch hẹn dưới dạng JSON về trình duyệt
                res.json(results);
            });
        } catch (error) {
            console.error("Error retrieving appointments:", error);
            res.status(500).json({ error: "Error retrieving appointments" });
        }
    });


    // Định nghĩa route để lấy danh sách các khoảng thời gian rảnh
    app.get('/freetimes', (req, res) => {
        const query = 'SELECT * FROM freetimes';
        connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching data');
        }
        res.json(results);
        });
    });

    app.post('/add-freetime', (req, res) => {
        const { date, startTime, endTime } = req.body;
      
        const sql = 'CALL add_freetime(?, ?, ?)';
        connection.query(sql, [date, startTime, endTime], (error, results) => {
          if (error) {
            console.error('Error adding free time:', error);
            return res.status(500).json({ success: false, message: 'Failed to add free time.' });
          }
      
          // Set Content-Type header to JSON
          res.setHeader('Content-Type', 'application/json');
      
          // Send successful JSON response
          res.json({ success: true, message: 'Free time added successfully.' });
        });
    });
    
      
    app.delete('/delete-freetime/:id', (req, res) => {
        const freeTimeId = req.params.id;

        const sql = 'DELETE FROM freetimes WHERE id = ?';
        connection.query(sql, [freeTimeId], (error, results) => {
            if (error) {
                console.error('Error deleting free time:', error);
                return res.status(500).json({ success: false, message: 'Failed to delete free time.' });
            }
            res.send('Free time deleted.');
        });
    });


// Định nghĩa endpoint /students
app.get('/students', (req, res) => {
    const sql = 'SELECT id, fullname, studentcode, class FROM students';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ error: 'Failed to fetch students.' });
        }
        console.log('Students:', results);
        res.json(results);
    });
});

// Endpoint để lấy chi tiết sinh viên
app.get('/student-details', (req, res) => {
    const id = req.query.id;
    const sql = 'SELECT id, fullname, email, studentcode, dateofbirth, phonenumber, class, password FROM students WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error fetching student details:', error);
            return res.status(500).json({ error: 'Failed to fetch student details.' });
        }
        res.json(results[0]);
    });
});


// Endpoint để lấy danh sách các nhóm
app.get('/groups', (req, res) => {
    const sql = 'SELECT id, name FROM `groups`';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching groups:', error);
            return res.status(500).json({ error: 'Failed to fetch groups.' });
        }
        res.json(results);
    });
});



// Endpoint để tìm kiếm nhóm theo tên
app.get('/groups/search', (req, res) => {
    const query = req.query.query;
    const sql = 'SELECT id, name FROM groups WHERE name LIKE ?';
    connection.query(sql, [`%${query}%`], (error, results) => {
        if (error) {
            console.error('Error searching groups:', error);
            return res.status(500).json({ error: 'Failed to search groups.' });
        }
        res.json(results);
    });
});


// Endpoint để lấy danh sách các đề tài
app.get('/projects', (req, res) => {
    const sql = 'SELECT id, title FROM projects';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }
        res.json(results);
    });
});

// Endpoint để tìm kiếm sinh viên theo tên hoặc MSSV
app.get('/students/search', (req, res) => {
    const query = req.query.query;
    const sql = 'SELECT id, fullname, studentcode FROM students WHERE fullname LIKE ? OR studentcode LIKE ?';
    connection.query(sql, [`%${query}%`, `%${query}%`], (error, results) => {
        if (error) {
            console.error('Error searching students:', error);
            return res.status(500).json({ error: 'Failed to search students.' });
        }
        res.json(results);
    });
});


// Endpoint để lấy danh sách các đề tài
app.get('/projects', (req, res) => {
    const sql = 'SELECT id, title FROM projects';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }
        res.json(results);
    });
});


// Endpoint để lưu nhóm đề tài
app.post('/assign-group', (req, res) => {
    const { groupID, projectID, students } = req.body;
    // Lưu nhóm đề tài vào database (giả sử bạn có các bảng và quan hệ phù hợp)
    // Implement logic to save group assignment to the database
    res.json({ success: true });
});


    

    /*
    app.post('/import-students', (req, res) => {
        const jsonData = req.body;
        if (!jsonData || !Array.isArray(jsonData)) {
            return res.status(400).send('Invalid data format.');
        }
    
        jsonData.forEach(row => {
            const { classid, courseid, name, SectionType, note, studentID, studentname, email, birthdate } = row;
    
            // Lưu dữ liệu vào bảng projects
            const projectQuery = 'INSERT INTO projects (title, description) VALUES (?, ?)';
            connection.query(projectQuery, [name, note], (err, result) => {
                if (err) {
                    console.error('Error inserting project data:', err);
                }
            });
    
            // Lưu dữ liệu vào bảng students
            const studentQuery = 'INSERT INTO students (studentcode, fullname, email, dateofbirth) VALUES (?, ?, ?, ?)';
            connection.query(studentQuery, [studentID, studentname, email, birthdate], (err, result) => {
                if (err) {
                    console.error('Error inserting student data:', err);
                }
            });
        });
    
        res.status(200).send('File imported successfully.');
    });*/
    


    // Sử dụng loginHandler để xử lý yêu cầu đăng nhập
    app.use("/", loginHandler);

    // Khởi động server trên cổng 5000
    const PORT = 5000;
    app.listen(PORT, function () {
        console.log(`Server is running on port ${PORT}`);
    });