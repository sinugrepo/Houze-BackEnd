-- CreateTable
CREATE TABLE `booking` (
    `id` VARCHAR(255) NOT NULL,
    `payment_id` INTEGER NOT NULL,
    `catalog_id` VARCHAR(255) NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `person` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `notes` TEXT NOT NULL,
    `schedule` DATETIME(0) NOT NULL,
    `booking_status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `booking_catalog_id_foreign`(`catalog_id`),
    INDEX `payment_id`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `otp` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog` (
    `id` VARCHAR(255) NOT NULL,
    `catalog_name` VARCHAR(255) NOT NULL,
    `catalog_type` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_name` VARCHAR(255) NOT NULL,
    `account_number` VARCHAR(255) NOT NULL,
    `transfer_nominal` DOUBLE NOT NULL,
    `payment_method` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `img_url` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `catalog_id` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(255) NULL,

    INDEX `catalog_id`(`catalog_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_catalog_id_foreign` FOREIGN KEY (`catalog_id`) REFERENCES `catalog`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `catalog_images` ADD CONSTRAINT `catalog_images_ibfk_1` FOREIGN KEY (`catalog_id`) REFERENCES `catalog`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
