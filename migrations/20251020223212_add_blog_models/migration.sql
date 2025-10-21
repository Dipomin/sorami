-- CreateTable
CREATE TABLE `blog_articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `topic` VARCHAR(500) NOT NULL,
    `goal` TEXT NULL,
    `metaDescription` VARCHAR(255) NULL,
    `introduction` TEXT NULL,
    `conclusion` TEXT NULL,
    `fullContent` LONGTEXT NULL,
    `seoScore` DOUBLE NULL,
    `wordCount` INTEGER NULL,
    `readabilityScore` VARCHAR(255) NULL,
    `targetWordCount` INTEGER NOT NULL DEFAULT 2000,
    `tags` JSON NULL,
    `mainKeywords` JSON NULL,
    `sections` JSON NULL,
    `outline` JSON NULL,
    `status` ENUM('DRAFT', 'GENERATING', 'REVIEW', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `visibility` ENUM('PRIVATE', 'PUBLIC', 'UNLISTED') NOT NULL DEFAULT 'PRIVATE',
    `publishedAt` DATETIME(3) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `storageProvider` ENUM('LOCAL', 'AWS_S3', 'GOOGLE_CLOUD', 'AZURE_BLOB') NOT NULL DEFAULT 'LOCAL',
    `s3Bucket` VARCHAR(191) NULL,
    `s3Key` VARCHAR(191) NULL,
    `markdownPath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `generatedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_formats` (
    `id` VARCHAR(191) NOT NULL,
    `blogArticleId` VARCHAR(191) NOT NULL,
    `format` ENUM('MARKDOWN', 'PDF', 'EPUB', 'DOCX', 'HTML', 'TXT') NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `storageProvider` ENUM('LOCAL', 'AWS_S3', 'GOOGLE_CLOUD', 'AZURE_BLOB') NOT NULL DEFAULT 'LOCAL',
    `filePath` VARCHAR(191) NULL,
    `s3Bucket` VARCHAR(191) NULL,
    `s3Key` VARCHAR(191) NULL,
    `cdnUrl` VARCHAR(191) NULL,
    `generatedWith` VARCHAR(191) NULL,
    `quality` VARCHAR(191) NULL,
    `status` ENUM('GENERATING', 'READY', 'ERROR') NOT NULL DEFAULT 'GENERATING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_formats_blogArticleId_format_key`(`blogArticleId`, `format`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `externalJobId` VARCHAR(191) NULL,
    `jobType` ENUM('BLOG_GENERATION', 'BLOG_OPTIMIZATION', 'BLOG_TRANSLATION') NOT NULL DEFAULT 'BLOG_GENERATION',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `inputData` JSON NOT NULL,
    `status` ENUM('PENDING', 'GENERATING_OUTLINE', 'WRITING_CHAPTERS', 'FINALIZING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `currentStep` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `result` JSON NULL,
    `error` TEXT NULL,
    `logs` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `estimatedDuration` INTEGER NULL,
    `userId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `blogArticleId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_jobs_externalJobId_key`(`externalJobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_articles` ADD CONSTRAINT `blog_articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_articles` ADD CONSTRAINT `blog_articles_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_formats` ADD CONSTRAINT `blog_formats_blogArticleId_fkey` FOREIGN KEY (`blogArticleId`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_jobs` ADD CONSTRAINT `blog_jobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_jobs` ADD CONSTRAINT `blog_jobs_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_jobs` ADD CONSTRAINT `blog_jobs_blogArticleId_fkey` FOREIGN KEY (`blogArticleId`) REFERENCES `blog_articles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
