import { PrismaClient } from '@prisma/client'
import { cinemas } from '../cinemas'

const prisma = new PrismaClient()

async function main() {
  Promise.all(cinemas.map(async cinema => {
    await prisma.cinema.upsert({
      where: {
        patheId: cinema.id
      },
      update: {},
      create: {
        patheId: cinema.id,
        name: cinema.name,
        city: cinema.city,
      }
    })
  }))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })