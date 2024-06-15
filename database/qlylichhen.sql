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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.appointments: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.assigned_projects: ~0 rows (approximately)

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
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_freetimes_teachers` (`teacher_id`),
  CONSTRAINT `FK_freetimes_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.freetimes: ~0 rows (approximately)

-- Dumping structure for table qlylichhen.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.groups: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.group_members: ~0 rows (approximately)

-- Dumping structure for table qlylichhen.projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_projects_teachers` (`teacher_id`),
  CONSTRAINT `FK_projects_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.projects: ~0 rows (approximately)

-- Dumping structure for table qlylichhen.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateofbirth` date DEFAULT NULL,
  `phonenumber` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.students: ~0 rows (approximately)

-- Dumping structure for table qlylichhen.student_teacher
CREATE TABLE IF NOT EXISTS `student_teacher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_student_teacher_students` (`student_id`),
  KEY `FK_student_teacher_teachers` (`teacher_id`),
  CONSTRAINT `FK_student_teacher_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FK_student_teacher_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.student_teacher: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.teachers: ~3 rows (approximately)
INSERT INTO `teachers` (`id`, `fullname`, `email`, `teachercode`, `dateofbirth`, `phonenumber`, `password`) VALUES
	(1, 'Trương Thị Diệu Linh', 'gv1@gmail.com', 'GV001', '1980-01-01', '0', '1'),
	(2, 'Giáo viên test 1', 'gv2@gmail.com', NULL, NULL, NULL, '1'),
	(3, 'Giáo viên test 2', 'gv3@gmail.com', NULL, NULL, NULL, '1');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
