import express from 'express'
import { getUpcomingFilms } from './scraper/upcoming'

const app = express()

app.get('/hello', (_, res) => res.send('world'))

app.get('/upcoming', async (req, res) => {
  let films = await getUpcomingFilms()
  res.send(films)
})

app.listen(4000, () => console.log('Listening on port 4000'))