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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/Teacher/group", function (req, res) {
    res.sendFile(__dirname + "/Teacher/group.html");
});

app.get("/Teacher/project", function (req, res) {
    res.sendFile(__dirname + "/Teacher/project.html");
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

app.get("/Teacher/getStudentsOfGroup", async function (req, res) {
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
// Sử dụng loginHandler để xử lý yêu cầu đăng nhập
app.use("/", loginHandler);

// Khởi động server trên cổng 5000
const PORT = 5000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});