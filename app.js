const express = require('express');
const session = require('express-session');
const loginHandler = require(`./Login/loginHandler`);
const connection = require(`./database/database`)
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

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

app.get("/Teacher/appointment", function (req, res) {
    res.sendFile(__dirname + "/Teacher/appointment.html");
});

app.get("/Teacher/info", function (req, res) {
    res.sendFile(__dirname + "/Teacher/info.html");
});

app.get("/Student/group", function (req, res) {
    res.sendFile(__dirname + "/Student/group.html");
});

app.get("/Student/appointment", function (req, res) {
    res.sendFile(__dirname + "/Student/appointment.html");
});

app.get("/Student/info", function (req, res) {
    res.sendFile(__dirname + "/Student/info.html");
});

app.get("/Teacher/list-student", function (req, res) {
    res.sendFile(__dirname + "/Teacher/liststudent.html");
});

app.get("/Teacher/free-time", function (req, res) {
    res.sendFile(__dirname + "/Teacher/freecalendar.html");
});

app.get("/Student/getFullname", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT fullname FROM students WHERE id = ?";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results[0]);
        });
    } catch (error) {
        console.error("Error retrieving student name:", error);
        res.status(500).json({ error: "Error retrieving student name" });
    }
});

app.get("/Teacher/getFullname", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT fullname FROM teachers WHERE id = ?";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results[0]);
        });
    } catch (error) {
        console.error("Error retrieving teacher name:", error);
        res.status(500).json({ error: "Error retrieving teacher name" });
    }
});

// Lấy danh sách cuộc hẹn với cá nhân của giảng viên
app.get("/Teacher/history/personalappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT s.fullname, g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN students s ON a.student_id = s.id JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Personal' AND t.id = ? ORDER BY date_only ASC, start_time ASC;";

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

app.get("/Student/getInfo", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT s.fullname, s.studentcode, s.email, DATE_FORMAT(s.dateofbirth, '%Y-%m-%d') AS dob, s.phonenumber, s.class, s.password FROM students s WHERE s.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving student info:", error);
        res.status(500).json({ error: "Error retrieving student info" });
    }
});

app.patch("/Student/saveInfo", async function (req, res) {
    try {
        const userId = req.userId;
        const { fullname, email, studentcode, dateofbirth, className, phonenumber, password } = req.body;
        const sql = "UPDATE students SET fullname = ?, email = ?, studentcode = ?, dateofbirth = ?, phonenumber = ?, class = ?, password = ? WHERE id = ?";

        connection.query(sql, [fullname, email, studentcode, dateofbirth, phonenumber, className, password, userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error saving student info:", error);
        res.status(500).json({ error: "Error saving student info" });
    }
});

app.get("/Teacher/getInfo", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT t.fullname, t.email, t.teachercode, t.phonenumber, DATE_FORMAT(t.dateofbirth, '%Y-%m-%d') AS dob, t.password FROM teachers t WHERE t.id = ?;";

        connection.query(sql, [userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error retrieving teacher info:", error);
        res.status(500).json({ error: "Error retrieving teacher info" });
    }
});

app.patch("/Teacher/saveInfo", async function (req, res) {
    try {
        const userId = req.userId;
        const { fullname, email, teachercode, dateofbirth, phonenumber, password } = req.body;
        const sql = "UPDATE teachers SET fullname = ?, email = ?, teachercode = ?, dateofbirth = ?, phonenumber = ?, password = ? WHERE id = ?";

        connection.query(sql, [fullname, email, teachercode, dateofbirth, phonenumber, password, userId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error saving teacher info:", error);
        res.status(500).json({ error: "Error saving teacher info" });
    }
});

// Lấy danh sách cuộc hẹn nhóm của giảng viên
app.get("/Teacher/history/groupappointment", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = "SELECT g.name, DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, a.location, a.status, a.description FROM appointments a JOIN `groups` g ON a.group_id = g.id JOIN assigned_projects ap ON a.group_id = ap.group_id JOIN projects p ON ap.project_id = p.id JOIN teachers t ON p.teacher_id = t.id WHERE a.type = 'Group' AND t.id = ? ORDER BY date_only ASC, start_time ASC;";

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
    const userId = req.userId;
    const query = `
    SELECT
        f.id,
        DATE_FORMAT(f.start, '%Y-%m-%d') AS date_only,
        DATE_FORMAT(f.start, '%H:%i:%s') AS start_time,
        DATE_FORMAT(f.end, '%H:%i:%s') AS end_time
    FROM freetimes f WHERE f.teacher_id = ?
    ORDER BY date_only ASC, start_time ASC`;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching data');
        }
        res.json(results);
    });
});

// Thêm thời gian rảnh
app.post('/add-freetime', (req, res) => {
    const userId = req.userId;
    const { start, end } = req.body;

    const sql = 'INSERT INTO freetimes (start, end, teacher_id) VALUES (?, ?, ?)';
    connection.query(sql, [start, end, userId], (error, results) => {
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
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT
	        s.id, s.fullname, s.studentcode
        FROM students s
        JOIN student_teacher st ON s.id = st.student_id
        WHERE
            st.teacher_id = ?`;

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

// Lấy danh sách cuộc hẹn sắp tới của giảng viên
app.get("/Teacher/home/appointments", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT DISTINCT
	        g.name AS group_name, a.type,
	        DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only,
	        DATE_FORMAT(a.start, '%H:%i:%s') AS start_time,
	        DATE_FORMAT(a.end, '%H:%i:%s') AS end_time,
	        a.location, a.description
        FROM appointments a
        JOIN assigned_projects ap ON a.group_id = ap.group_id
        JOIN projects p ON ap.project_id = p.id
        JOIN teachers t ON p.teacher_id = t.id
        JOIN \`groups\` g ON a.group_id = g.id
        WHERE t.id = ? AND a.status = 'Scheduled' ORDER BY date_only ASC, start_time ASC;`;

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

// Lấy danh sách cuộc hẹn sắp tới của sinh viên
app.get("/Student/home/appointments", async function (req, res) {
    try {
        const userId = req.userId;
        const sql = `
        SELECT DISTINCT 
            g.name, a.type, 
            DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, 
            DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, 
            DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, 
            a.location, t.fullname  
        FROM appointments a 
        INNER JOIN assigned_projects ap ON a.group_id = ap.group_id 
        INNER JOIN \`groups\` g ON ap.group_id = g.id 
        INNER JOIN projects p ON ap.project_id = p.id 
        INNER JOIN teachers t ON p.teacher_id = t.id 
        LEFT JOIN group_members gm ON g.id = gm.group_id 
        WHERE (a.status = "Scheduled" AND ((a.type = "Personal" AND a.student_id = ?) OR (a.type = "Group" AND gm.student_id IS NOT NULL)))
        ORDER BY date_only ASC, start_time ASC`;

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

app.get("/Student/getGroups", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const sql = `
        SELECT
	        g.id, g.name, p.title, p.description, t.id AS teacher_id, t.fullname
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

app.get("/Student/getAppointments", async function (req, res) {
    try {
        const userId = req.userId; // Lấy userId của giảng viên từ session
        const groupId = req.query.groupId;
        const sql = `
        SELECT DISTINCT
            a.id, a.type, 
            DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only, 
            DATE_FORMAT(a.start, '%H:%i:%s') AS start_time, 
            DATE_FORMAT(a.end, '%H:%i:%s') AS end_time, 
            a.location, a.status, a.description  
        FROM appointments a 
        JOIN assigned_projects ap ON a.group_id = ap.group_id 
        JOIN \`groups\` g ON ap.group_id = g.id 
        JOIN projects p ON ap.project_id = p.id 
        LEFT JOIN group_members gm ON g.id = gm.group_id 
        WHERE (a.type = "Personal" AND a.student_id = ? AND a.group_id = ?) 
            OR (a.type = "Group" AND a.group_id = ?)
        ORDER BY date_only ASC, start_time ASC`;

        connection.query(sql, [userId, groupId, groupId], function (error, results, fields) {
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

app.patch("/updateAppointment", async function (req, res) {
    try {
        const appointmentId = req.body.id;
        const location = req.body.location;
        const description = req.body.description;

        const sql = `UPDATE appointments SET location = ?, description = ? WHERE id = ?`;

        connection.query(sql, [location, description, appointmentId], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ error: "Error updating appointment status" });
    }
});

app.delete('/Student/deleteAppointment/:id', (req, res) => {
    const appointmentId = req.params.id;

    const sql = 'DELETE FROM appointments WHERE id = ?';
    connection.query(sql, [appointmentId], (error, results) => {
        if (error) {
            console.error('Error deleting appointment:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete appointment.' });
        }
        res.json({ success: true });
    });
});

app.get("/getPersonalFreeTimes", async function (req, res) {
    try {
        const userId = req.userId;
        const date = req.query.date;
        const teacherId = req.query.teacherId;
        const sql = `
        WITH teacher_appointments AS (
            SELECT a.start, a.end
            FROM appointments a
            JOIN assigned_projects ap ON a.group_id = ap.group_id
            JOIN projects p ON ap.project_id = p.id
            WHERE p.teacher_id = ? AND DATE(a.start) = ?
        ),
        student_appointments AS (       
            SELECT a.start, a.end  
            FROM appointments a 
            INNER JOIN assigned_projects ap ON a.group_id = ap.group_id 
            INNER JOIN \`groups\` g ON ap.group_id = g.id 
            INNER JOIN projects p ON ap.project_id = p.id 
            LEFT JOIN group_members gm ON g.id = gm.group_id 
            WHERE (DATE(a.start) = ? AND ((a.type = "Personal" AND a.student_id = ?) OR (a.type = "Group" AND gm.student_id IS NOT NULL)))
        ),
        all_appointments AS (
            SELECT start, end FROM teacher_appointments
            UNION
            SELECT start, end FROM student_appointments
        ),
        freetime_intervals AS (
            SELECT start, end
            FROM freetimes
            WHERE teacher_id = ? AND DATE(freetimes.start) = ?
        ),
        all_times AS (
            SELECT start AS time_point, 'start' AS type FROM freetimes WHERE teacher_id = ? AND DATE(start) = ?
            UNION ALL
            SELECT end AS time_point, 'end' AS type FROM freetimes WHERE teacher_id = ? AND DATE(end) = ?
            UNION ALL
            SELECT start AS time_point, 'start' AS type FROM all_appointments
            UNION ALL
            SELECT end AS time_point, 'end' AS type FROM all_appointments
        )
        SELECT DATE_FORMAT(t1.time_point, '%H:%i:%s') AS free_start, DATE_FORMAT(MIN(t2.time_point), '%H:%i:%s') AS free_end
        FROM all_times t1
        JOIN all_times t2 ON t1.time_point < t2.time_point
        LEFT JOIN all_appointments ta ON t1.time_point < ta.end AND t2.time_point > ta.start
        WHERE ta.start IS NULL
            AND EXISTS (SELECT 1 FROM freetime_intervals)
        GROUP BY t1.time_point
        HAVING MIN(t2.time_point) IS NOT NULL
        ORDER BY free_start;`;

        connection.query(sql, [teacherId, date, date, userId, teacherId, date, teacherId, date, teacherId, date], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
            console.log(results);
        });
    } catch (error) {
        console.error("Error retrieving free times:", error);
        res.status(500).json({ error: "Error retrieving free times" });
    }
});

app.post("/Student/createPersonalAppointment", async function (req, res) {
    try {
        const userId = req.userId;
        const { groupId, start, end, description, location } = req.body;
        const sql = `INSERT INTO appointments (group_id, start, end, description, type, student_id, location, status) VALUES (?, ?, ?, ?, 'Personal', ?, ?, 'Scheduled')`;

        connection.query(sql, [groupId, start, end, description, userId, location], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error creating personal appointment:", error);
        res.status(500).json({ error: "Error creating personal appointment" });
    }
});

app.get("/getGroupFreeTimes", async function (req, res) {
    try {
        const date = req.query.date;
        const teacherId = req.query.teacherId;
        const groupId = req.query.groupId;
        const sql = `
        WITH teacher_appointments AS (
            SELECT a.start, a.end
            FROM appointments a
            JOIN assigned_projects ap ON a.group_id = ap.group_id
            JOIN projects p ON ap.project_id = p.id
            WHERE p.teacher_id = ? AND DATE(a.start) = ?
        ),
        group_members_in_same_group AS (
            SELECT gm.student_id
            FROM group_members gm
            WHERE gm.group_id = ? 
        ),
        student_appointments AS (       
            SELECT a.start, a.end  
            FROM appointments a 
            INNER JOIN assigned_projects ap ON a.group_id = ap.group_id 
            INNER JOIN \`groups\` g ON ap.group_id = g.id 
            INNER JOIN projects p ON ap.project_id = p.id 
            INNER JOIN group_members_in_same_group gm ON g.id = gm.student_id
            WHERE DATE(a.start) = ? AND ((a.type = "Personal" AND a.student_id IN (SELECT student_id FROM group_members_in_same_group)) OR (a.type = "Group" AND gm.student_id IS NOT NULL))
        ),
        all_appointments AS (
            SELECT start, end FROM teacher_appointments
            UNION
            SELECT start, end FROM student_appointments
        ),
        freetime_intervals AS (
            SELECT start, end
            FROM freetimes
            WHERE teacher_id = ? AND DATE(freetimes.start) = ?
        ),
        all_times AS (
            SELECT start AS time_point, 'start' AS type FROM freetimes WHERE teacher_id = ? AND DATE(START) = ?
            UNION ALL
            SELECT end AS time_point, 'end' AS type FROM freetimes WHERE teacher_id = ? AND DATE(END) = ?
            UNION ALL
            SELECT start AS time_point, 'start' AS type FROM all_appointments
            UNION ALL
            SELECT end AS time_point, 'end' AS type FROM all_appointments
        )
        SELECT DATE_FORMAT(t1.time_point, '%H:%i:%s') AS free_start, DATE_FORMAT(MIN(t2.time_point), '%H:%i:%s') AS free_end
        FROM all_times t1
        JOIN all_times t2 ON t1.time_point < t2.time_point
        LEFT JOIN all_appointments ta ON t1.time_point < ta.end AND t2.time_point > ta.start
        WHERE ta.start IS NULL
            AND EXISTS (SELECT 1 FROM freetime_intervals)
        GROUP BY t1.time_point
        HAVING MIN(t2.time_point) IS NOT NULL
        ORDER BY free_start;
        `;

        connection.query(sql, [teacherId, date, groupId, date, teacherId, date, teacherId, date, teacherId, date], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json(results);
            console.log(results);
        });
    } catch (error) {
        console.error("Error retrieving free times:", error);
        res.status(500).json({ error: "Error retrieving free times" });
    }
});

app.post("/Student/createGroupAppointment", async function (req, res) {
    try {
        const { groupId, start, end, description, location } = req.body;
        const sql = `INSERT INTO appointments (group_id, start, end, description, type, location, status) VALUES (?, ?, ?, ?, 'Group', ?, 'Scheduled')`;

        connection.query(sql, [groupId, start, end, description, location], function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error creating personal appointment:", error);
        res.status(500).json({ error: "Error creating personal appointment" });
    }
});

app.get("/Teacher/getPersonalAppointments", async function (req, res) {
    try {
        const groupId = req.query.groupId;
        const sql = `
        SELECT DISTINCT
            a.id, s.fullname,
            DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only,
            DATE_FORMAT(a.start, '%H:%i:%s') AS start_time,
            DATE_FORMAT(a.end, '%H:%i:%s') AS end_time,
            a.location, a.status, a.description
        FROM appointments a
        JOIN students s ON a.student_id = s.id
        WHERE a.type = 'Personal' AND a.group_id = ?
        ORDER BY date_only ASC, start_time ASC;`;

        connection.query(sql, [groupId], function (error, results, fields) {
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

app.get("/Teacher/getGroupAppointments", async function (req, res) {
    try {
        const groupId = req.query.groupId;
        const sql = `
        SELECT
            a.id,
            DATE_FORMAT(a.start, '%Y-%m-%d') AS date_only,
            DATE_FORMAT(a.start, '%H:%i:%s') AS start_time,
            DATE_FORMAT(a.end, '%H:%i:%s') AS end_time,
            a.location, a.status, a.description
        FROM appointments a
        JOIN \`groups\` g ON a.group_id = g.id
        WHERE a.type = 'Group' AND a.group_id = ?
        ORDER BY date_only ASC, start_time ASC;`;

        connection.query(sql, [groupId], function (error, results, fields) {
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

// Hàm parseDate để chuyển đổi định dạng ngày
const parseDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return null; // Return null if date is invalid
};

// Endpoint import sinh viên
app.post('/import-students', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const teacherId = req.session.userId; // Giả sử bạn lưu ID của giảng viên trong session
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const students = worksheet.map(row => ({
        fullname: row['studentname'],
        studentcode: row['StudentID'],
        email: row['Email'], // Sử dụng giá trị email từ file Excel
        dateofbirth: parseDate(row['birthdate']),
        class: row['Lớp'],
        password: '1',
        phonenumber: null
    }));

    let completed = 0; // Số lượng sinh viên đã xử lý
    const total = students.length; // Tổng số sinh viên

    const checkCompletion = () => {
        completed++;
        if (completed === total) {
            fs.unlinkSync(filePath); // Xóa tệp sau khi đã xử lý tất cả sinh viên
            res.json({ success: true });
        }
    };

    students.forEach(student => {
        if (!student.dateofbirth) {
            console.error(`Skipped student with ID: ${student.studentcode} due to invalid date.`);
            checkCompletion();
            return; // Skip this student
        }

        if (student.studentcode.length > 20) {
            console.error(`Skipped student with ID: ${student.studentcode} due to studentcode length.`);
            checkCompletion();
            return; // Skip this student
        }

        // Kiểm tra xem sinh viên đã tồn tại chưa
        const checkSql = 'SELECT id FROM students WHERE studentcode = ? OR email = ?';
        connection.query(checkSql, [student.studentcode, student.email], (checkError, checkResults) => {
            if (checkError) {
                console.error('Error checking student existence:', checkError);
                checkCompletion();
                return;
            }

            let studentId;
            if (checkResults.length > 0) {
                // Sinh viên đã tồn tại, lấy ID
                studentId = checkResults[0].id;
                console.log(`Student with ID: ${student.studentcode} already exists with ID: ${studentId}, linking to teacher ${teacherId}`);
                // Gán sinh viên cho giảng viên
                const linkSql = `
                INSERT INTO student_teacher (student_id, teacher_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                SELECT 1 FROM student_teacher WHERE student_id = ? AND teacher_id = ?
                );`;

                connection.query(linkSql, [studentId, teacherId, studentId, teacherId], (linkError, linkResults) => {
                    if (linkError) {
                        console.error('Error linking student to teacher:', linkError);
                    } else {
                        console.log(`Linked student ID: ${studentId} to teacher ID: ${teacherId}`);
                    }
                    checkCompletion();
                });
            } else {
                // Thêm sinh viên mới
                const insertSql = 'INSERT INTO students (fullname, studentcode, email, dateofbirth, class, password, phonenumber) VALUES (?, ?, ?, ?, ?, ?, ?)';
                connection.query(insertSql, [student.fullname, student.studentcode, student.email, student.dateofbirth, student.class, student.password, student.phonenumber], (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Error inserting student:', insertError);
                        checkCompletion();
                        return;
                    }
                    studentId = insertResults.insertId;
                    console.log(`Inserted student with ID: ${studentId}`);
                    // Gán sinh viên cho giảng viên
                    const linkSql = 'INSERT INTO student_teacher (student_id, teacher_id) VALUES (?, ?)';
                    connection.query(linkSql, [studentId, teacherId], (linkError, linkResults) => {
                        if (linkError) {
                            console.error('Error linking student to teacher:', linkError);
                        } else {
                            console.log(`Linked student ID: ${studentId} to teacher ID: ${teacherId}`);
                        }
                        checkCompletion();
                    });
                });
            }
        });
    });
});



//Endpoint lấy danh sách sinh viên và giảng viên quản lý
app.get('/students-list', (req, res) => {
    const teacherId = req.session.userId; // Lấy teacher_id từ session
    if (!teacherId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `
        SELECT DISTINCT s.id, s.fullname, s.studentcode, s.class, st.teacher_id
        FROM students s
        LEFT JOIN student_teacher st ON s.id = st.student_id
        WHERE st.teacher_id = ?;
    `;
    connection.query(sql, [teacherId], (error, results) => {
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ error: 'Failed to fetch students.' });
        }
        res.json(results);
    });
});




// Endpoint để lấy danh sách sinh viên từ bảng students
app.get('/students-list', (req, res) => {
    const sql = 'SELECT id, fullname, studentcode, class FROM students';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ error: 'Failed to fetch students.' });
        }
        console.log('Students:', results); // Log danh sách sinh viên để kiểm tra
        res.json(results);
    });
});

// Xóa sinh viên theo MSSV
app.delete('/delete-student', (req, res) => {
    const studentcode = req.query.studentcode;
    if (!studentcode) {
        return res.status(400).json({ success: false, message: 'Student code is required' });
    }

    const sql = 'DELETE FROM students WHERE studentcode = ?';
    connection.query(sql, [studentcode], (error, results) => {
        if (error) {
            console.error('Error deleting student:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete student' });
        }
        res.json({ success: true, message: 'Student deleted successfully' });
    });
});

// Xóa tất cả sinh viên và đặt lại AUTO_INCREMENT
app.delete('/delete-all-students', (req, res) => {
    const sqlDeleteGroupMembers = 'DELETE FROM group_members WHERE student_id IS NOT NULL';
    const sqlDeleteAppointments = 'DELETE FROM appointments WHERE student_id IS NOT NULL';
    const sqlDeleteStudents = 'DELETE FROM students';
    const sqlResetAutoIncrement = 'ALTER TABLE students AUTO_INCREMENT = 1';

    connection.query(sqlDeleteGroupMembers, (error, results) => {
        if (error) {
            console.error('Error deleting group members:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete group members', error: error.message });
        }
        connection.query(sqlDeleteAppointments, (error, results) => {
            if (error) {
                console.error('Error deleting appointments:', error);
                return res.status(500).json({ success: false, message: 'Failed to delete appointments', error: error.message });
            }
            connection.query(sqlDeleteStudents, (error, results) => {
                if (error) {
                    console.error('Error deleting all students:', error);
                    return res.status(500).json({ success: false, message: 'Failed to delete all students', error: error.message });
                }
                connection.query(sqlResetAutoIncrement, (error, results) => {
                    if (error) {
                        console.error('Error resetting AUTO_INCREMENT:', error);
                        return res.status(500).json({ success: false, message: 'Failed to reset AUTO_INCREMENT', error: error.message });
                    }
                    res.json({ success: true, message: 'All students and related records deleted and AUTO_INCREMENT reset successfully' });
                });
            });
        });
    });
});

// Sử dụng loginHandler để xử lý yêu cầu đăng nhập
app.use("/", loginHandler);

const PORT = 5000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});