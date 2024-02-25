-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access" INTEGER NOT NULL DEFAULT 1,
    "bio" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    CONSTRAINT "Password_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lang" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "cuid" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Post_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "parentCuid" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Comment_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCuid_fkey" FOREIGN KEY ("parentCuid") REFERENCES "Post" ("cuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Star" (
    "mu" REAL NOT NULL,
    "sigma" REAL NOT NULL,
    "star" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT NOT NULL,
    CONSTRAINT "Star_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Password_username_key" ON "Password"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Star_username_key" ON "Star"("username");
