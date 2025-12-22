-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tradeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Trade_tradeDate_idx" ON "Trade"("tradeDate");
