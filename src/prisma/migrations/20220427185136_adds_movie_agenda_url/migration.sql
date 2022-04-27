/*
  Warnings:

  - Added the required column `movieAgendaUrl` to the `TelegramNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TelegramNotification" ADD COLUMN     "movieAgendaUrl" TEXT NOT NULL;
