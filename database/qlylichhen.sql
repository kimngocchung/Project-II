-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for qlylichhen
CREATE DATABASE IF NOT EXISTS `qlylichhen` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `qlylichhen`;

-- Dumping structure for table qlylichhen.appointments
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `type` enum('Personal','Group') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` int DEFAULT NULL,
  `location` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Scheduled','Completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Scheduled',
  PRIMARY KEY (`id`),
  KEY `FK_appointments_students` (`student_id`),
  KEY `FK_appointments_projects` (`group_id`) USING BTREE,
  CONSTRAINT `FK_appointments_groups` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `FK_appointments_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.appointments: ~5 rows (approximately)
INSERT INTO `appointments` (`id`, `group_id`, `start`, `end`, `description`, `type`, `student_id`, `location`, `status`) VALUES
	(1, 1, '2024-04-23 11:30:00', '2024-04-23 12:00:00', NULL, 'Group', NULL, 'B1 - 801', 'Completed'),
	(2, 1, '2024-05-07 11:30:00', '2024-05-07 12:00:00', NULL, 'Personal', 1, 'B1 - 801', 'Completed'),
	(3, 1, '2024-05-14 11:30:00', '2024-05-14 12:00:00', '', 'Group', NULL, 'B1 - 801', 'Scheduled'),
	(4, 2, '2024-05-12 11:30:00', '2024-05-12 11:45:00', 'test', 'Personal', 4, NULL, 'Completed'),
	(5, 2, '2024-05-16 11:30:00', '2024-05-16 12:00:00', NULL, 'Personal', 4, NULL, 'Scheduled');

-- Dumping structure for table qlylichhen.assigned_projects
CREATE TABLE IF NOT EXISTS `assigned_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `project_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_assigned_projects_groups` (`group_id`),
  KEY `FK_assigned_projects_projects` (`project_id`),
  CONSTRAINT `FK_assigned_projects_groups` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `FK_assigned_projects_projects` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.assigned_projects: ~2 rows (approximately)
INSERT INTO `assigned_projects` (`id`, `group_id`, `project_id`) VALUES
	(1, 1, 1),
	(2, 2, 2);

-- Dumping structure for event qlylichhen.check_delete_freetime
DELIMITER //
CREATE EVENT `check_delete_freetime` ON SCHEDULE EVERY 1 MINUTE STARTS '2024-05-07 23:18:44' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
DELETE FROM freetimes
WHERE end < CURTIME();
END//
DELIMITER ;

-- Dumping structure for event qlylichhen.check_update_appointment_status
DELIMITER //
CREATE EVENT `check_update_appointment_status` ON SCHEDULE EVERY 1 MINUTE STARTS '2024-05-07 23:16:11' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
	UPDATE appointments
   SET status = 'Completed'
   WHERE END < CURTIME();
END//
DELIMITER ;

-- Dumping structure for table qlylichhen.freetimes
CREATE TABLE IF NOT EXISTS `freetimes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dumping data for table qlylichhen.freetimes: ~1 rows (approximately)
INSERT INTO `freetimes` (`id`, `date`, `start_time`, `end_time`) VALUES
  (1, '2024-05-30', '08:00:00', '12:00:00'),
  (2, '2024-05-31', '08:01:00', '12:00:00');


DELIMITER //

CREATE PROCEDURE delete_past_freetimes()
BEGIN
    DELETE FROM freetimes WHERE date < CURDATE();
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE add_freetime(
    IN new_date DATE,
    IN start_time TIME,
    IN end_time TIME
)
BEGIN
    DECLARE msg VARCHAR(255);

    -- Kiểm tra nếu thời gian kết thúc lớn hơn thời gian bắt đầu
    IF end_time <= start_time THEN
        SET msg = 'End time must be greater than start time';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    -- Kiểm tra nếu ngày mới phải lớn hơn hoặc bằng ngày hiện tại
    IF new_date < CURDATE() THEN
        SET msg = 'Date must be greater than or equal to today';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    -- Thêm lịch rảnh vào bảng freetimes
    INSERT INTO freetimes (date, start_time, end_time)
    VALUES (new_date, start_time, end_time);
END //

DELIMITER ;


CREATE EVENT delete_old_freetimes
ON SCHEDULE EVERY 1 DAY
DO
    CALL delete_past_freetimes();




-- Dumping structure for table qlylichhen.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.groups: ~2 rows (approximately)
INSERT INTO `groups` (`id`, `name`) VALUES
	(1, 'Nhóm 1'),
	(2, 'test');

-- Dumping structure for table qlylichhen.group_members
CREATE TABLE IF NOT EXISTS `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `student_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_group_members_groups` (`group_id`),
  KEY `FK_group_members_students` (`student_id`),
  CONSTRAINT `FK_group_members_groups` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `FK_group_members_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.group_members: ~4 rows (approximately)
INSERT INTO `group_members` (`id`, `group_id`, `student_id`) VALUES
	(1, 1, 1),
	(2, 1, 2),
	(3, 1, 3),
	(4, 2, 4);

-- Dumping structure for table qlylichhen.projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_projects_teachers` (`teacher_id`),
  CONSTRAINT `FK_projects_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.projects: ~2 rows (approximately)
INSERT INTO `projects` (`id`, `title`, `description`, `teacher_id`) VALUES
	(1, 'Project 2: Quản lý lịch hẹn', 'Web quản lý lịch hẹn giữa sinh viên và giảng viên', 1),
	(2, 'test', NULL, 2);

-- Dumping structure for table qlylichhen.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentcode` int DEFAULT NULL,
  `dateofbirth` date DEFAULT NULL,
  `phonenumber` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.students: ~4 rows (approximately)
INSERT INTO `students` (`id`, `fullname`, `email`, `studentcode`, `dateofbirth`, `phonenumber`, `class`, `password`) VALUES
	(1, 'Nguyễn Tiến Dũng', 'sv1@gmail.com', 20215546, '2003-11-04', '0911063717', 'IT2 - 01 -K66', '1'),
	(2, 'Bùi Quang Dũng', 'sv2@gmail.com', 20215541, NULL, NULL, 'IT2 - 01 -K66', '1'),
	(3, 'Kim Ngọc Chung', 'sv3@gmail.com', 20215535, NULL, NULL, 'IT2 - 01 -K66', '1'),
	(4, 'test', 'sv0@gmail.com', NULL, NULL, NULL, NULL, '1');

-- Dumping structure for table qlylichhen.teachers
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `teachercode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateofbirth` date DEFAULT NULL,
  `phonenumber` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.teachers: ~2 rows (approximately)
INSERT INTO `teachers` (`id`, `fullname`, `email`, `teachercode`, `dateofbirth`, `phonenumber`, `password`) VALUES
	(1, 'Trương Thị Diệu Linh', 'gv1@gmail.com', 'GV01', NULL, NULL, '1'),
	(2, 'test', 'gv0@gmail.com', NULL, NULL, NULL, '1');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
