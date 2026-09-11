-- CreateTable
CREATE TABLE "mock_store" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_store_pkey" PRIMARY KEY ("id")
);
