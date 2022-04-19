import 'dotenv/config'
import express from 'express'
import { getUpcomingFilms } from './scraper/upcoming'
import { searchFilms } from './scraper/search'
import initBot from './bot'

const app = express()

app.get('/hello', (_, res) => res.send('world'))

app.get('/search', async (req, res) => {
  if (!req.query.q) return res.sendStatus(400)

  const results = await searchFilms(req.query.q as string)
  res.send(results)
})

app.get('/upcoming', async (req, res) => {
  let films = await getUpcomingFilms()
  res.send(films)
})

initBot()

app.listen(4000, () => console.log('Listening on port 4000'))