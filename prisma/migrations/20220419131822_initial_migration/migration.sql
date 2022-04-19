-- CreateEnum
CREATE TYPE "City" AS ENUM ('Amsterdam', 'Utrecht', 'Groningen', 'Rotterdam', 'DenHaag', 'Eindhoven', 'Helmond', 'Zaandam', 'Delft', 'Tilburg', 'Breda', 'Haarlem', 'Amersfoort', 'Arnhem', 'Zwolle', 'Ede', 'Nijmegen', 'Schiedam', 'Leeuwarden');

-- CreateTable
CREATE TABLE "TelegramNotification" (
    "id" SERIAL NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramNotificationCinemas" (
    "notifyId" INTEGER NOT NULL,
    "cinemaId" INTEGER NOT NULL,

    CONSTRAINT "TelegramNotificationCinemas_pkey" PRIMARY KEY ("notifyId","cinemaId")
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" SERIAL NOT NULL,
    "patheId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "city" "City" NOT NULL,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_patheId_key" ON "Cinema"("patheId");

-- AddForeignKey
ALTER TABLE "TelegramNotificationCinemas" ADD CONSTRAINT "TelegramNotificationCinemas_notifyId_fkey" FOREIGN KEY ("notifyId") REFERENCES "TelegramNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramNotificationCinemas" ADD CONSTRAINT "TelegramNotificationCinemas_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
