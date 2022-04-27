import cron from "node-cron"
import { cinemasWithFullNames } from "../cinemas"
import prisma from "../prisma/context"
import getAvailableLocationsById from "../scraper/movie"
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

  const moviesWithLocations: { movieId: number; location_id: number }[] = availableLocations.reduce((acc, movie) => {
    const locationId = movie.locations.flatMap((location) =>
      cinemasWithFullNames.filter((cinema) => cinema.name === location)
    )[0].id
    return [...acc, { movieId: movie.movieId, location_id: locationId }]
  }, [])
  await Promise.all(
    moviesWithLocations.map(async (ml) => {
      const result = await prisma.telegramNotification.findMany({ where: { movieId: ml.movieId } })
    })
  )
}

export default notifier
