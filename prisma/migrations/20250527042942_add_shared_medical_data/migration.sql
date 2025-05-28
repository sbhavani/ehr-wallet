-- CreateTable
CREATE TABLE "SharedMedicalData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessId" TEXT NOT NULL,
    "ipfsCid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryTime" DATETIME NOT NULL,
    "hasPassword" BOOLEAN NOT NULL DEFAULT false,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "dataTypes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedMedicalData_accessId_key" ON "SharedMedicalData"("accessId");
