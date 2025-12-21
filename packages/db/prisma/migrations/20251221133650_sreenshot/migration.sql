/*
  Warnings:

  - You are about to drop the column `expries` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `screenshots` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expries",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "price",
DROP COLUMN "quantity",
DROP COLUMN "screenshots",
ALTER COLUMN "note" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TradeScreenshot" (
    "id" SERIAL NOT NULL,
    "tradeId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "TradeScreenshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeScreenshot" ADD CONSTRAINT "TradeScreenshot_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
