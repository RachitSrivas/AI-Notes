import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();


// Add the word 'export' here, and remove the export default at the bottom!
export const prisma = new PrismaClient();