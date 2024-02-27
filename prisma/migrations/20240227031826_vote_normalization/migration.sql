/*
  Warnings:

  - You are about to drop the `downvote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `upvote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `downvote` DROP FOREIGN KEY `Downvote_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `upvote` DROP FOREIGN KEY `Upvote_post_id_fkey`;

-- DropTable
DROP TABLE `downvote`;

-- DropTable
DROP TABLE `upvote`;

-- CreateTable
CREATE TABLE `Vote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `post_id` INTEGER NOT NULL,
    `vote_type` ENUM('UP', 'DOWN') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `Vote_user_id_post_id_idx`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
