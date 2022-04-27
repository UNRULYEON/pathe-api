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
  const notificationsByLocation = availableLocations.reduce((acc, movie) => {
    const locationId = movie.locations.flatMap((e) => cinemasWithFullNames.filter((k) => k.name === e))[0].id
    return [...acc, { movieId: movie.movieId, location_id: locationId }]
  }, [])
  console.log(notificationsByLocation)
}

export default notifier
