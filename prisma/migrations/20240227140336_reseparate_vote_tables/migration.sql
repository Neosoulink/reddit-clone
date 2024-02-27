/*
  Warnings:

  - You are about to drop the `vote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_post_id_fkey`;

-- DropTable
DROP TABLE `vote`;

-- CreateTable
CREATE TABLE `UpVote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `post_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `UpVote_user_id_post_id_idx`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownVote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `post_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `DownVote_user_id_post_id_idx`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UpVote` ADD CONSTRAINT `UpVote_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownVote` ADD CONSTRAINT `DownVote_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
