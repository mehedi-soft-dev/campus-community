-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Nov 24, 2026 at 03:45 PM
-- Server version: 8.4.11
-- PHP Version: 8.3.35

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campus-community`
--

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int NOT NULL,
  `question_id` int NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answered_by` int NOT NULL,
  `status` enum('published','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `question_id`, `body`, `answered_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'published', '2026-11-02 18:06:16', '2026-11-02 18:06:16'),
(2, 1, 'Second opinion from another student.', 1, 'removed', '2026-11-02 18:06:16', '2026-11-02 18:06:35'),
(3, 2, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-02 18:07:01', '2026-11-02 18:07:01'),
(4, 2, 'Second opinion from another student.', 1, 'published', '2026-11-02 18:07:01', '2026-11-02 18:07:01'),
(5, 3, 'Take the medical certificate to the registrar within 7 days of the missed exam. They forward it to the department and the course teacher schedules the retake. After 7 days it also needs the dean approval.', 1, 'published', '2026-11-02 18:10:28', '2026-11-02 18:10:28'),
(6, 4, 'The Study Materials section has a past-papers filter, so check there first and ask the department office if a semester is missing.', 1, 'published', '2026-11-02 18:10:28', '2026-11-02 18:10:28'),
(7, 7, 'What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', 3, 'published', '2026-11-02 18:12:00', '2026-11-02 18:12:00'),
(8, 9, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-02 18:15:46', '2026-11-02 18:15:46'),
(9, 9, 'Second opinion from another student.', 1, 'published', '2026-11-02 18:15:46', '2026-11-02 18:15:46'),
(10, 18, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-02 18:28:05', '2026-11-02 18:28:05'),
(11, 18, 'Second opinion from another student.', 1, 'published', '2026-11-02 18:28:05', '2026-11-02 18:28:05'),
(12, 19, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-02 18:32:03', '2026-11-02 18:32:04'),
(13, 19, 'Second opinion from another student.', 1, 'published', '2026-11-02 18:32:03', '2026-11-02 18:32:03'),
(14, 20, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-03 02:10:02', '2026-11-03 02:10:03'),
(15, 20, 'Second opinion from another student.', 1, 'published', '2026-11-03 02:10:03', '2026-11-03 02:10:03'),
(16, 21, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-03 02:58:59', '2026-11-03 02:58:59'),
(17, 21, 'Second opinion from another student.', 1, 'published', '2026-11-03 02:58:59', '2026-11-03 02:58:59'),
(18, 22, 'Yes, this is an answer posted by the probe.', 4, 'published', '2026-11-03 05:57:56', '2026-11-03 05:57:56'),
(19, 23, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-03 06:43:34', '2026-11-03 06:43:36'),
(20, 23, 'Second opinion from another student.', 1, 'published', '2026-11-03 06:43:34', '2026-11-03 06:43:34'),
(21, 24, 'Submit the medical certificate to the registrar within 7 days, then the department schedules a retake.', 4, 'removed', '2026-11-03 10:11:29', '2026-11-03 10:11:31'),
(22, 24, 'Second opinion from another student.', 1, 'published', '2026-11-03 10:11:29', '2026-11-03 10:11:29');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int NOT NULL,
  `actor_id` int DEFAULT NULL,
  `action` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `detail` json DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `detail`, `ip`, `created_at`) VALUES
(1, 2, 'comment.remove', 'comment', 6, '{\"byStaff\": true}', '::1', '2026-11-02 17:21:01'),
(2, 1, 'comment.remove', 'comment', 6, '{\"byStaff\": true}', '::1', '2026-11-02 17:21:01'),
(3, 2, 'comment.edit', 'comment', 7, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:25'),
(4, 1, 'comment.edit', 'comment', 7, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:25'),
(5, 2, 'comment.remove', 'comment', 7, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:26'),
(6, 2, 'comment.edit', 'comment', 8, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:45'),
(7, 1, 'comment.edit', 'comment', 8, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:45'),
(8, 2, 'comment.remove', 'comment', 8, '{\"byStaff\": true}', '::1', '2026-11-02 17:22:45'),
(9, 1, 'department.create', 'department', 5, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 17:55:55'),
(10, 1, 'department.delete', 'department', 5, NULL, '::1', '2026-11-02 17:55:55'),
(11, 2, 'notice.create', 'notice', 5, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 17:55:55'),
(12, 2, 'notice.pin', 'notice', 5, NULL, '::1', '2026-11-02 17:55:55'),
(13, 2, 'notice.archive', 'notice', 5, NULL, '::1', '2026-11-02 17:55:55'),
(14, 2, 'routine.create', 'exam_routine', 2, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 17:55:56'),
(15, 2, 'event.create', 'event', 3, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 17:55:56'),
(16, 2, 'event.archive', 'event', 3, NULL, '::1', '2026-11-02 17:55:56'),
(17, 3, 'material.create', 'material', 2, '{\"title\": \"Notes\"}', '::1', '2026-11-02 17:55:56'),
(18, 2, 'material.remove', 'material', 2, '{\"byStaff\": true}', '::1', '2026-11-02 17:55:56'),
(19, 1, 'comment.remove', 'comment', 10, '{\"byStaff\": false}', '::1', '2026-11-02 17:55:57'),
(20, 1, 'user.active', 'user', 5, '{\"status\": \"active\", \"username\": 5}', '::1', '2026-11-02 17:55:58'),
(21, 1, 'department.create', 'department', 6, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 17:57:44'),
(22, 1, 'department.delete', 'department', 6, NULL, '::1', '2026-11-02 17:57:44'),
(23, 2, 'notice.create', 'notice', 6, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 17:57:44'),
(24, 2, 'notice.pin', 'notice', 6, NULL, '::1', '2026-11-02 17:57:44'),
(25, 2, 'notice.archive', 'notice', 6, NULL, '::1', '2026-11-02 17:57:44'),
(26, 2, 'routine.create', 'exam_routine', 3, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 17:57:45'),
(27, 2, 'event.create', 'event', 4, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 17:57:46'),
(28, 2, 'event.archive', 'event', 4, NULL, '::1', '2026-11-02 17:57:46'),
(29, 3, 'material.create', 'material', 3, '{\"title\": \"Notes\"}', '::1', '2026-11-02 17:57:46'),
(30, 2, 'material.remove', 'material', 3, '{\"byStaff\": true}', '::1', '2026-11-02 17:57:46'),
(31, 1, 'user.active', 'user', 6, '{\"status\": \"active\", \"username\": 6}', '::1', '2026-11-02 17:57:47'),
(32, 1, 'department.create', 'department', 7, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 17:58:21'),
(33, 1, 'department.delete', 'department', 7, NULL, '::1', '2026-11-02 17:58:21'),
(34, 2, 'notice.create', 'notice', 7, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 17:58:21'),
(35, 2, 'notice.pin', 'notice', 7, NULL, '::1', '2026-11-02 17:58:21'),
(36, 2, 'notice.archive', 'notice', 7, NULL, '::1', '2026-11-02 17:58:21'),
(37, 2, 'routine.create', 'exam_routine', 4, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 17:58:23'),
(38, 2, 'event.create', 'event', 5, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 17:58:23'),
(39, 2, 'event.archive', 'event', 5, NULL, '::1', '2026-11-02 17:58:23'),
(40, 3, 'material.create', 'material', 4, '{\"title\": \"Notes\"}', '::1', '2026-11-02 17:58:23'),
(41, 2, 'material.remove', 'material', 4, '{\"byStaff\": true}', '::1', '2026-11-02 17:58:23'),
(42, 1, 'comment.remove', 'comment', 12, '{\"byStaff\": false}', '::1', '2026-11-02 17:58:23'),
(43, 1, 'user.active', 'user', 7, '{\"status\": \"active\", \"username\": 7}', '::1', '2026-11-02 17:58:24'),
(44, 3, 'question.create', 'question', 1, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-02 18:06:15'),
(45, 3, 'question.accept', 'question', 1, '{\"answerId\": 1}', '::1', '2026-11-02 18:06:16'),
(46, 3, 'question.unaccept', 'question', 1, '{\"answerId\": 1}', '::1', '2026-11-02 18:06:16'),
(47, 2, 'question.accept', 'question', 1, '{\"answerId\": 1}', '::1', '2026-11-02 18:06:16'),
(48, 1, 'answer.remove', 'answer', 2, '{\"byStaff\": false, \"questionId\": 1}', '::1', '2026-11-02 18:06:35'),
(49, 1, 'question.remove', 'question', 1, '{\"byStaff\": true}', '::1', '2026-11-02 18:06:35'),
(50, 3, 'question.create', 'question', 2, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-02 18:07:01'),
(51, 3, 'question.accept', 'question', 2, '{\"answerId\": 3}', '::1', '2026-11-02 18:07:01'),
(52, 3, 'question.unaccept', 'question', 2, '{\"answerId\": 3}', '::1', '2026-11-02 18:07:01'),
(53, 2, 'question.accept', 'question', 2, '{\"answerId\": 3}', '::1', '2026-11-02 18:07:01'),
(54, 4, 'answer.remove', 'answer', 3, '{\"byStaff\": false, \"questionId\": 2}', '::1', '2026-11-02 18:07:01'),
(55, 1, 'question.remove', 'question', 2, '{\"byStaff\": true}', '::1', '2026-11-02 18:07:01'),
(56, 3, 'question.create', 'question', 3, '{\"title\": \"How do I register for a midterm retake after missing an exam?\"}', '::1', '2026-11-02 18:10:28'),
(57, 3, 'question.accept', 'question', 3, '{\"answerId\": 5}', '::1', '2026-11-02 18:10:28'),
(58, 4, 'question.create', 'question', 4, '{\"title\": \"Where can I find past question papers for CSE 2101?\"}', '::1', '2026-11-02 18:10:28'),
(59, 3, 'question.create', 'question', 5, '{\"title\": \"Is the library open during the midterm week holidays?\"}', '::1', '2026-11-02 18:10:28'),
(60, 4, 'question.create', 'question', 6, '{\"title\": \"How do I collect my student ID card after uploading the photo?\"}', '::1', '2026-11-02 18:10:28'),
(61, 3, 'question.create', 'question', 7, '{\"title\": \"Lorem Ipsum\"}', '::1', '2026-11-02 18:11:40'),
(62, 3, 'question.create', 'question', 8, '{\"title\": \"Probe question: does the ask form actually work end to end?\"}', '::1', '2026-11-02 18:12:04'),
(63, 3, 'question.remove', 'question', 8, '{\"byStaff\": false}', '::1', '2026-11-02 18:12:05'),
(64, 3, 'question.accept', 'question', 7, '{\"answerId\": 7}', '::1', '2026-11-02 18:12:09'),
(65, 3, 'question.create', 'question', 9, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-02 18:15:46'),
(66, 3, 'question.accept', 'question', 9, '{\"answerId\": 8}', '::1', '2026-11-02 18:15:46'),
(67, 3, 'question.unaccept', 'question', 9, '{\"answerId\": 8}', '::1', '2026-11-02 18:15:46'),
(68, 2, 'question.accept', 'question', 9, '{\"answerId\": 8}', '::1', '2026-11-02 18:15:46'),
(69, 4, 'answer.remove', 'answer', 8, '{\"byStaff\": false, \"questionId\": 9}', '::1', '2026-11-02 18:15:46'),
(70, 1, 'question.remove', 'question', 9, '{\"byStaff\": true}', '::1', '2026-11-02 18:15:47'),
(71, 1, 'department.create', 'department', 8, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 18:15:49'),
(72, 1, 'department.delete', 'department', 8, NULL, '::1', '2026-11-02 18:15:49'),
(73, 2, 'notice.create', 'notice', 8, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 18:15:49'),
(74, 2, 'notice.pin', 'notice', 8, NULL, '::1', '2026-11-02 18:15:49'),
(75, 2, 'notice.archive', 'notice', 8, NULL, '::1', '2026-11-02 18:15:49'),
(76, 2, 'routine.create', 'exam_routine', 5, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 18:15:51'),
(77, 2, 'event.create', 'event', 6, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 18:15:51'),
(78, 2, 'event.archive', 'event', 6, NULL, '::1', '2026-11-02 18:15:51'),
(79, 3, 'material.create', 'material', 5, '{\"title\": \"Notes\"}', '::1', '2026-11-02 18:15:51'),
(80, 2, 'material.remove', 'material', 5, '{\"byStaff\": true}', '::1', '2026-11-02 18:15:51'),
(81, 1, 'comment.remove', 'comment', 14, '{\"byStaff\": false}', '::1', '2026-11-02 18:15:51'),
(82, 1, 'user.active', 'user', 8, '{\"status\": \"active\", \"username\": 8}', '::1', '2026-11-02 18:15:52'),
(83, 1, 'question.create', 'question', 10, '{\"title\": \"Pagination probe question number 1\"}', '::1', '2026-11-02 18:27:09'),
(84, 1, 'question.create', 'question', 11, '{\"title\": \"Pagination probe question number 2\"}', '::1', '2026-11-02 18:27:09'),
(85, 1, 'question.create', 'question', 12, '{\"title\": \"Pagination probe question number 3\"}', '::1', '2026-11-02 18:27:09'),
(86, 1, 'question.create', 'question', 13, '{\"title\": \"Pagination probe question number 4\"}', '::1', '2026-11-02 18:27:09'),
(87, 1, 'question.create', 'question', 14, '{\"title\": \"Pagination probe question number 5\"}', '::1', '2026-11-02 18:27:09'),
(88, 1, 'question.create', 'question', 15, '{\"title\": \"Pagination probe question number 6\"}', '::1', '2026-11-02 18:27:09'),
(89, 1, 'question.create', 'question', 16, '{\"title\": \"Pagination probe question number 7\"}', '::1', '2026-11-02 18:27:09'),
(90, 1, 'question.create', 'question', 17, '{\"title\": \"Pagination probe question number 8\"}', '::1', '2026-11-02 18:27:09'),
(91, 1, 'question.remove', 'question', 10, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(92, 1, 'question.remove', 'question', 11, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(93, 1, 'question.remove', 'question', 12, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(94, 1, 'question.remove', 'question', 13, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(95, 1, 'question.remove', 'question', 14, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(96, 1, 'question.remove', 'question', 15, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(97, 1, 'question.remove', 'question', 16, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(98, 1, 'question.remove', 'question', 17, '{\"byStaff\": false}', '::1', '2026-11-02 18:27:16'),
(99, 3, 'question.create', 'question', 18, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-02 18:28:05'),
(100, 3, 'question.accept', 'question', 18, '{\"answerId\": 10}', '::1', '2026-11-02 18:28:05'),
(101, 3, 'question.unaccept', 'question', 18, '{\"answerId\": 10}', '::1', '2026-11-02 18:28:05'),
(102, 2, 'question.accept', 'question', 18, '{\"answerId\": 10}', '::1', '2026-11-02 18:28:05'),
(103, 4, 'answer.remove', 'answer', 10, '{\"byStaff\": false, \"questionId\": 18}', '::1', '2026-11-02 18:28:05'),
(104, 1, 'question.remove', 'question', 18, '{\"byStaff\": true}', '::1', '2026-11-02 18:28:06'),
(105, 1, 'department.create', 'department', 9, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 18:28:08'),
(106, 1, 'department.delete', 'department', 9, NULL, '::1', '2026-11-02 18:28:08'),
(107, 2, 'notice.create', 'notice', 9, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 18:28:08'),
(108, 2, 'notice.pin', 'notice', 9, NULL, '::1', '2026-11-02 18:28:08'),
(109, 2, 'notice.archive', 'notice', 9, NULL, '::1', '2026-11-02 18:28:09'),
(110, 2, 'routine.create', 'exam_routine', 6, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 18:28:10'),
(111, 2, 'event.create', 'event', 7, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 18:28:10'),
(112, 2, 'event.archive', 'event', 7, NULL, '::1', '2026-11-02 18:28:10'),
(113, 3, 'material.create', 'material', 6, '{\"title\": \"Notes\"}', '::1', '2026-11-02 18:28:10'),
(114, 2, 'material.remove', 'material', 6, '{\"byStaff\": true}', '::1', '2026-11-02 18:28:10'),
(115, 1, 'comment.remove', 'comment', 16, '{\"byStaff\": false}', '::1', '2026-11-02 18:28:10'),
(116, 1, 'user.active', 'user', 9, '{\"status\": \"active\", \"username\": 9}', '::1', '2026-11-02 18:28:11'),
(117, 3, 'question.create', 'question', 19, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-02 18:32:03'),
(118, 3, 'question.accept', 'question', 19, '{\"answerId\": 12}', '::1', '2026-11-02 18:32:03'),
(119, 3, 'question.unaccept', 'question', 19, '{\"answerId\": 12}', '::1', '2026-11-02 18:32:04'),
(120, 2, 'question.accept', 'question', 19, '{\"answerId\": 12}', '::1', '2026-11-02 18:32:04'),
(121, 4, 'answer.remove', 'answer', 12, '{\"byStaff\": false, \"questionId\": 19}', '::1', '2026-11-02 18:32:04'),
(122, 1, 'question.remove', 'question', 19, '{\"byStaff\": true}', '::1', '2026-11-02 18:32:04'),
(123, 1, 'department.create', 'department', 10, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 18:32:07'),
(124, 1, 'department.delete', 'department', 10, NULL, '::1', '2026-11-02 18:32:07'),
(125, 2, 'notice.create', 'notice', 10, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 18:32:07'),
(126, 2, 'notice.pin', 'notice', 10, NULL, '::1', '2026-11-02 18:32:07'),
(127, 2, 'notice.archive', 'notice', 10, NULL, '::1', '2026-11-02 18:32:07'),
(128, 2, 'routine.create', 'exam_routine', 7, '{\"title\": \"Final routine\"}', '::1', '2026-11-02 18:32:08'),
(129, 2, 'event.create', 'event', 8, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-02 18:32:08'),
(130, 2, 'event.archive', 'event', 8, NULL, '::1', '2026-11-02 18:32:08'),
(131, 3, 'material.create', 'material', 7, '{\"title\": \"Notes\"}', '::1', '2026-11-02 18:32:08'),
(132, 2, 'material.remove', 'material', 7, '{\"byStaff\": true}', '::1', '2026-11-02 18:32:08'),
(133, 1, 'comment.remove', 'comment', 18, '{\"byStaff\": false}', '::1', '2026-11-02 18:32:09'),
(134, 1, 'user.active', 'user', 10, '{\"status\": \"active\", \"username\": 10}', '::1', '2026-11-02 18:32:10'),
(135, 1, 'notice.create', 'notice', 11, '{\"title\": \"Probe notice from the admin form\", \"category\": \"general\"}', '::1', '2026-11-02 18:33:26'),
(136, 1, 'notice.create', 'notice', 12, '{\"title\": \"Direct API probe notice\", \"category\": \"general\"}', '::1', '2026-11-02 18:33:27'),
(137, 1, 'notice.create', 'notice', 13, '{\"title\": \"Probe notice A\", \"category\": \"general\"}', '::1', '2026-11-02 18:34:14'),
(138, 1, 'notice.update', 'notice', 10, NULL, '::1', '2026-11-02 18:34:14'),
(139, 1, 'event.create', 'event', 9, '{\"title\": \"Probe event\", \"startsAt\": \"2027-03-01 04:00:00\"}', '::1', '2026-11-02 18:34:15'),
(140, 1, 'event.update', 'event', 1, NULL, '::1', '2026-11-02 18:34:15'),
(141, 1, 'routine.create', 'exam_routine', 8, '{\"title\": \"Probe exam routine\"}', '::1', '2026-11-02 18:34:16'),
(142, 1, 'material.create', 'material', 8, '{\"title\": \"Probe material\"}', '::1', '2026-11-02 18:34:16'),
(143, 1, 'notice.archive', 'notice', 13, NULL, '::1', '2026-11-02 18:34:17'),
(144, 1, 'event.archive', 'event', 1, NULL, '::1', '2026-11-02 18:34:17'),
(145, 1, 'event.archive', 'event', 9, NULL, '::1', '2026-11-02 18:34:17'),
(146, 1, 'routine.archive', 'exam_routine', 8, NULL, '::1', '2026-11-02 18:34:17'),
(147, 1, 'material.remove', 'material', 8, '{\"byStaff\": false}', '::1', '2026-11-02 18:34:17'),
(148, 1, 'department.create', 'department', 11, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-02 20:38:20'),
(149, 1, 'department.delete', 'department', 11, NULL, '::1', '2026-11-02 20:38:20'),
(150, 2, 'notice.create', 'notice', 14, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-02 20:38:20'),
(151, 2, 'notice.pin', 'notice', 14, NULL, '::1', '2026-11-02 20:38:20'),
(152, 2, 'notice.archive', 'notice', 14, NULL, '::1', '2026-11-02 20:38:21'),
(153, 1, 'department.create', 'department', 12, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-03 02:08:39'),
(154, 1, 'department.delete', 'department', 12, NULL, '::1', '2026-11-03 02:08:39'),
(155, 2, 'notice.create', 'notice', 15, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-03 02:08:40'),
(156, 2, 'notice.pin', 'notice', 15, NULL, '::1', '2026-11-03 02:08:40'),
(157, 2, 'notice.archive', 'notice', 15, NULL, '::1', '2026-11-03 02:08:40'),
(158, 2, 'routine.create', 'exam_routine', 9, '{\"title\": \"Final routine\"}', '::1', '2026-11-03 02:08:42'),
(159, 2, 'routine.archive', 'exam_routine', 9, NULL, '::1', '2026-11-03 02:08:42'),
(160, 2, 'event.create', 'event', 10, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-03 02:08:42'),
(161, 2, 'event.archive', 'event', 10, NULL, '::1', '2026-11-03 02:08:43'),
(162, 3, 'material.create', 'material', 9, '{\"title\": \"Notes\"}', '::1', '2026-11-03 02:08:43'),
(163, 2, 'material.remove', 'material', 9, '{\"byStaff\": true}', '::1', '2026-11-03 02:08:43'),
(164, 1, 'comment.remove', 'comment', 20, '{\"byStaff\": false}', '::1', '2026-11-03 02:08:45'),
(165, 1, 'user.active', 'user', 11, '{\"status\": \"active\", \"username\": 11}', '::1', '2026-11-03 02:08:46'),
(166, 1, 'department.create', 'department', 13, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-03 02:09:33'),
(167, 1, 'department.delete', 'department', 13, NULL, '::1', '2026-11-03 02:09:33'),
(168, 2, 'notice.create', 'notice', 16, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-03 02:09:33'),
(169, 2, 'notice.pin', 'notice', 16, NULL, '::1', '2026-11-03 02:09:34'),
(170, 2, 'notice.archive', 'notice', 16, NULL, '::1', '2026-11-03 02:09:34'),
(171, 2, 'routine.create', 'exam_routine', 10, '{\"title\": \"Final routine\"}', '::1', '2026-11-03 02:09:36'),
(172, 2, 'routine.archive', 'exam_routine', 10, NULL, '::1', '2026-11-03 02:09:36'),
(173, 2, 'event.create', 'event', 11, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-03 02:09:36'),
(174, 2, 'event.archive', 'event', 11, NULL, '::1', '2026-11-03 02:09:37'),
(175, 3, 'material.create', 'material', 10, '{\"title\": \"Notes\"}', '::1', '2026-11-03 02:09:37'),
(176, 2, 'material.remove', 'material', 10, '{\"byStaff\": true}', '::1', '2026-11-03 02:09:38'),
(177, 1, 'comment.remove', 'comment', 22, '{\"byStaff\": false}', '::1', '2026-11-03 02:09:40'),
(178, 1, 'user.active', 'user', 12, '{\"status\": \"active\", \"username\": 12}', '::1', '2026-11-03 02:09:41'),
(179, 3, 'question.create', 'question', 20, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-03 02:10:02'),
(180, 3, 'question.accept', 'question', 20, '{\"answerId\": 14}', '::1', '2026-11-03 02:10:03'),
(181, 3, 'question.unaccept', 'question', 20, '{\"answerId\": 14}', '::1', '2026-11-03 02:10:03'),
(182, 2, 'question.accept', 'question', 20, '{\"answerId\": 14}', '::1', '2026-11-03 02:10:03'),
(183, 4, 'answer.remove', 'answer', 14, '{\"byStaff\": false, \"questionId\": 20}', '::1', '2026-11-03 02:10:03'),
(184, 1, 'question.remove', 'question', 20, '{\"byStaff\": true}', '::1', '2026-11-03 02:10:04'),
(185, 1, 'notice.create', 'notice', 17, '{\"title\": \"Pagination probe notice 1\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:58'),
(186, 1, 'notice.create', 'notice', 18, '{\"title\": \"Pagination probe notice 2\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:58'),
(187, 1, 'notice.create', 'notice', 19, '{\"title\": \"Pagination probe notice 3\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:58'),
(188, 1, 'notice.create', 'notice', 20, '{\"title\": \"Pagination probe notice 4\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(189, 1, 'notice.create', 'notice', 21, '{\"title\": \"Pagination probe notice 5\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(190, 1, 'notice.create', 'notice', 22, '{\"title\": \"Pagination probe notice 6\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(191, 1, 'notice.create', 'notice', 23, '{\"title\": \"Pagination probe notice 7\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(192, 1, 'notice.create', 'notice', 24, '{\"title\": \"Pagination probe notice 8\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(193, 1, 'notice.create', 'notice', 25, '{\"title\": \"Pagination probe notice 9\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(194, 1, 'notice.create', 'notice', 26, '{\"title\": \"Pagination probe notice 10\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(195, 1, 'notice.create', 'notice', 27, '{\"title\": \"Pagination probe notice 11\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(196, 1, 'notice.create', 'notice', 28, '{\"title\": \"Pagination probe notice 12\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(197, 1, 'notice.create', 'notice', 29, '{\"title\": \"Pagination probe notice 13\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(198, 1, 'notice.create', 'notice', 30, '{\"title\": \"Pagination probe notice 14\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(199, 1, 'notice.create', 'notice', 31, '{\"title\": \"Pagination probe notice 15\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(200, 1, 'notice.create', 'notice', 32, '{\"title\": \"Pagination probe notice 16\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(201, 1, 'notice.create', 'notice', 33, '{\"title\": \"Pagination probe notice 17\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(202, 1, 'notice.create', 'notice', 34, '{\"title\": \"Pagination probe notice 18\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(203, 1, 'notice.create', 'notice', 35, '{\"title\": \"Pagination probe notice 19\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(204, 1, 'notice.create', 'notice', 36, '{\"title\": \"Pagination probe notice 20\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(205, 1, 'notice.create', 'notice', 37, '{\"title\": \"Pagination probe notice 21\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(206, 1, 'notice.create', 'notice', 38, '{\"title\": \"Pagination probe notice 22\", \"category\": \"general\"}', '::1', '2026-11-03 02:57:59'),
(207, 1, 'notice.archive', 'notice', 17, NULL, '::1', '2026-11-03 02:57:59'),
(208, 1, 'notice.archive', 'notice', 18, NULL, '::1', '2026-11-03 02:57:59'),
(209, 1, 'notice.archive', 'notice', 19, NULL, '::1', '2026-11-03 02:57:59'),
(210, 1, 'notice.archive', 'notice', 20, NULL, '::1', '2026-11-03 02:57:59'),
(211, 1, 'notice.archive', 'notice', 21, NULL, '::1', '2026-11-03 02:57:59'),
(212, 1, 'notice.archive', 'notice', 22, NULL, '::1', '2026-11-03 02:57:59'),
(213, 1, 'notice.archive', 'notice', 23, NULL, '::1', '2026-11-03 02:57:59'),
(214, 1, 'notice.archive', 'notice', 24, NULL, '::1', '2026-11-03 02:57:59'),
(215, 1, 'notice.archive', 'notice', 25, NULL, '::1', '2026-11-03 02:57:59'),
(216, 1, 'notice.archive', 'notice', 26, NULL, '::1', '2026-11-03 02:57:59'),
(217, 1, 'notice.archive', 'notice', 27, NULL, '::1', '2026-11-03 02:57:59'),
(218, 1, 'notice.archive', 'notice', 28, NULL, '::1', '2026-11-03 02:57:59'),
(219, 1, 'notice.archive', 'notice', 29, NULL, '::1', '2026-11-03 02:57:59'),
(220, 1, 'notice.archive', 'notice', 30, NULL, '::1', '2026-11-03 02:57:59'),
(221, 1, 'notice.archive', 'notice', 31, NULL, '::1', '2026-11-03 02:57:59'),
(222, 1, 'notice.archive', 'notice', 32, NULL, '::1', '2026-11-03 02:57:59'),
(223, 1, 'notice.archive', 'notice', 33, NULL, '::1', '2026-11-03 02:57:59'),
(224, 1, 'notice.archive', 'notice', 34, NULL, '::1', '2026-11-03 02:57:59'),
(225, 1, 'notice.archive', 'notice', 35, NULL, '::1', '2026-11-03 02:58:00'),
(226, 1, 'notice.archive', 'notice', 36, NULL, '::1', '2026-11-03 02:58:00'),
(227, 1, 'notice.archive', 'notice', 37, NULL, '::1', '2026-11-03 02:58:00'),
(228, 1, 'notice.archive', 'notice', 38, NULL, '::1', '2026-11-03 02:58:00'),
(229, 3, 'question.create', 'question', 21, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-03 02:58:58'),
(230, 3, 'question.accept', 'question', 21, '{\"answerId\": 16}', '::1', '2026-11-03 02:58:59'),
(231, 3, 'question.unaccept', 'question', 21, '{\"answerId\": 16}', '::1', '2026-11-03 02:58:59'),
(232, 2, 'question.accept', 'question', 21, '{\"answerId\": 16}', '::1', '2026-11-03 02:58:59'),
(233, 4, 'answer.remove', 'answer', 16, '{\"byStaff\": false, \"questionId\": 21}', '::1', '2026-11-03 02:59:00'),
(234, 1, 'question.remove', 'question', 21, '{\"byStaff\": true}', '::1', '2026-11-03 02:59:00'),
(235, 1, 'department.create', 'department', 14, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-03 02:59:03'),
(236, 1, 'department.delete', 'department', 14, NULL, '::1', '2026-11-03 02:59:03'),
(237, 2, 'notice.create', 'notice', 39, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-03 02:59:04'),
(238, 2, 'notice.pin', 'notice', 39, NULL, '::1', '2026-11-03 02:59:04'),
(239, 2, 'notice.archive', 'notice', 39, NULL, '::1', '2026-11-03 02:59:04'),
(240, 2, 'routine.create', 'exam_routine', 11, '{\"title\": \"Final routine\"}', '::1', '2026-11-03 02:59:05'),
(241, 2, 'routine.archive', 'exam_routine', 11, NULL, '::1', '2026-11-03 02:59:05'),
(242, 2, 'event.create', 'event', 12, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-03 02:59:06'),
(243, 2, 'event.archive', 'event', 12, NULL, '::1', '2026-11-03 02:59:06'),
(244, 3, 'material.create', 'material', 11, '{\"title\": \"Notes\"}', '::1', '2026-11-03 02:59:06'),
(245, 2, 'material.remove', 'material', 11, '{\"byStaff\": true}', '::1', '2026-11-03 02:59:07'),
(246, 1, 'comment.remove', 'comment', 24, '{\"byStaff\": false}', '::1', '2026-11-03 02:59:08'),
(247, 1, 'user.active', 'user', 13, '{\"status\": \"active\", \"username\": 13}', '::1', '2026-11-03 02:59:10'),
(248, 3, 'question.create', 'question', 22, '{\"title\": \"Does posting an answer work right now?\"}', '::1', '2026-11-03 05:57:56'),
(249, 3, 'question.accept', 'question', 22, '{\"answerId\": 18}', '::1', '2026-11-03 05:57:56'),
(250, 1, 'question.remove', 'question', 22, '{\"byStaff\": true}', '::1', '2026-11-03 05:57:56'),
(251, 3, 'question.create', 'question', 23, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-03 06:43:34'),
(252, 3, 'question.accept', 'question', 23, '{\"answerId\": 19}', '::1', '2026-11-03 06:43:35'),
(253, 3, 'question.unaccept', 'question', 23, '{\"answerId\": 19}', '::1', '2026-11-03 06:43:35'),
(254, 2, 'question.accept', 'question', 23, '{\"answerId\": 19}', '::1', '2026-11-03 06:43:35'),
(255, 4, 'answer.remove', 'answer', 19, '{\"byStaff\": false, \"questionId\": 23}', '::1', '2026-11-03 06:43:36'),
(256, 1, 'question.remove', 'question', 23, '{\"byStaff\": true}', '::1', '2026-11-03 06:43:36'),
(257, 1, 'department.create', 'department', 15, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-03 06:43:42'),
(258, 1, 'department.delete', 'department', 15, NULL, '::1', '2026-11-03 06:43:43'),
(259, 2, 'notice.create', 'notice', 40, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-03 06:43:43'),
(260, 2, 'notice.pin', 'notice', 40, NULL, '::1', '2026-11-03 06:43:43'),
(261, 2, 'notice.archive', 'notice', 40, NULL, '::1', '2026-11-03 06:43:43'),
(262, 2, 'routine.create', 'exam_routine', 12, '{\"title\": \"Final routine\"}', '::1', '2026-11-03 06:43:44'),
(263, 2, 'routine.archive', 'exam_routine', 12, NULL, '::1', '2026-11-03 06:43:45'),
(264, 2, 'event.create', 'event', 13, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-03 06:43:45'),
(265, 2, 'event.archive', 'event', 13, NULL, '::1', '2026-11-03 06:43:45'),
(266, 3, 'material.create', 'material', 12, '{\"title\": \"Notes\"}', '::1', '2026-11-03 06:43:45'),
(267, 2, 'material.remove', 'material', 12, '{\"byStaff\": true}', '::1', '2026-11-03 06:43:45'),
(268, 1, 'comment.remove', 'comment', 26, '{\"byStaff\": false}', '::1', '2026-11-03 06:43:46'),
(269, 1, 'user.active', 'user', 14, '{\"status\": \"active\", \"username\": 14}', '::1', '2026-11-03 06:43:48'),
(270, 1, 'notice.create', 'notice', 41, '{\"title\": \"TEST NOTICE\", \"category\": \"general\"}', '::1', '2026-11-03 06:47:57'),
(271, 3, 'question.create', 'question', 24, '{\"title\": \"How do I register for the midterm retake?\"}', '::1', '2026-11-03 10:11:28'),
(272, 3, 'question.accept', 'question', 24, '{\"answerId\": 21}', '::1', '2026-11-03 10:11:30'),
(273, 3, 'question.unaccept', 'question', 24, '{\"answerId\": 21}', '::1', '2026-11-03 10:11:30'),
(274, 2, 'question.accept', 'question', 24, '{\"answerId\": 21}', '::1', '2026-11-03 10:11:31'),
(275, 4, 'answer.remove', 'answer', 21, '{\"byStaff\": false, \"questionId\": 24}', '::1', '2026-11-03 10:11:31'),
(276, 1, 'question.remove', 'question', 24, '{\"byStaff\": true}', '::1', '2026-11-03 10:11:32'),
(277, 1, 'department.create', 'department', 16, '{\"code\": \"ZZZ\", \"name\": \"Temp Dept\"}', '::1', '2026-11-03 10:11:48'),
(278, 1, 'department.delete', 'department', 16, NULL, '::1', '2026-11-03 10:11:49'),
(279, 2, 'notice.create', 'notice', 42, '{\"title\": \"Smoke notice\", \"category\": \"exam\"}', '::1', '2026-11-03 10:11:49'),
(280, 2, 'notice.pin', 'notice', 42, NULL, '::1', '2026-11-03 10:11:49'),
(281, 2, 'notice.archive', 'notice', 42, NULL, '::1', '2026-11-03 10:11:50'),
(282, 2, 'routine.create', 'exam_routine', 13, '{\"title\": \"Final routine\"}', '::1', '2026-11-03 10:11:51'),
(283, 2, 'routine.archive', 'exam_routine', 13, NULL, '::1', '2026-11-03 10:11:52'),
(284, 2, 'event.create', 'event', 14, '{\"title\": \"Smoke event\", \"startsAt\": \"2026-12-01 10:00:00\"}', '::1', '2026-11-03 10:11:52'),
(285, 2, 'event.archive', 'event', 14, NULL, '::1', '2026-11-03 10:11:52'),
(286, 3, 'material.create', 'material', 13, '{\"title\": \"Notes\"}', '::1', '2026-11-03 10:11:52'),
(287, 2, 'material.remove', 'material', 13, '{\"byStaff\": true}', '::1', '2026-11-03 10:11:53'),
(288, 1, 'comment.remove', 'comment', 28, '{\"byStaff\": false}', '::1', '2026-11-03 10:11:54'),
(289, 1, 'user.active', 'user', 15, '{\"status\": \"active\", \"username\": 15}', '::1', '2026-11-03 10:11:56');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `code` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accent_hue` smallint NOT NULL DEFAULT '220',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `code`, `name`, `slug`, `description`, `banner_img`, `accent_hue`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'art', 'Art', 'art', 'Creative work, photography and visual culture', NULL, 340, 10, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(2, 'science', 'Science', 'science', 'Research, discoveries and how things work', NULL, 210, 20, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(3, 'technology', 'Technology', 'technology', 'Software, hardware and engineering', NULL, 265, 30, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(4, 'cinema', 'Cinema', 'cinema', 'Film, series and reviews', NULL, 28, 40, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(5, 'design', 'Design', 'design', 'Interfaces, typography and product thinking', NULL, 168, 50, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(6, 'food', 'Food', 'food', 'Campus food, recipes and reviews', NULL, 96, 60, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27'),
(7, 'general', 'General', 'general', 'Anything that does not fit another category', NULL, 220, 99, 1, '2026-11-02 06:15:27', '2026-11-02 06:15:27');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('visible','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'visible',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `parent_id`, `body`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 4, NULL, 'The twelve-frames point is what finally sold me on shooting film.', 'visible', '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(2, 1, 3, 1, 'Same — it makes every frame a decision.', 'visible', '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(3, 1, 2, NULL, 'Adding this to the reading list for next term.', 'visible', '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(4, 3, 3, NULL, 'This is test comment', 'visible', '2026-11-02 12:23:29', '2026-11-02 12:23:29'),
(5, 3, 3, 4, 'this is reply', 'visible', '2026-11-02 12:23:39', '2026-11-02 12:23:39'),
(6, 9, 4, NULL, 'too late', 'removed', '2026-11-02 17:21:01', '2026-11-02 17:21:01'),
(7, 10, 4, NULL, 'staff edited this', 'removed', '2026-11-02 17:22:25', '2026-11-02 17:22:26'),
(8, 11, 4, NULL, 'staff edited this', 'removed', '2026-11-02 17:22:45', '2026-11-02 17:22:45'),
(9, 2, 3, NULL, 'Great post', 'visible', '2026-11-02 17:55:56', '2026-11-02 17:55:56'),
(10, 2, 1, 9, 'A reply', 'removed', '2026-11-02 17:55:56', '2026-11-02 17:55:57'),
(11, 17, 3, NULL, 'Great post', 'visible', '2026-11-02 17:58:23', '2026-11-02 17:58:23'),
(12, 17, 1, 11, 'A reply', 'removed', '2026-11-02 17:58:23', '2026-11-02 17:58:23'),
(13, 18, 3, NULL, 'Great post', 'visible', '2026-11-02 18:15:51', '2026-11-02 18:15:51'),
(14, 18, 1, 13, 'A reply', 'removed', '2026-11-02 18:15:51', '2026-11-02 18:15:51'),
(15, 19, 3, NULL, 'Great post', 'visible', '2026-11-02 18:28:10', '2026-11-02 18:28:10'),
(16, 19, 1, 15, 'A reply', 'removed', '2026-11-02 18:28:10', '2026-11-02 18:28:10'),
(17, 20, 3, NULL, 'Great post', 'visible', '2026-11-02 18:32:09', '2026-11-02 18:32:09'),
(18, 20, 1, 17, 'A reply', 'removed', '2026-11-02 18:32:09', '2026-11-02 18:32:09'),
(19, 21, 3, NULL, 'Great post', 'visible', '2026-11-03 02:08:44', '2026-11-03 02:08:44'),
(20, 21, 1, 19, 'A reply', 'removed', '2026-11-03 02:08:44', '2026-11-03 02:08:45'),
(21, 22, 3, NULL, 'Great post', 'visible', '2026-11-03 02:09:39', '2026-11-03 02:09:39'),
(22, 22, 1, 21, 'A reply', 'removed', '2026-11-03 02:09:39', '2026-11-03 02:09:40'),
(23, 23, 3, NULL, 'Great post', 'visible', '2026-11-03 02:59:08', '2026-11-03 02:59:08'),
(24, 23, 1, 23, 'A reply', 'removed', '2026-11-03 02:59:08', '2026-11-03 02:59:08'),
(25, 24, 3, NULL, 'Great post', 'visible', '2026-11-03 06:43:46', '2026-11-03 06:43:46'),
(26, 24, 1, 25, 'A reply', 'removed', '2026-11-03 06:43:46', '2026-11-03 06:43:46'),
(27, 25, 3, NULL, 'Great post', 'visible', '2026-11-03 10:11:54', '2026-11-03 10:11:54'),
(28, 25, 1, 27, 'A reply', 'removed', '2026-11-03 10:11:54', '2026-11-03 10:11:54');

-- --------------------------------------------------------

--
-- Table structure for table `comment_votes`
--

CREATE TABLE `comment_votes` (
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `value` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `comment_votes`
--

INSERT INTO `comment_votes` (`comment_id`, `user_id`, `value`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(3, 3, 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `faculty` varchar(140) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `faculty`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'CSE', 'Computer Science & Engineering', 'Faculty of Science & Technology', 10, 1, '2026-11-02 06:15:28'),
(2, 'EEE', 'Electrical & Electronic Engineering', 'Faculty of Science & Technology', 20, 1, '2026-11-02 06:15:28'),
(3, 'BBA', 'Business Administration', 'Faculty of Business', 30, 1, '2026-11-02 06:15:28'),
(4, 'ENG', 'English', 'Faculty of Arts', 40, 1, '2026-11-02 06:15:28');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `all_day` tinyint(1) NOT NULL DEFAULT '0',
  `location` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `kind` enum('event','holiday','exam_week','deadline','registration','result') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'event',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `starts_at`, `ends_at`, `all_day`, `location`, `department_id`, `kind`, `is_featured`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'Sample calendar entry — midterm week', 'Seeded demo entry showing how exam weeks appear on the academic calendar.', '2026-11-30 06:15:30', NULL, 0, NULL, NULL, 'exam_week', 0, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(10, 'Smoke event', NULL, '2026-12-01 10:00:00', NULL, 0, 'Hall', NULL, 'event', 0, 'archived', 2, '2026-11-03 02:08:42', '2026-11-03 02:08:43'),
(11, 'Smoke event', NULL, '2026-12-01 10:00:00', NULL, 0, 'Hall', NULL, 'event', 0, 'archived', 2, '2026-11-03 02:09:36', '2026-11-03 02:09:37'),
(12, 'Smoke event', NULL, '2026-12-01 10:00:00', NULL, 0, 'Hall', NULL, 'event', 0, 'archived', 2, '2026-11-03 02:59:06', '2026-11-03 02:59:06'),
(13, 'Smoke event', NULL, '2026-12-01 10:00:00', NULL, 0, 'Hall', NULL, 'event', 0, 'archived', 2, '2026-11-03 06:43:45', '2026-11-03 06:43:45'),
(14, 'Smoke event', NULL, '2026-12-01 10:00:00', NULL, 0, 'Hall', NULL, 'event', 0, 'archived', 2, '2026-11-03 10:11:52', '2026-11-03 10:11:52');

-- --------------------------------------------------------

--
-- Table structure for table `exam_routines`
--

CREATE TABLE `exam_routines` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `semester` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exam_type` enum('midterm','final','quiz','practical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'final',
  `file_id` int NOT NULL,
  `effective_from` date DEFAULT NULL,
  `notes` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_routines`
--

INSERT INTO `exam_routines` (`id`, `title`, `department_id`, `semester`, `exam_type`, `file_id`, `effective_from`, `notes`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Sample exam routine — Spring 2026', NULL, 'Spring 2026', 'final', 1, '2026-11-16', NULL, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(9, 'Final routine', NULL, 'Spring 2026', 'final', 17, NULL, NULL, 'archived', 2, '2026-11-03 02:08:42', '2026-11-03 02:08:42'),
(10, 'Final routine', NULL, 'Spring 2026', 'final', 18, NULL, NULL, 'archived', 2, '2026-11-03 02:09:36', '2026-11-03 02:09:36'),
(11, 'Final routine', NULL, 'Spring 2026', 'final', 19, NULL, NULL, 'archived', 2, '2026-11-03 02:59:05', '2026-11-03 02:59:05'),
(12, 'Final routine', NULL, 'Spring 2026', 'final', 20, NULL, NULL, 'archived', 2, '2026-11-03 06:43:44', '2026-11-03 06:43:45'),
(13, 'Final routine', NULL, 'Spring 2026', 'final', 22, NULL, NULL, 'archived', 2, '2026-11-03 10:11:51', '2026-11-03 10:11:52');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` int NOT NULL,
  `kind` enum('image','document') COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `filename`, `original_name`, `mime_type`, `size_bytes`, `kind`, `uploaded_by`, `created_at`) VALUES
(1, 'seed-exam-routine.pdf', 'exam-routine-sample.pdf', 'application/pdf', 426, 'document', 1, '2026-11-02 06:15:30'),
(2, 'seed-class-notes.pdf', 'class-notes-sample.pdf', 'application/pdf', 426, 'document', 4, '2026-11-02 06:15:30'),
(8, '1793641932761-5bdd341c0958-images.jpg', 'images.jpg', 'image/jpeg', 43500, 'image', 3, '2026-11-02 17:52:12'),
(17, '1793671722345-ae69bfe23433-smoke-routine.pdf', 'smoke-routine.pdf', 'application/pdf', 70, 'document', 1, '2026-11-03 02:08:42'),
(18, '1793671776034-6184feb793f4-smoke-routine.pdf', 'smoke-routine.pdf', 'application/pdf', 70, 'document', 1, '2026-11-03 02:09:36'),
(19, '1793674745582-78229374cf9f-smoke-routine.pdf', 'smoke-routine.pdf', 'application/pdf', 70, 'document', 1, '2026-11-03 02:59:05'),
(20, '1793688224623-6ef7226a6201-smoke-routine.pdf', 'smoke-routine.pdf', 'application/pdf', 70, 'document', 1, '2026-11-03 06:43:44'),
(21, '1793688475366-d703e157fc1f-campus.png', 'campus.png', 'image/png', 2348402, 'image', 1, '2026-11-03 06:47:55'),
(22, '1793700711758-46f4ba934f97-smoke-routine.pdf', 'smoke-routine.pdf', 'application/pdf', 70, 'document', 1, '2026-11-03 10:11:51');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `semester` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_type` enum('notes','slides','past_paper','syllabus','reference','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'notes',
  `file_id` int NOT NULL,
  `download_count` int NOT NULL DEFAULT '0',
  `uploaded_by` int NOT NULL,
  `status` enum('published','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `title`, `description`, `course_code`, `department_id`, `semester`, `material_type`, `file_id`, `download_count`, `uploaded_by`, `status`, `created_at`) VALUES
(1, 'Sample class notes — CSE 2101', 'Sample notes document.', 'CSE 2101', 1, 'Spring 2026', 'notes', 2, 1, 4, 'published', '2026-11-02 06:15:30'),
(9, 'Notes', NULL, NULL, NULL, NULL, 'notes', 17, 1, 3, 'removed', '2026-11-03 02:08:43'),
(10, 'Notes', NULL, NULL, NULL, NULL, 'notes', 18, 1, 3, 'removed', '2026-11-03 02:09:37'),
(11, 'Notes', NULL, NULL, NULL, NULL, 'notes', 19, 1, 3, 'removed', '2026-11-03 02:59:06'),
(12, 'Notes', NULL, NULL, NULL, NULL, 'notes', 20, 1, 3, 'removed', '2026-11-03 06:43:45'),
(13, 'Notes', NULL, NULL, NULL, NULL, 'notes', 22, 1, 3, 'removed', '2026-11-03 10:11:52');

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('general','exam','admission','result','event','scholarship') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `priority` enum('normal','important','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `attachment_id` int DEFAULT NULL,
  `publish_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `author_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`id`, `title`, `body`, `category`, `priority`, `is_pinned`, `attachment_id`, `publish_at`, `expires_at`, `status`, `author_id`, `created_at`, `updated_at`) VALUES
(1, 'Sample notice — how the notice board works', 'This is seeded demo content, not a real announcement. Staff accounts (admin and moderator) publish official notices here, pin the important ones, and they disappear automatically once their expiry date passes.', 'general', 'normal', 1, NULL, '2026-11-02 06:15:30', NULL, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(2, 'Sample notice — exam section', 'Seeded example of an exam-category notice. Replace it with a real one from the admin area; this row exists so the board has something to show on a fresh install.', 'exam', 'important', 0, NULL, '2026-11-02 06:15:30', NULL, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(3, 'Sample notice — library opening hours', 'Pluralised demo content so the notice board and the home panel have enough rows to show their real layout. Delete these once real announcements are published.', 'general', 'normal', 0, NULL, '2026-11-02 06:15:30', NULL, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(4, 'Sample notice — scholarship applications', 'Another seeded example, this time in the scholarship category with normal priority.', 'scholarship', 'urgent', 0, NULL, '2026-11-02 06:15:30', NULL, 'published', 1, '2026-11-02 06:15:30', '2026-11-02 06:15:30'),
(14, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-02 20:38:20', NULL, 'archived', 2, '2026-11-02 20:38:20', '2026-11-02 20:38:21'),
(15, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-03 02:08:40', NULL, 'archived', 2, '2026-11-03 02:08:40', '2026-11-03 02:08:40'),
(16, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-03 02:09:33', NULL, 'archived', 2, '2026-11-03 02:09:33', '2026-11-03 02:09:34'),
(17, 'Pagination probe notice 1', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:58', NULL, 'archived', 1, '2026-11-03 02:57:58', '2026-11-03 02:57:59'),
(18, 'Pagination probe notice 2', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:58', NULL, 'archived', 1, '2026-11-03 02:57:58', '2026-11-03 02:57:59'),
(19, 'Pagination probe notice 3', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:58', NULL, 'archived', 1, '2026-11-03 02:57:58', '2026-11-03 02:57:59'),
(20, 'Pagination probe notice 4', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:58', NULL, 'archived', 1, '2026-11-03 02:57:58', '2026-11-03 02:57:59'),
(21, 'Pagination probe notice 5', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(22, 'Pagination probe notice 6', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(23, 'Pagination probe notice 7', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(24, 'Pagination probe notice 8', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(25, 'Pagination probe notice 9', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(26, 'Pagination probe notice 10', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(27, 'Pagination probe notice 11', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(28, 'Pagination probe notice 12', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(29, 'Pagination probe notice 13', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(30, 'Pagination probe notice 14', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(31, 'Pagination probe notice 15', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(32, 'Pagination probe notice 16', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(33, 'Pagination probe notice 17', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(34, 'Pagination probe notice 18', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(35, 'Pagination probe notice 19', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:57:59'),
(36, 'Pagination probe notice 20', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:58:00'),
(37, 'Pagination probe notice 21', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:58:00'),
(38, 'Pagination probe notice 22', 'Temporary row created by a probe so the pager has more than one page.', 'general', 'normal', 0, NULL, '2026-11-03 02:57:59', NULL, 'archived', 1, '2026-11-03 02:57:59', '2026-11-03 02:58:00'),
(39, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-03 02:59:04', NULL, 'archived', 2, '2026-11-03 02:59:04', '2026-11-03 02:59:04'),
(40, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-03 06:43:43', NULL, 'archived', 2, '2026-11-03 06:43:43', '2026-11-03 06:43:43'),
(41, 'TEST NOTICE', 'LOREM IPSUM', 'general', 'normal', 1, 21, '2026-11-03 06:47:00', '2026-11-25 06:47:00', 'published', 1, '2026-11-03 06:47:57', '2026-11-03 06:47:57'),
(42, 'Smoke notice', 'Body text', 'exam', 'urgent', 1, NULL, '2026-11-03 10:11:49', NULL, 'archived', 2, '2026-11-03 10:11:49', '2026-11-03 10:11:50');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `desc` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int NOT NULL,
  `status` enum('draft','published','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `views` int NOT NULL DEFAULT '0',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `desc`, `img`, `category_id`, `status`, `views`, `date`, `updated_at`, `uid`) VALUES
(1, 'The Quiet Craft of Analog Photography', '<p>Working with film means giving up the instant feedback we have come to expect from a screen. Every exposure is a guess, informed by experience and a light meter you have to trust.</p><h2>Why bother with the wait</h2><p>The delay between pressing the shutter and holding the print is the whole point. It forces you to commit to a shot rather than take forty and hope.</p><ul><li>Twelve frames per roll makes each one deliberate</li><li>Grain reads as texture, not noise</li><li>No preview means no second-guessing</li></ul><p>The result is a slower, more attentive way of seeing.</p>', NULL, 1, 'published', 49, '2026-11-01 06:15:29', '2026-11-03 02:10:12', 3),
(2, 'How CRISPR Rewrote the Rules of Biology', '<p>For decades, editing a genome meant expensive, imprecise work. CRISPR turned it into something closer to find-and-replace.</p><h2>A bacterial defence system, repurposed</h2><p>The machinery evolved to cut up viral DNA. Guide it with a short RNA sequence and it will cut wherever you like.</p><blockquote>The precision is not in the enzyme. It is in the guide.</blockquote><p>That single insight is why labs around the world adopted it within a few years.</p>', NULL, 2, 'published', 1, '2026-10-30 06:15:29', '2026-11-04 06:57:25', 4),
(3, 'Why Your Next Laptop Might Not Have a Fan', '<p>Fanless laptops used to mean slow laptops. That trade-off is disappearing, and the reason is less about raw speed than about heat density.</p><h2>The efficiency plateau</h2><p>Each generation of chip does the same work with less power. Less power means less heat, and less heat means you can pass it through the chassis instead of blowing it out the side.</p><p>The catch is sustained load: burst performance looks great on a spec sheet, but a thin chassis still throttles under a long export.</p>', NULL, 3, 'published', 8, '2026-10-28 06:15:29', '2026-11-02 17:20:51', 3),
(4, 'The Long Take That Changed Cinema', '<p>A single unbroken shot can do something a cut cannot: it refuses to let you look away.</p><h2>Duration as pressure</h2><p>Editing controls time. Remove the edit and the audience loses their sense of how long a scene is allowed to last. That uncertainty is the point.</p><ul><li>No cut means no relief</li><li>The camera\'s movement becomes the pacing</li><li>Mistakes are unrecoverable</li></ul>', NULL, 4, 'published', 0, '2026-10-25 06:15:29', '2026-11-02 06:15:29', 4),
(5, 'Designing Interfaces People Actually Trust', '<p>Trust is rarely earned by a large feature. It is earned by small consistencies repeated until the user stops checking.</p><h2>Predictability over delight</h2><p>A button that behaves the same way every time is worth more than one that surprises you. Delight is a bonus; predictability is a baseline.</p><p>Show state clearly, confirm destructive actions, and never move something the user is about to click.</p>', NULL, 5, 'published', 0, '2026-10-21 06:15:29', '2026-11-02 06:15:29', 3),
(6, 'A Week of Cooking From One Pantry', '<p>The constraint is the recipe. With a fixed shelf of ingredients, the interesting decisions move from \"what should I buy\" to \"what does this become\".</p><h2>The base three</h2><p>Almost everything here starts as one of three things: a sofrito, a broth, or a dressing. Change the aromatics and the same technique reads as a different cuisine.</p><ul><li>Beans, tinned tomatoes, onions</li><li>Rice, pasta, stale bread</li><li>Oil, vinegar, salt, and something acidic</li></ul>', NULL, 6, 'published', 0, '2026-10-17 06:15:29', '2026-11-02 06:15:29', 4),
(7, 'The Sound Engineers Behind Live Music', '<p>What sounds effortless from the audience is a mix built and rebuilt all night, one room at a time.</p><h2>Every venue is a different instrument</h2><p>Concrete reflects, curtains absorb, and a full room behaves nothing like an empty one. The mix you sound-checked is already wrong by the first chorus.</p>', NULL, 3, 'published', 1, '2026-10-12 06:15:29', '2026-11-04 03:14:24', 3),
(8, 'Restoring a Fresco, Micrometer by Micrometer', '<p>Restoration is mostly restraint. The instinct to make something look new again is precisely the instinct that ruins it.</p><h2>Reversible by design</h2><p>Every material added must be removable decades later without harming the original. That rule shapes the chemistry more than aesthetics does.</p><p>Cleaning a square metre can take weeks, and the goal is not the painter\'s intention — it is whatever survives, shown honestly.</p>', NULL, 1, 'published', 0, '2026-10-06 06:15:29', '2026-11-02 06:15:29', 4),
(9, 'Comment auth probe', '<p>temporary</p>', NULL, 1, 'removed', 0, '2026-11-02 17:21:01', '2026-11-02 17:21:02', 3),
(10, 'Comment auth probe', '<p>temporary</p>', NULL, 1, 'removed', 0, '2026-11-02 17:22:25', '2026-11-02 17:22:26', 3),
(11, 'Comment auth probe', '<p>temporary</p>', NULL, 1, 'removed', 0, '2026-11-02 17:22:45', '2026-11-02 17:22:45', 3),
(12, 'Crop probe 1', '<p>temporary probe post for banner cropping</p>', '1793640726585-b4974da6330f-test-wide.png', 1, 'removed', 0, '2026-11-02 17:31:42', '2026-11-02 17:35:17', 1),
(13, 'Crop probe 2', '<p>temporary probe post for banner cropping</p>', '1793640726780-467d8aa895fa-test-tall.png', 1, 'removed', 0, '2026-11-02 17:31:42', '2026-11-02 17:35:17', 1),
(14, 'Crop probe 3', '<p>temporary probe post for banner cropping</p>', '1793640726585-b4974da6330f-test-wide.png', 1, 'removed', 0, '2026-11-02 17:31:42', '2026-11-02 17:35:17', 1),
(15, 'Crop probe 4', '<p>temporary probe post for banner cropping</p>', '1793640726780-467d8aa895fa-test-tall.png', 1, 'removed', 0, '2026-11-02 17:31:42', '2026-11-02 17:35:17', 1),
(16, 'Lorem Ipsum', '<h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.</p><p><br /></p><h2>Why do we use it?</h2><p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p><p><br /></p>', '1793641932761-5bdd341c0958-images.jpg', 1, 'published', 18, '2026-11-02 17:52:25', '2026-11-02 18:27:36', 3),
(17, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-02 17:58:23', '2026-11-02 17:58:25', 2),
(18, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-02 18:15:51', '2026-11-02 18:15:53', 2),
(19, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-02 18:28:10', '2026-11-02 18:28:12', 2),
(20, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-02 18:32:08', '2026-11-02 18:32:11', 2),
(21, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-03 02:08:44', '2026-11-03 02:08:47', 2),
(22, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-03 02:09:38', '2026-11-03 02:09:43', 2),
(23, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-03 02:59:07', '2026-11-03 02:59:12', 2),
(24, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-03 06:43:46', '2026-11-03 06:43:49', 2),
(25, 'Rating probe', '<p>probe</p>', NULL, 1, 'removed', 0, '2026-11-03 10:11:53', '2026-11-03 10:11:58', 2);

-- --------------------------------------------------------

--
-- Table structure for table `post_ratings`
--

CREATE TABLE `post_ratings` (
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `value` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `post_ratings`
--

INSERT INTO `post_ratings` (`post_id`, `user_id`, `value`, `created_at`, `updated_at`) VALUES
(1, 1, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(1, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(1, 4, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(2, 1, 3, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(2, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(2, 3, 4, '2026-11-02 17:57:41', '2026-11-02 17:57:41'),
(3, 1, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(3, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(3, 4, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(4, 1, 3, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(4, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(4, 3, 2, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(5, 1, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(5, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(5, 4, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(6, 1, 3, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(6, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(6, 3, 2, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(7, 1, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(7, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(7, 4, 5, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(8, 1, 3, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(8, 2, 4, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(8, 3, 2, '2026-11-02 06:15:29', '2026-11-02 06:15:29'),
(16, 1, 5, '2026-11-02 18:27:04', '2026-11-02 18:27:04');

-- --------------------------------------------------------

--
-- Table structure for table `post_views`
--

CREATE TABLE `post_views` (
  `post_id` int NOT NULL,
  `visitor_key` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_views`
--

INSERT INTO `post_views` (`post_id`, `visitor_key`, `last_viewed_at`) VALUES
(1, '89f8943a8096c5475a3c84d0c6be9d6eb7344ad5ffbb087d142777562ee927dd', '2026-11-02 18:30:45'),
(1, 'b5af61abff383e5fdd5251c160b28e297bdccac957c955400296f78e8244a5ed', '2026-11-03 10:11:02'),
(2, 'c7c982014573a4f2c9d9ca8045147ce460fe7a2df6bf39421c84bd3d56b48f30', '2026-11-04 09:50:56'),
(7, 'c7c982014573a4f2c9d9ca8045147ce460fe7a2df6bf39421c84bd3d56b48f30', '2026-11-04 03:14:24');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `asked_by` int NOT NULL,
  `status` enum('open','closed','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `accepted_answer_id` int DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `title`, `body`, `category_id`, `department_id`, `asked_by`, `status`, `accepted_answer_id`, `views`, `created_at`, `updated_at`) VALUES
(1, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', 1, 4, '2026-11-02 18:06:15', '2026-11-02 18:06:35'),
(2, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-02 18:07:01', '2026-11-02 18:07:01'),
(3, 'How do I register for a midterm retake after missing an exam?', 'I was ill and missed the CSE 2101 midterm. What is the official process, and is there a deadline for the medical certificate?', NULL, NULL, 3, 'open', 5, 5, '2026-11-02 18:10:28', '2026-11-03 05:57:35'),
(4, 'Where can I find past question papers for CSE 2101?', 'Looking for the final papers from the last three semesters to practise from.', NULL, NULL, 4, 'open', NULL, 0, '2026-11-02 18:10:28', '2026-11-02 18:10:28'),
(5, 'Is the library open during the midterm week holidays?', 'The calendar marks midterm week as a holiday period, but I need a quiet place to study.', NULL, NULL, 3, 'open', NULL, 2, '2026-11-02 18:10:28', '2026-11-16 11:54:52'),
(6, 'How do I collect my student ID card after uploading the photo?', 'I uploaded the photo two weeks ago and have not heard anything since.', NULL, NULL, 4, 'open', NULL, 2, '2026-11-02 18:10:28', '2026-11-02 18:12:31'),
(7, 'Lorem Ipsum', 'What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', NULL, NULL, 3, 'open', 7, 11, '2026-11-02 18:11:40', '2026-11-19 15:25:45'),
(8, 'Probe question: does the ask form actually work end to end?', 'This question was created by an automated browser probe and is deleted again straight away.', NULL, NULL, 3, 'removed', NULL, 2, '2026-11-02 18:12:04', '2026-11-02 18:12:05'),
(9, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-02 18:15:46', '2026-11-02 18:15:47'),
(10, 'Pagination probe question number 1', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(11, 'Pagination probe question number 2', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(12, 'Pagination probe question number 3', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(13, 'Pagination probe question number 4', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(14, 'Pagination probe question number 5', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(15, 'Pagination probe question number 6', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(16, 'Pagination probe question number 7', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(17, 'Pagination probe question number 8', 'Temporary row created by an automated probe so the pager has more than one page.', NULL, NULL, 1, 'removed', NULL, 0, '2026-11-02 18:27:09', '2026-11-02 18:27:16'),
(18, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-02 18:28:05', '2026-11-02 18:28:06'),
(19, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-02 18:32:03', '2026-11-02 18:32:04'),
(20, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-03 02:10:02', '2026-11-03 02:10:04'),
(21, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-03 02:58:58', '2026-11-03 02:59:00'),
(22, 'Does posting an answer work right now?', 'Automated probe checking the answer endpoint for a 500.', NULL, NULL, 3, 'removed', 18, 1, '2026-11-03 05:57:56', '2026-11-03 05:57:56'),
(23, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-03 06:43:34', '2026-11-03 06:43:36'),
(24, 'How do I register for the midterm retake?', 'I missed the midterm for CSE 2101 due to illness. What is the process and deadline?', NULL, NULL, 3, 'removed', NULL, 3, '2026-11-03 10:11:28', '2026-11-03 10:11:32');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `post_id` int DEFAULT NULL,
  `comment_id` int DEFAULT NULL,
  `reason` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','resolved','dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `resolved_by` int DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `version` int NOT NULL,
  `name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`, `applied_at`) VALUES
(1, 'initial', 'ec6f0c8d65f2fecfacd9759bb72a48d41b7d35424e75195e287e8d28dfd7ca76', '2026-11-02 06:15:27'),
(2, 'community', '8d970b56f9a85eaf8bb5b44621bdc2eff435c4e3be027ea2564c943d7b61b1cb', '2026-11-02 06:15:27'),
(3, 'content_hub', '911b7d7a6eeb3add75e336a3eb83847c92ae142d6f536de05fe0452676e492d7', '2026-11-02 06:15:28'),
(4, 'qa', '0123ef3747c974df9857e143a61500f97c437e4f34894a2c13c21d152061c2c0', '2026-11-02 18:04:39'),
(5, 'post_views', 'd14188a6f3ce52a9ce0e0926ac319d9a3f71bccdb9781c85700128b13a115362', '2026-11-02 18:30:04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','moderator','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` enum('pending','active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`, `img`, `full_name`, `batch`, `bio`, `department_id`) VALUES
(1, 'admin', 'admin@example.com', '$2a$12$BJ8il.uuzd.4mbyEfrEpMuypUrBXDQbMy6fXc5kfTUPWn2Y0Gd5nO', 'admin', 'active', NULL, 'Portal Administrator', NULL, NULL, NULL),
(2, 'moderator', 'moderator@example.com', '$2a$12$qtnRf8RfwdXWLpCwcsm3ROno72fgdciU7akmdYdbfPyDos0D2z9XC', 'moderator', 'active', NULL, 'Community Moderator', NULL, NULL, NULL),
(3, 'demo', 'demo@example.com', '$2a$12$6XrqmQYECpGdETiynzxe0OiRF9HCewl0dwgisF1EcPo.jP6UzLWp6', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(4, 'writer', 'writer@example.com', '$2a$12$KoQ9yo.tCCctqmpJrVv.gekdsTCw.AzL/z.KOJNZ1hsYCh2xlCWR2', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(5, 'approveplcxm', 'approveplcxm@example.com', '$2a$12$hDMo63vboDdVVyfbjibZP.sepYAAzFqR3apv/xYMyggMIa5gANrUe', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(6, 'approveyoves', 'approveyoves@example.com', '$2a$12$Qy3Ithn1FWvF8TKQf36YBurmE5ou.4e3NyfWynGOM.jdbNfkdpDti', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(7, 'approvembnsu', 'approvembnsu@example.com', '$2a$12$.pcD.YS/c58zXiuQ85JkP.8myfTw9QZlxlN1I8ZF.TXcI6IEN2jtG', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(8, 'approvebpwde', 'approvebpwde@example.com', '$2a$12$W2v.IuA/GK1ef9fb08yvA.xzazudnm2tBciRbNo18n2L.lcBsSulm', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(9, 'approvecuyam', 'approvecuyam@example.com', '$2a$12$lAysDea6izcBJHsuEoTQOeqHhwpdPE6y8lPhcBvc6svsuPcOH6bq6', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(10, 'approvekriva', 'approvekriva@example.com', '$2a$12$Hppe8tR7KPnCeTILwphFlOuyV9X/hD.ViVU6kIjJIDFO0neJJvPo6', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(11, 'approvevtizm', 'approvevtizm@example.com', '$2a$12$z5gDa5jFVdigjclsIpYBreF3kaS5HmfW7qnVNSpAiFzBUpJE0yAKG', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(12, 'approvekubey', 'approvekubey@example.com', '$2a$12$XB2MkUQsrq85BAQE/Xdlz.N6uOz9KLxTpbUuDqctCs6mFSwffAd3m', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(13, 'approveuobrt', 'approveuobrt@example.com', '$2a$12$slrvJixxkMd1E5FwomtLQ.IcglFNyGpnqWTYBgBG.Umh2o7V3TA3K', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(14, 'approvebmdjk', 'approvebmdjk@example.com', '$2a$12$Vmzexmc2tOwqMlUm81abwOCvImrdZYl2tsRiDiuZj2yZAccuijxdW', 'user', 'active', NULL, NULL, NULL, NULL, NULL),
(15, 'approvesoiag', 'approvesoiag@example.com', '$2a$12$bHdW2OGFnHZkOVZwOCZcQOz22lFpRQLCs.MdsQebXK71zOl7Tkix2', 'user', 'active', NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_answers_question` (`question_id`,`status`,`created_at`),
  ADD KEY `idx_answers_author` (`answered_by`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_created` (`created_at`),
  ADD KEY `idx_audit_actor` (`actor_id`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_categories_code` (`code`),
  ADD UNIQUE KEY `uniq_categories_slug` (`slug`),
  ADD KEY `idx_categories_active_sort` (`is_active`,`sort_order`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comments_post` (`post_id`,`created_at`),
  ADD KEY `idx_comments_parent` (`parent_id`),
  ADD KEY `idx_comments_user` (`user_id`);

--
-- Indexes for table `comment_votes`
--
ALTER TABLE `comment_votes`
  ADD PRIMARY KEY (`comment_id`,`user_id`),
  ADD KEY `idx_comment_votes_user` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_departments_code` (`code`),
  ADD KEY `idx_departments_active` (`is_active`,`sort_order`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_events_calendar` (`status`,`starts_at`),
  ADD KEY `idx_events_featured` (`is_featured`,`starts_at`),
  ADD KEY `fk_events_department` (`department_id`),
  ADD KEY `fk_events_author` (`created_by`);

--
-- Indexes for table `exam_routines`
--
ALTER TABLE `exam_routines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_routines_browse` (`status`,`department_id`,`exam_type`),
  ADD KEY `fk_routines_file` (`file_id`),
  ADD KEY `fk_routines_department` (`department_id`),
  ADD KEY `fk_routines_author` (`created_by`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_files_kind` (`kind`),
  ADD KEY `idx_files_uploader` (`uploaded_by`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_materials_browse` (`status`,`department_id`,`material_type`),
  ADD KEY `fk_materials_file` (`file_id`),
  ADD KEY `fk_materials_department` (`department_id`),
  ADD KEY `fk_materials_uploader` (`uploaded_by`);
ALTER TABLE `materials` ADD FULLTEXT KEY `ft_materials` (`title`,`description`,`course_code`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notices_board` (`status`,`is_pinned`,`publish_at`),
  ADD KEY `idx_notices_category` (`category`,`publish_at`),
  ADD KEY `idx_notices_expiry` (`expires_at`),
  ADD KEY `fk_notices_attachment` (`attachment_id`),
  ADD KEY `fk_notices_author` (`author_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_posts_uid` (`uid`),
  ADD KEY `idx_posts_category` (`category_id`),
  ADD KEY `idx_posts_status_date` (`status`,`date`);

--
-- Indexes for table `post_ratings`
--
ALTER TABLE `post_ratings`
  ADD PRIMARY KEY (`post_id`,`user_id`),
  ADD KEY `idx_post_ratings_user` (`user_id`);

--
-- Indexes for table `post_views`
--
ALTER TABLE `post_views`
  ADD PRIMARY KEY (`post_id`,`visitor_key`),
  ADD KEY `idx_post_views_recent` (`post_id`,`last_viewed_at`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_questions_newest` (`status`,`created_at`),
  ADD KEY `idx_questions_asker` (`asked_by`,`created_at`),
  ADD KEY `idx_questions_category` (`category_id`,`status`),
  ADD KEY `fk_questions_department` (`department_id`),
  ADD KEY `fk_questions_accepted` (`accepted_answer_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reports_status` (`status`,`created_at`),
  ADD KEY `idx_reports_post` (`post_id`),
  ADD KEY `idx_reports_comment` (`comment_id`),
  ADD KEY `fk_reports_reporter` (`reporter_id`),
  ADD KEY `fk_reports_resolver` (`resolved_by`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_users_username` (`username`),
  ADD UNIQUE KEY `uniq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_department` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=290;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `exam_routines`
--
ALTER TABLE `exam_routines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `fk_answers_author` FOREIGN KEY (`answered_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comment_votes`
--
ALTER TABLE `comment_votes`
  ADD CONSTRAINT `fk_comment_votes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comment_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_events_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_routines`
--
ALTER TABLE `exam_routines`
  ADD CONSTRAINT `fk_routines_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_routines_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_routines_file` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`);

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `fk_files_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `fk_materials_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_materials_file` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`),
  ADD CONSTRAINT `fk_materials_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notices`
--
ALTER TABLE `notices`
  ADD CONSTRAINT `fk_notices_attachment` FOREIGN KEY (`attachment_id`) REFERENCES `files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notices_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_posts_user` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_ratings`
--
ALTER TABLE `post_ratings`
  ADD CONSTRAINT `fk_post_ratings_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_post_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_views`
--
ALTER TABLE `post_views`
  ADD CONSTRAINT `fk_post_views_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_accepted` FOREIGN KEY (`accepted_answer_id`) REFERENCES `answers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_questions_asker` FOREIGN KEY (`asked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_questions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_questions_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reports_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
