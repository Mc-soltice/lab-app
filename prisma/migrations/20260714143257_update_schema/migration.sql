/*
  Warnings:

  - You are about to drop the column `chapters_count` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `books` table. All the data in the column will be lost.
  - You are about to drop the `book_chapters` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `book_chapters` DROP FOREIGN KEY `book_chapters_book_id_fkey`;

-- AlterTable
ALTER TABLE `books` DROP COLUMN `chapters_count`,
    DROP COLUMN `views`,
    ADD COLUMN `download_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `price` DECIMAL(10, 2) NULL;

-- DropTable
DROP TABLE `book_chapters`;
