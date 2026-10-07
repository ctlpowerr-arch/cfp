-- =============================================================================
-- IFP-ITMC / CFP-ITMC DOUALA LOGPOM - PRODUCTION DATABASE SCHEMA (HOSTINGER)
-- Website: https://ifp-itmc.com | Location: Douala Logpom, Cameroun
-- DBMS Target: MySQL 8.0+ / MariaDB 10.6+ (Hostinger hPanel / cPanel / VPS)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Engine: InnoDB with Foreign Key Constraints & Fast B-Tree Indexes
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table: academic_years
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(32) NOT NULL UNIQUE,
  `isCurrent` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('Planifiée', 'En Cours', 'Clôturée') NOT NULL DEFAULT 'Planifiée',
  `startDate` DATE NULL,
  `endDate` DATE NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: institution_branding
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `institution_branding` (
  `id` VARCHAR(32) NOT NULL DEFAULT 'primary_branding',
  `institutionName` VARCHAR(128) NOT NULL DEFAULT 'IFP-ITMC',
  `institutionFullName` VARCHAR(255) NOT NULL,
  `acronym` VARCHAR(32) NOT NULL DEFAULT 'IFP-ITMC',
  `city` VARCHAR(64) NOT NULL DEFAULT 'Douala',
  `neighborhood` VARCHAR(128) NOT NULL DEFAULT 'Logpom (Carrefour Bassong)',
  `country` VARCHAR(64) NOT NULL DEFAULT 'Cameroun',
  `domain` VARCHAR(128) NOT NULL DEFAULT 'ifp-itmc.com',
  `website` VARCHAR(255) NOT NULL DEFAULT 'https://ifp-itmc.com',
  `phone` VARCHAR(64) NOT NULL DEFAULT '+237 677 88 99 00',
  `email` VARCHAR(128) NOT NULL DEFAULT 'contact@ifp-itmc.com',
  `logoUrl` LONGTEXT NULL,
  `logoType` VARCHAR(32) NOT NULL DEFAULT 'crest',
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updatedBy` VARCHAR(128) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: users (Centralized RBAC authentication)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student', 'secretary') NOT NULL,
  `phone` VARCHAR(64) NULL,
  `avatar` LONGTEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `lastLoginAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: specialties (39 Formations Métiers DQP MINEFOP)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `specialties` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `durationMonths` INT NOT NULL DEFAULT 12,
  `level` VARCHAR(64) NOT NULL DEFAULT 'DQP (Diplôme de Qualification Professionnelle)',
  `tuitionFee` INT NOT NULL DEFAULT 350000,
  `description` TEXT NULL,
  `careerProspects` TEXT NULL,
  `syllabus` JSON NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_specialties_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: classes (Promotions scolaires isolées par année académique)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `specialtyId` VARCHAR(64) NULL,
  `academicYear` VARCHAR(32) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 35,
  `room` VARCHAR(64) NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_classes_academicYear` (`academicYear`),
  CONSTRAINT `fk_classes_specialty` FOREIGN KEY (`specialtyId`) REFERENCES `specialties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: teachers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` VARCHAR(64) NOT NULL,
  `userId` VARCHAR(64) NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(64) NULL,
  `department` VARCHAR(128) NOT NULL,
  `mainSpecialty` VARCHAR(128) NOT NULL,
  `status` ENUM('Actif', 'En Congé', 'Inactif') NOT NULL DEFAULT 'Actif',
  `avatar` LONGTEXT NULL,
  `bio` TEXT NULL,
  `website` VARCHAR(255) NULL,
  `assignedClasses` JSON NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: students
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(64) NOT NULL,
  `matricule` VARCHAR(64) NOT NULL UNIQUE,
  `userId` VARCHAR(64) NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(64) NULL,
  `birthDate` DATE NULL,
  `city` VARCHAR(64) DEFAULT 'Douala',
  `classId` VARCHAR(64) NULL,
  `academicYear` VARCHAR(32) NOT NULL,
  `status` ENUM('Inscrit', 'En Règle', 'En Attente', 'Diplômé', 'Suspendu') NOT NULL DEFAULT 'Inscrit',
  `avatar` LONGTEXT NULL,
  `guardianName` VARCHAR(191) NULL,
  `guardianPhone` VARCHAR(64) NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_students_academicYear` (`academicYear`),
  INDEX `idx_students_matricule` (`matricule`),
  CONSTRAINT `fk_students_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Table: registrations (Candidatures & Pré-inscriptions en ligne)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` VARCHAR(64) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `specialtyCode` VARCHAR(64) NOT NULL,
  `specialtyName` VARCHAR(191) NOT NULL,
  `diplomaTarget` VARCHAR(64) NOT NULL DEFAULT 'DQP',
  `academicYear` VARCHAR(32) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'confirmed') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_registrations_academicYear` (`academicYear`),
  INDEX `idx_registrations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Table: modules & courses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modules` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `teacherId` VARCHAR(64) NULL,
  `classId` VARCHAR(64) NULL,
  `academicYear` VARCHAR(32) NOT NULL,
  `credits` INT NOT NULL DEFAULT 4,
  `hoursTotal` INT NOT NULL DEFAULT 45,
  `coefficient` DECIMAL(3,1) NOT NULL DEFAULT 2.0,
  `description` TEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_modules_academicYear` (`academicYear`),
  CONSTRAINT `fk_modules_teacher` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_modules_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Table: grades & compositions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `grades` (
  `id` VARCHAR(64) NOT NULL,
  `studentId` VARCHAR(64) NOT NULL,
  `moduleId` VARCHAR(64) NOT NULL,
  `teacherId` VARCHAR(64) NULL,
  `classId` VARCHAR(64) NULL,
  `academicYear` VARCHAR(32) NOT NULL,
  `sessionName` VARCHAR(64) NOT NULL DEFAULT 'Session Normale',
  `scoreCC` DECIMAL(4,2) NULL, -- Contrôle Continu / 20
  `scoreExam` DECIMAL(4,2) NULL, -- Examen Synthèse / 20
  `scoreFinal` DECIMAL(4,2) NOT NULL, -- Note Finale / 20
  `status` ENUM('Validé', 'Rattrapage', 'Non Validé') NOT NULL DEFAULT 'Validé',
  `appreciation` VARCHAR(255) NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_grades_academicYear` (`academicYear`),
  INDEX `idx_grades_student` (`studentId`),
  CONSTRAINT `fk_grades_student` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_module` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. Table: security_logs (Journal WAF & Audit des Pénétrations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` VARCHAR(64) NOT NULL,
  `eventType` VARCHAR(64) NOT NULL,
  `ipAddress` VARCHAR(64) NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
  `details` TEXT NOT NULL,
  `userAgent` VARCHAR(255) NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_security_severity` (`severity`),
  INDEX `idx_security_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- INITIAL SEED DATA FOR IFP-ITMC DOUALA LOGPOM
-- -----------------------------------------------------------------------------
INSERT INTO `institution_branding` (`id`, `institutionName`, `institutionFullName`, `acronym`, `city`, `neighborhood`, `country`, `domain`, `website`, `phone`, `email`)
VALUES (
  'primary_branding',
  'IFP-ITMC',
  'Institut & Centre de Formation Professionnelle aux Métiers des Technologies de l\'Information et du Management au Cameroun',
  'IFP-ITMC',
  'Douala - Logpom',
  'Logpom (Carrefour Bassong)',
  'Cameroun',
  'ifp-itmc.com',
  'https://ifp-itmc.com',
  '+237 677 88 99 00',
  'contact@ifp-itmc.com'
) ON DUPLICATE KEY UPDATE `updatedAt` = CURRENT_TIMESTAMP;

INSERT INTO `academic_years` (`id`, `name`, `isCurrent`, `status`)
VALUES 
  ('ay_2025_2026', '2025-2026', TRUE, 'En Cours'),
  ('ay_2026_2027', '2026-2027', FALSE, 'Planifiée')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
