const express = require('express');
const session = require('express-session');
const loginHandler = require(`./Login/loginHandler`);
const connection = require(`./database/database`)
const bodyParser = require('body-parser');
/*
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
    
const upload = multer({ dest: 'uploads/' });
*/

const app = express();

// Sử dụng session middleware
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const attachUserIdToRequest = (req, res, next) => {
    const userId = req.session.userId;
    if (userId) {
        req.userId = userId;
    }
    next();
};

app.use(attachUserIdToRequest);

app.use("/login", express.static(__dirname + "/login"));
app.use("/Teacher", express.static(__dirname + "/Teacher"));
app.use("/Student", express.static(__dirname + "/Student"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login/login.html");
});

app.get("/Teacher/home", function (req, res) {
    res.sendFile(__dirname + "/Teacher/hometeacher.html");
});

app.get("/Student/home", function (req, res) {
    res.sendFile(__dirname + "/Student/homestudent.html");
});

app.get("/Teacher/history", function (req, res) {
    res.sendFile(__dirname + "/Teacher/history.html");
});

app.get("/Teacher/group", function (req, res) {
    res.sendFile(__dirname + "/Teacher/group.html");
});

app.get("/Teacher/project", function (req, res) {
    res.sendFile(__dirname + "/Teacher/project.html");
});

app.get("/Student/group", function (req, res) {
    res.sendFile(__dirname + "/Student/group.html");
});

// Lấy danh sách cuộc hẹn với cá nhân của giảng viên
app.get("/Teacher/history/personalappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT s.fullname, g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN students s ON a.student_id = s.id JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Personal' AND t.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
});

// Lấy danh sách cuộc hẹn nhóm của giảng viên
app.get("/Teacher/history/groupappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Group' AND t.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
});

// Lấy danh sách thời gian rảnh
app.get('/freetimes', (req, res) => {
    const query = 'SELECT * FROM freetimes';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching data');
        }
        res.json(results);
    });
});

// Thêm thời gian rảnh
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

// Xoá thời gian rảnh
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

// Lấy danh sách sinh viên
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

// Lấy thông tin sinh viên
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

// Lấy danh sách nhóm sinh viên được quản lý bởi giảng viên
app.get("/Teacher/group/groups", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT
	        g.id, g.name, p.title, p.description, p.id AS project_id
        FROM \`groups\` g
        JOIN assigned_projects ap ON g.id = ap.group_id
        JOIN projects p ON ap.project_id = p.id
        WHERE
	        p.teacher_id = ?`;

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

// Lấy danh sách đề tài của giảng viên
app.get("/Teacher/project/projects", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT
	        p.id, p.title, p.description
        FROM projects p
        WHERE
	        p.teacher_id = ?`;

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

// Thêm đề tài
app.post("/Teacher/project/projects", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const { title, description } = req.body; // Lấy dữ liệu project từ request body

        const sql = `
        INSERT INTO projects (title, description, teacher_id)
        VALUES (?, ?, ?)`;

        connection.query(sql, [title, description, userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            // Gửi kết quả truy vấn dưới dạng JSON
            res.json(results);
        });
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).json({ error: "Error adding project" });
    }
});

// Xoá đề tài
app.delete('/project/:id', (req, res) => {
    const projectId = req.params.id;

    // Check if the project is assigned to any group
    connection.query('SELECT * FROM assigned_projects WHERE project_id = ?', [projectId], (error, assignedProjects) => {
        if (error) {
            console.error("Error checking assigned projects:", error);
            res.status(500).json({ error: "Error checking assigned projects" });
            return;
        }

        if (assignedProjects.length > 0) {
            res.status(400).send('Không thể xoá đề tài đã gán với một nhóm.');
        } else {
            // Delete the project
            connection.query('DELETE FROM projects WHERE id = ?', [projectId], (error, results) => {
                if (error) {
                    console.error("Error deleting project:", error);
                    res.status(500).json({ error: "Error deleting project" });
                    return;
                }
                res.send('Project deleted successfully.');
            });
        }
    });
});

// Cập nhật thông tin đề tài
app.put("/project/:id", async function (req, res) {
    try {
        const projectId = req.params.id; // Get the project ID from the route parameters
        const { description } = req.body; // Get the new description from the request body

        // SQL query to update the project description
        const sql = "UPDATE projects SET description = ? WHERE id = ?";

        connection.query(sql, [description, projectId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            // Send a success response
            res.json({ message: "Project description updated successfully." });
        });
    } catch (error) {
        console.error("Error updating project description:", error);
        res.status(500).json({ error: "Error updating project description" });
    }
});

// Lấy danh sách sinh viên
app.get("/Teacher/getStudents", async function (req, res) {
    try {
        const sql = `
        SELECT
	        s.id, s.fullname, s.studentcode
        FROM students s`;

        connection.query(sql, function (error, results, fields) {
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

// Lấy danh sách sinh viên của nhóm
app.get("/getStudentsOfGroup", async function (req, res) {
    try {
        const group_id = req.query.group_id;
        const sql = `
        SELECT
	        s.id, s.fullname, s.studentcode
        FROM students s
        JOIN group_members gm ON s.id = gm.student_id
        WHERE gm.group_id = ?`;

        connection.query(sql, [group_id], function (error, results, fields) {
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

// Thêm nhóm sinh viên
app.post("/Teacher/addGroup", function (req, res) {
    const { groupName, projectId, studentIds } = req.body;
    const sql1 = `INSERT INTO \`groups\` (name) VALUES (?)`;

    connection.query(sql1, [groupName], function (error, results, fields) {
        if (error) {
            console.error("Error saving group:", error);
            res.status(500).json({ error: "Error saving group" });
            return;
        }
        const groupId = results.insertId;


        studentIds.forEach(studentId => {
            const sql2 = `INSERT INTO group_members (group_id, student_id) VALUES (?, ?)`;

            connection.query(sql2, [groupId, studentId], function (error, results, fields) {
                if (error) {
                    console.error("Error saving group members:", error);
                    res.status(500).json({ error: "Error saving group members" });
                    return;
                }
            });
        });

        const sql3 = `INSERT INTO assigned_projects (group_id, project_id) VALUES (?, ?)`;

        connection.query(sql3, [groupId, projectId], function (error, results, fields) {
            if (error) {
                console.error("Error assigning project:", error);
                res.status(500).json({ error: "Error assigning project" });
                return;
            }
            res.json({ success: true });
        });
    });
});

// Sửa thông tin nhóm sinh viên
app.put("/Teacher/editGroup", async function (req, res) {
    const { groupName, projectId, studentIds, groupId } = req.body;
    const sql1 = `UPDATE \`groups\` g SET name = ? WHERE g.id = ?`;

    connection.query(sql1, [groupName, groupId], function (error, results, fields) {
        if (error) {
            console.error("Error saving group:", error);
            res.status(500).json({ error: "Error saving group" });
            return;
        }
    });

    const sql2 = `DELETE FROM group_members gm WHERE gm.group_id = ?`;
    connection.query(sql2, [groupId], function (error, results, fields) {
        if (error) {
            console.error("Error saving group:", error);
            res.status(500).json({ error: "Error saving group" });
            return;
        }
    });

    studentIds.forEach(studentId => {
        const sql3 = `INSERT INTO group_members (group_id, student_id) VALUES (?, ?)`;

        connection.query(sql3, [groupId, studentId], function (error, results, fields) {
            if (error) {
                console.error("Error saving group members:", error);
                res.status(500).json({ error: "Error saving group members" });
                return;
            }
        });
    });

    const sql4 = `UPDATE assigned_projects ap SET project_id = ? WHERE ap.group_id = ?;`;

    connection.query(sql4, [projectId, groupId], function (error, results, fields) {
        if (error) {
            console.error("Error assigning project:", error);
            res.status(500).json({ error: "Error assigning project" });
            return;
        }
        res.json({ success: true });
    });
});

// Lấy danh sách cuộc hẹn sắp tới của sinh viên
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
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
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
});
*/

app.get("/Student/getGroups", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT
	        g.id, g.name, p.title, p.description, t.fullname
        FROM \`groups\` g
        JOIN assigned_projects ap ON g.id = ap.group_id
        JOIN projects p ON ap.project_id = p.id
        JOIN teachers t ON p.teacher_id = t.id
        JOIN group_members gm ON g.id = gm.group_id
        WHERE
	        gm.student_id = ?`;

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

// Sử dụng loginHandler để xử lý yêu cầu đăng nhập
app.use("/", loginHandler);

const PORT = 5000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});