-- DropIndex
DROP INDEX "Room_adminToken_key";

-- CreateIndex
CREATE INDEX "Room_adminToken_idx" ON "Room"("adminToken");
