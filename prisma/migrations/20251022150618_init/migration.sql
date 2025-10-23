-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "notificationHour" INTEGER NOT NULL,
    "notificationFrequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSentAt" DATETIME
);

-- CreateTable
CREATE TABLE "NewsCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "newsTitle" TEXT NOT NULL,
    "newsUrl" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_isActive_idx" ON "Subscriber"("isActive");

-- CreateIndex
CREATE INDEX "NewsCache_category_idx" ON "NewsCache"("category");

-- CreateIndex
CREATE INDEX "NewsCache_createdAt_idx" ON "NewsCache"("createdAt");

-- CreateIndex
CREATE INDEX "MarketData_dataType_idx" ON "MarketData"("dataType");

-- CreateIndex
CREATE INDEX "MarketData_updatedAt_idx" ON "MarketData"("updatedAt");
