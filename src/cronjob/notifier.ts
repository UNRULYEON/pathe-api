import cron from "node-cron"
import { cinemas, PatheCinema } from "../cinemas"
import prisma from "../prisma/context"
import getAvailableLocationsById from "../scraper/movie"
import { bot } from "../telegram/bot"

cron.schedule("* * * * *", () => {
  notifier()
})

const notifier = async () => {
  const movieIds = await prisma.telegramNotification
    .groupBy({
      by: ["movieId"],
      orderBy: { _count: { movieId: "desc" } },
    })
    .then((ids) => ids.map((id) => id.movieId))

  const availableLocations = await Promise.all(
    movieIds.map(async (id) => ({ movieId: id, locations: await getAvailableLocationsById(id) }))
  ).then((allAvailableLocation) => allAvailableLocation.filter((movie) => movie.locations.length > 0))

  const moviesWithLocations: { movieId: number; cinemas: PatheCinema[] }[] = availableLocations.reduce((acc, movie) => {
    const allLocations = movie.locations.flatMap((location) => cinemas.filter((cinema) => cinema.fullName === location))

    return [...acc, { movieId: movie.movieId, cinemas: allLocations }]
  }, [])

  await Promise.all(
    moviesWithLocations.map(async (ml) => {
      const userNotifications = await prisma.telegramNotification.findMany({
        where: { movieId: ml.movieId },
        select: {
          id: true,
          chatId: true,
          movieId: true,
          movieName: true,
          movieAgendaUrl: true,
          TelegramNotificationCinemas: {
            select: {
              notifyId: true,
              cinemaId: true,
              cinema: {
                select: {
                  patheId: true,
                },
              },
            },
          },
        },
      })

      userNotifications.map((un) => {
        un.TelegramNotificationCinemas.map((unc) => {
          const timesAtLocationAvailable = ml.cinemas.find((c) => c.id === unc.cinema.patheId)

          if (timesAtLocationAvailable) {
            bot
              .sendMessage(un.chatId, `${un.movieName} at ${timesAtLocationAvailable.name} is available!`, {
                reply_markup: {
                  inline_keyboard: [[{ text: "Agenda", url: un.movieAgendaUrl }]],
                },
              })
              .then(
                async () =>
                  await deleteTelegramNotificationCinema(unc.notifyId, unc.cinemaId).then(async () =>
                    findTelegramNotiticationWithCinemas(un.id).then(async (un) => {
                      if (un.TelegramNotificationCinemas.length <= 0) await deleteTelegramNotification(un.id)
                    })
                  )
              )
          }
        })
      })
    })
  )
}

const deleteTelegramNotificationCinema = async (notifyId: number, cinemaId: number) => {
  return prisma.telegramNotificationCinemas.delete({
    where: {
      notifyId_cinemaId: {
        cinemaId: cinemaId,
        notifyId: notifyId,
      },
    },
  })
}

const findTelegramNotiticationWithCinemas = async (id: number) => {
  return prisma.telegramNotification.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      TelegramNotificationCinemas: {
        select: {
          notifyId: true,
        },
      },
    },
  })
}

const deleteTelegramNotification = async (id: number) => {
  return prisma.telegramNotification.delete({
    where: {
      id: id,
    },
  })
}

export default notifier
