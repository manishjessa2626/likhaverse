import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

const SALT_ROUNDS = 10

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

export async function verifyParentPin(
  parentUserId: string,
  pin: string,
): Promise<boolean> {
  if (!pin || !/^\d{4,6}$/.test(pin)) return false
  const stored = await prisma.parentPin.findUnique({
    where: { parentUserId },
    select: { hashedPin: true },
  })
  if (!stored) return false
  return bcrypt.compare(pin, stored.hashedPin)
}
