-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "text" VARCHAR(2000) NOT NULL,
    "post_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpVote" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "UpVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownVote" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "DownVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_author_id_post_id_idx" ON "Post"("author_id", "post_id");

-- CreateIndex
CREATE INDEX "UpVote_user_id_post_id_idx" ON "UpVote"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "DownVote_user_id_post_id_idx" ON "DownVote"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpVote" ADD CONSTRAINT "UpVote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownVote" ADD CONSTRAINT "DownVote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
