-- CreateTable
CREATE TABLE `law` (
    `lawId` BIGINT NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(50) NOT NULL,
    `jomun` VARCHAR(10000) NOT NULL,

    PRIMARY KEY (`lawId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
