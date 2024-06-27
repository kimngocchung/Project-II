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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.appointments: ~8 rows (approximately)
INSERT INTO `appointments` (`id`, `group_id`, `start`, `end`, `description`, `type`, `student_id`, `location`, `status`) VALUES
	(41, 25, '2024-06-19 08:00:00', '2024-06-19 08:15:00', '', 'Personal', 180, '', 'Completed'),
	(42, 25, '2024-06-19 10:00:00', '2024-06-19 10:15:00', '', 'Group', NULL, '', 'Completed'),
	(43, 26, '2024-06-19 09:00:00', '2024-06-19 09:15:00', '', 'Personal', 173, '', 'Completed'),
	(44, 25, '2024-06-19 11:00:00', '2024-06-19 11:15:00', '', 'Personal', 177, '', 'Completed'),
	(45, 25, '2024-06-29 13:30:00', '2024-06-29 13:45:00', '', 'Personal', 180, '', 'Scheduled'),
	(46, 25, '2024-06-29 15:00:00', '2024-06-29 15:15:00', '', 'Group', NULL, '', 'Scheduled'),
	(47, 25, '2024-06-29 07:00:00', '2024-06-29 07:15:00', '', 'Personal', 180, '', 'Scheduled'),
	(48, 26, '2024-06-29 10:00:00', '2024-06-29 10:15:00', '', 'Group', NULL, '', 'Scheduled');

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.assigned_projects: ~3 rows (approximately)
INSERT INTO `assigned_projects` (`id`, `group_id`, `project_id`) VALUES
	(20, 25, 22),
	(21, 26, 23),
	(22, 27, 23);

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.freetimes: ~1 rows (approximately)
INSERT INTO `freetimes` (`id`, `start`, `end`, `teacher_id`) VALUES
	(23, '2024-06-29 00:00:00', '2024-06-29 23:59:00', 1);

-- Dumping structure for table qlylichhen.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.groups: ~3 rows (approximately)
INSERT INTO `groups` (`id`, `name`) VALUES
	(25, 'Nhóm 2'),
	(26, 'nhóm ip'),
	(27, 'm');

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
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.group_members: ~9 rows (approximately)
INSERT INTO `group_members` (`id`, `group_id`, `student_id`) VALUES
	(81, 25, 180),
	(82, 25, 173),
	(83, 25, 177),
	(84, 26, 180),
	(85, 26, 173),
	(86, 26, 164),
	(87, 27, 180),
	(88, 27, 173),
	(89, 27, 164);

-- Dumping structure for table qlylichhen.projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_projects_teachers` (`teacher_id`),
  CONSTRAINT `FK_projects_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.projects: ~2 rows (approximately)
INSERT INTO `projects` (`id`, `title`, `description`, `teacher_id`) VALUES
	(22, 'Project 2: Quản lý lịch hẹn', 'test', 1),
	(23, 'IP', '', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.students: ~41 rows (approximately)
INSERT INTO `students` (`id`, `fullname`, `email`, `studentcode`, `dateofbirth`, `phonenumber`, `class`, `password`) VALUES
	(162, 'Vũ Đức Quang', 'quang.vd183814@sis.hust.edu.vn', '20183814', '2000-04-17', NULL, 'Kỹ thuật máy tính 01-K63', '1'),
	(163, 'Nguyễn Khương Duy', 'duy.nk190077@sis.hust.edu.vn', '20190077', '2001-10-20', NULL, 'Kỹ thuật máy tính 04-K64', '1'),
	(164, 'Trần Quốc Anh', 'anh.tq194225@sis.hust.edu.vn', '20194225', '2001-09-16', NULL, 'Kỹ thuật máy tính 03-K64', '1'),
	(165, 'Vũ Quốc Anh', 'anh.vq194228@sis.hust.edu.vn', '20194228', '2001-06-10', NULL, 'Kỹ thuật máy tính 02-K64', '1'),
	(166, 'Nguyễn Thành Bắc', 'bac.nt194229@sis.hust.edu.vn', '20194229', '2001-05-27', NULL, 'Kỹ thuật máy tính 03-K64', '1'),
	(167, 'Vũ Minh Hiếu', 'hieu.vm194284@sis.hust.edu.vn', '20194284', '2001-04-16', NULL, 'Kỹ thuật máy tính 03-K64', '1'),
	(168, 'Nguyễn Viết Mạnh', 'manh.nv194325@sis.hust.edu.vn', '20194325', '2001-06-10', NULL, 'Kỹ thuật máy tính 02-K64', '1'),
	(169, 'Nguyễn Hữu Tuấn', 'tuan.nh194401@sis.hust.edu.vn', '20194401', '2001-12-21', NULL, 'Kỹ thuật máy tính 01-K64', '1'),
	(170, 'Nguyễn Nam Anh', 'anh.nn210036@sis.hust.edu.vn', '20210036', '2003-04-04', NULL, 'Kỹ thuật máy tính 04-K66', '1'),
	(171, 'Lê Đức Huy', 'huy.ld210429@sis.hust.edu.vn', '20210429', '2003-08-19', NULL, 'Kỹ thuật máy tính 04-K66', '1'),
	(172, 'Nguyễn Quang Chiến', 'chien.nq215533@sis.hust.edu.vn', '20215533', '2003-05-03', NULL, 'Kỹ thuật máy tính 04-K66', '1'),
	(173, 'Kim Ngọc Chung', 'chung.kn215535@sis.hust.edu.vn', '20215535', '2003-01-01', '', 'Kỹ thuật máy tính 01-K66', '1'),
	(174, 'Bùi Văn Cương', 'cuong.bv215536@sis.hust.edu.vn', '20215536', '2003-03-26', NULL, 'Kỹ thuật máy tính 02-K66', '1'),
	(175, 'Cao Mạnh Cường', 'cuong.cm215537@sis.hust.edu.vn', '20215537', '2003-09-16', NULL, 'Kỹ thuật máy tính 03-K66', '1'),
	(176, 'Bùi Hoàng Dũng', 'dung.bh215540@sis.hust.edu.vn', '20215540', '2003-05-16', NULL, 'Kỹ thuật máy tính 05-K66', '1'),
	(177, 'Bùi Quang Dũng', 'dung.bq215541@sis.hust.edu.vn', '20215541', '2003-01-05', NULL, 'Kỹ thuật máy tính 01-K66', '1'),
	(178, 'Hoàng Mạnh Dũng', 'dung.hm215543@sis.hust.edu.vn', '20215543', '2003-04-02', NULL, 'Kỹ thuật máy tính 03-K66', '1'),
	(179, 'Nguyễn Hữu Dũng', 'dung.nh215545@sis.hust.edu.vn', '20215545', '2003-03-17', NULL, 'Kỹ thuật máy tính 05-K66', '1'),
	(180, 'Nguyễn Tiến Dũng', 'dung.nt215546@sis.hust.edu.vn', '20215546', '2003-11-04', '0911063717', 'Kỹ thuật máy tính 01-K66', '1'),
	(181, 'Thiều Văn Dũng', 'dung.tv215547@sis.hust.edu.vn', '20215547', '2003-10-20', NULL, 'Kỹ thuật máy tính 03-K66', '1'),
	(182, 'Võ Anh Dũng', 'dung.va215548@sis.hust.edu.vn', '20215548', '2003-10-31', NULL, 'Kỹ thuật máy tính 04-K66', '1'),
	(183, 'Tạ Phương Duy', 'duy.tp215549@sis.hust.edu.vn', '20215549', '2003-08-30', NULL, 'Kỹ thuật máy tính 05-K66', '1'),
	(184, 'Đào Đức Dương', 'duong.dd215551@sis.hust.edu.vn', '20215551', '2003-09-12', NULL, 'Kỹ thuật máy tính 05-K66', '1'),
	(185, 'Đào An Khánh', 'khanh.da207609@sis.hust.edu.vn', '20207609', '2002-09-25', NULL, 'IT-LTU 01-K65', '1'),
	(186, 'Phan Thanh Lộc', 'loc.pt207614@sis.hust.edu.vn', '20207614', '2002-02-27', NULL, 'IT-LTU 01-K65', '1'),
	(187, 'Phan Thái Nam', 'nam.pt207622@sis.hust.edu.vn', '20207622', '2002-09-10', NULL, 'IT-LTU 02-K65', '1'),
	(188, 'Nguyễn Minh Nhật', 'nhat.nm207645@sis.hust.edu.vn', '20207645', '2002-07-28', NULL, 'IT-LTU 01-K65', '1'),
	(189, 'Nguyễn Xuân Sơn', 'son.nx207648@sis.hust.edu.vn', '20207648', '2002-11-20', NULL, 'IT-LTU 01-K65', '1'),
	(190, 'Đỗ Minh Thiện', 'thien.dm207649@sis.hust.edu.vn', '20207649', '2002-12-07', NULL, 'IT-LTU 02-K65', '1'),
	(191, 'Nguyễn Quang Nhật', 'nhat.nq207696@sis.hust.edu.vn', '20207696', '2002-07-28', NULL, 'IT-VUW 01-K65', '1'),
	(192, 'Nghiêm Minh Hiếu', 'hieu.nm210333@sis.hust.edu.vn', '20210333', '2003-11-25', NULL, 'CTTN-Khoa học máy tính-K66', '1'),
	(193, 'Nguyễn Hoàng Lâm', 'lam.nh210517@sis.hust.edu.vn', '20210517', '2003-02-11', NULL, 'CTTN-Khoa học máy tính-K66', '1'),
	(194, 'Nguyễn Hải Anh', 'anh.nh194725@sis.hust.edu.vn', '20194725', '2001-02-21', NULL, 'ICT 02-K64', '1'),
	(195, 'Nguyễn Quốc Anh', 'anh.nq194726@sis.hust.edu.vn', '20194726', '2001-07-17', NULL, 'ICT 03-K64', '1'),
	(196, 'Shwe Yee Win', 'win.sy23t075@sis.hust.edu.vn', '2023T075', '2000-11-11', NULL, '', '1'),
	(197, 'Trần Minh Huyền', 'huyen.tm215275@sis.hust.edu.vn', '20215275', '2002-03-28', NULL, 'Việt Pháp 01-K66', '1'),
	(198, 'Hoàng Việt Đức', 'duc.hv204950@sis.hust.edu.vn', '20204950', '2002-12-26', NULL, 'Việt Nhật 04-K65', '1'),
	(199, 'Nguyễn Mạnh Linh', 'linh.nm215079@sis.hust.edu.vn', '20215079', '2003-11-27', NULL, 'Việt Nhật 01-K66', '1'),
	(200, 'Nguyễn Hoàng Long', 'long.nh215081@sis.hust.edu.vn', '20215081', '2003-11-03', NULL, 'Việt Nhật 04-K66', '1'),
	(201, 'Trần Bình Minh', 'minh.tb215094@sis.hust.edu.vn', '20215094', '2003-10-09', NULL, 'Việt Nhật 04-K66', '1'),
	(202, 'Đỗ Công Thành', 'thanh.dc194674@sis.hust.edu.vn', '20194674', '2001-12-27', NULL, 'Information Technology Specialist 03-K64', '1');

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
) ENGINE=InnoDB AUTO_INCREMENT=249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qlylichhen.student_teacher: ~41 rows (approximately)
INSERT INTO `student_teacher` (`id`, `student_id`, `teacher_id`) VALUES
	(208, 162, 1),
	(209, 163, 1),
	(210, 164, 1),
	(211, 165, 1),
	(212, 166, 1),
	(213, 167, 1),
	(214, 168, 1),
	(215, 169, 1),
	(216, 170, 1),
	(217, 171, 1),
	(218, 172, 1),
	(219, 173, 1),
	(220, 174, 1),
	(221, 175, 1),
	(222, 176, 1),
	(223, 177, 1),
	(224, 178, 1),
	(225, 179, 1),
	(226, 180, 1),
	(227, 181, 1),
	(228, 182, 1),
	(229, 183, 1),
	(230, 184, 1),
	(231, 185, 1),
	(232, 186, 1),
	(233, 187, 1),
	(234, 188, 1),
	(235, 189, 1),
	(236, 190, 1),
	(237, 191, 1),
	(238, 192, 1),
	(239, 193, 1),
	(240, 194, 1),
	(241, 195, 1),
	(242, 196, 1),
	(243, 197, 1),
	(244, 198, 1),
	(245, 199, 1),
	(246, 200, 1),
	(247, 201, 1),
	(248, 202, 1);

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
	(1, 'Trương Thị Diệu Linh', 'gv1@gmail.com', 'GV001', '1980-01-01', '0123456789', '1'),
	(2, 'Giáo viên test 1', 'gv2@gmail.com', NULL, NULL, NULL, '1'),
	(3, 'Giáo viên test 2', 'gv3@gmail.com', NULL, NULL, NULL, '1');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
