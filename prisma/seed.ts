// prisma/seed.ts
// Seed minimal pour démarrer : un admin, une catégorie, un tag.
// Lancer avec : npx tsx prisma/seed.ts (ou configurer "prisma.seed" dans package.json)
import { prisma } from "@/lib/prisma/client";
import { hash } from "bcrypt";
async function main() {
  const passwordHash = await hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lab.com" },
    update: {},
    create: {
      email: "admin@lab.com",
      username: "admin",
      password: passwordHash,
      firstName: "Admin",
      lastName: "LAB",
      role: "ADMIN",
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin2@lab.com" },
    update: {},
    create: {
      email: "admin2@lab.com",
      username: "admin2",
      password: passwordHash,
      firstName: "Admin",
      lastName: "LAB 2",
      role: "ADMIN",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "technologie" },
    update: {},
    create: {
      name: "Technologie",
      slug: "technologie",
      description: "Articles, podcasts et livres sur la tech",
    },
  });

  const tag = await prisma.tag.upsert({
    where: { slug: "nextjs" },
    update: {},
    create: { name: "Next.js", slug: "nextjs" },
  });

  console.log({
    admin: admin.username,
    admin2: admin2.username,
    category: category.name,
    tag: tag.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
