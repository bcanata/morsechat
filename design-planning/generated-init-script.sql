-- MySQL Script generated by MySQL Workbench
-- Sat Apr 23 02:42:48 2022
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema morsechat
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema morsechat
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `morsechat` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `morsechat` ;

-- -----------------------------------------------------
-- Table `morsechat`.`sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `morsechat`.`sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(255) NULL DEFAULT NULL,
  `data` BLOB NULL DEFAULT NULL,
  `expiry` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `session_id` (`session_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `morsechat`.`callsign_schemas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `morsechat`.`callsign_schemas` (
  `schema` VARCHAR(8000) NOT NULL,
  `expire` INT(11) UNSIGNED NULL DEFAULT NULL,
  `max_uses` INT(11) NULL DEFAULT NULL,
  `description` VARCHAR(256) NULL DEFAULT NULL,
  `code_hash` VARCHAR(90) NOT NULL,
  `code_clear` VARCHAR(90) NULL DEFAULT NULL,
  PRIMARY KEY (`code_hash`),
  INDEX `code_clear` (`code_clear` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `morsechat`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `morsechat`.`users` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `callsign` VARCHAR(20) NOT NULL,
  `username` VARCHAR(20) NOT NULL,
  `password` VARCHAR(95) NOT NULL,
  `registrationTimestamp` INT(11) UNSIGNED NOT NULL,
  `lastOnlineTimestamp` INT(11) UNSIGNED NOT NULL,
  `callsign_generator` VARCHAR(90) NOT NULL,
  `settings` JSON NULL DEFAULT NULL,
  `verified` TINYINT NOT NULL DEFAULT 0,
  `banned` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `callsign_UNIQUE` (`callsign` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  INDEX `callsign_generator_idx` (`callsign_generator` ASC) VISIBLE,
  CONSTRAINT `callsign_generator`
    FOREIGN KEY (`callsign_generator`)
    REFERENCES `morsechat`.`callsign_schemas` (`code_hash`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `morsechat`.`blocked`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `morsechat`.`blocked` (
  `blocking_user` INT UNSIGNED NOT NULL,
  `blocked_user` INT UNSIGNED NOT NULL,
  `timestamp` INT(11) NOT NULL,
  INDEX `blocked_user_idx` (`blocked_user` ASC) INVISIBLE,
  PRIMARY KEY (`blocking_user`, `blocked_user`),
  CONSTRAINT `blocking_user`
    FOREIGN KEY (`blocking_user`)
    REFERENCES `morsechat`.`users` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `blocked_user`
    FOREIGN KEY (`blocked_user`)
    REFERENCES `morsechat`.`users` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `morsechat`.`reported`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `morsechat`.`reported` (
  `reporting_user` INT UNSIGNED NOT NULL,
  `reported_user` INT UNSIGNED NOT NULL,
  `timestamp` INT(11) NULL DEFAULT NULL,
  `reasons` VARCHAR(512) NULL DEFAULT NULL,
  INDEX `reported_user_idx` (`reported_user` ASC) INVISIBLE,
  PRIMARY KEY (`reporting_user`, `reported_user`),
  CONSTRAINT `reporting_user`
    FOREIGN KEY (`reporting_user`)
    REFERENCES `morsechat`.`users` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `reported_user`
    FOREIGN KEY (`reported_user`)
    REFERENCES `morsechat`.`users` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
