-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorname" TEXT NOT NULL,
    CONSTRAINT "Post_authorname_fkey" FOREIGN KEY ("authorname") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorname" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL,
    CONSTRAINT "Comment_authorname_fkey" FOREIGN KEY ("authorname") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Access" (
    "username" TEXT NOT NULL,
    "visitWebsite" INTEGER NOT NULL DEFAULT 1,
    "communicate" INTEGER NOT NULL DEFAULT 1,
    "joinRoom" INTEGER NOT NULL DEFAULT 1,
    "createRoom" INTEGER NOT NULL DEFAULT 1,
    "manageAnnouncement" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Access_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Post_authorname_key" ON "Post"("authorname");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_authorname_key" ON "Comment"("authorname");

-- CreateIndex
CREATE UNIQUE INDEX "Access_username_key" ON "Access"("username");
