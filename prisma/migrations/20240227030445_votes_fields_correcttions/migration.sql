/*
  Warnings:

  - You are about to drop the column `author_id` on the `downvote` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `upvote` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Downvote` table without a default value. This is not possible if the table is not empty.
  - Made the column `post_id` on table `downvote` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `Upvote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `downvote` DROP FOREIGN KEY `Downvote_post_id_fkey`;

-- DropIndex
DROP INDEX `Downvote_author_id_idx` ON `downvote`;

-- DropIndex
DROP INDEX `Upvote_author_id_post_id_idx` ON `upvote`;

-- AlterTable
ALTER TABLE `downvote` DROP COLUMN `author_id`,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    MODIFY `post_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `upvote` DROP COLUMN `author_id`,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Downvote_user_id_idx` ON `Downvote`(`user_id`);

-- CreateIndex
CREATE INDEX `Upvote_user_id_post_id_idx` ON `Upvote`(`user_id`, `post_id`);

-- AddForeignKey
ALTER TABLE `Downvote` ADD CONSTRAINT `Downvote_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
