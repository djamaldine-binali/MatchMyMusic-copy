-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Music" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mbid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "albumId" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Music_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Music" ("albumId", "id", "mbid", "title") SELECT "albumId", "id", "mbid", "title" FROM "Music";
DROP TABLE "Music";
ALTER TABLE "new_Music" RENAME TO "Music";
CREATE UNIQUE INDEX "Music_mbid_key" ON "Music"("mbid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
