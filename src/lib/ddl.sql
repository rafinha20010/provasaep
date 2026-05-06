-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema prova
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `prova` ;

-- -----------------------------------------------------
-- Schema prova
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `prova` ;
USE `prova` ;

-- -----------------------------------------------------
-- Table `prova`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `prova`.`user` ;

CREATE TABLE IF NOT EXISTS `prova`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `prova`.`produto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `prova`.`produto` ;

CREATE TABLE IF NOT EXISTS `prova`.`produto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` VARCHAR(600) NOT NULL,
  `preco` DECIMAL(10,2) NOT NULL,
  `estoque` INT NOT NULL,
  `estoque_min` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_produto_user_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_produto_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `prova`.`user` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `prova`.`movimentacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `prova`.`movimentacao` ;

CREATE TABLE IF NOT EXISTS `prova`.`movimentacao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `data` DATETIME NOT NULL,
  `tipo` ENUM('Entrada', 'Saida') NOT NULL,
  `quantidade` INT NOT NULL,
  `user_id` INT NOT NULL,
  `produto_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_movimentacao_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_movimentacao_produto1_idx` (`produto_id` ASC) VISIBLE,
  CONSTRAINT `fk_movimentacao_produto1`
    FOREIGN KEY (`produto_id`)
    REFERENCES `prova`.`produto` (`id`),
  CONSTRAINT `fk_movimentacao_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `prova`.`user` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
