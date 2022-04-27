import "dotenv/config"
import express from "express"
import { getUpcomingFilms } from "./scraper/upcoming"
import { searchFilms } from "./scraper/search"
import initBot from "./telegram/bot"
import getAvailableLocationsById from "./scraper/movie"
import notifier from "./cronjob/notifier"

const app = express()

notifier()
app.get("/hello", (_, res) => res.send("world"))

app.get("/search", async (req, res) => {
  if (!req.query.q) return res.sendStatus(400)

  const results = await searchFilms(req.query.q as string)
  res.send(results)
})

app.get("/upcoming", async (req, res) => {
  const films = await getUpcomingFilms()
  res.send(films)
})

app.get("/locations_by_movie_id", async (req, res) => {
  if (!req.query.id) return res.sendStatus(400)

  const locations = await getAvailableLocationsById(req.query.id as unknown as number)
  res.send(locations)
})
initBot()

app.listen(4000, () => console.log("Listening on port 4000"))
