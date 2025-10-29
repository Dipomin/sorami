import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobId = process.argv[2] || "test-video-perso-1761682649";
  
  console.log(`\n🔍 Vérification de la génération: ${jobId}\n`);
  
  // 1. VideoGeneration
  const videoGeneration = await prisma.videoGeneration.findUnique({
    where: { id: jobId },
    include: {
      videos: true,
      author: { select: { id: true, email: true, clerkId: true } }
    }
  });
  
  if (videoGeneration) {
    console.log("✅ VideoGeneration trouvée:");
    console.log(JSON.stringify(videoGeneration, null, 2));
  } else {
    console.log("❌ VideoGeneration introuvable");
    return;
  }
  
  // 2. Notifications
  console.log(`\n🔔 Notifications pour l'utilisateur ${videoGeneration.authorId}:`);
  const notifications = await prisma.notification.findMany({
    where: {
      userId: videoGeneration.authorId,
      metadata: {
        path: ['generationId'],
        equals: jobId
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(JSON.stringify(notifications, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
