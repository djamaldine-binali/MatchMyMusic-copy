/*
  Warnings:

  - Added the required column `groupId` to the `UserReports` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserReports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reporterId" INTEGER NOT NULL,
    "reportedId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "groupId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserReports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReports_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserReports" ("adminNotes", "createdAt", "description", "id", "reason", "reportedId", "reporterId", "status", "updatedAt", "groupId") SELECT "adminNotes", "createdAt", "description", "id", "reason", "reportedId", "reporterId", "status", "updatedAt", 'legacy_' || "id" FROM "UserReports";
DROP TABLE "UserReports";
ALTER TABLE "new_UserReports" RENAME TO "UserReports";
CREATE UNIQUE INDEX "UserReports_reporterId_reportedId_key" ON "UserReports"("reporterId", "reportedId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
