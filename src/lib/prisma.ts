/* ------- my code: shared PrismaClient instance for server-side route handlers ------- */

import { PrismaClient } from "@prisma/client";

// Avoid multiple Prisma Client instances due to Next.js's hot-reloading feature in development
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

/* ------- end my code ------- */