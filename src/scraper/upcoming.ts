import * as cheerio from "cheerio"
import axios from "axios"

const BASE_URL = "https://www.pathe.nl/films/verwacht"

const instance = axios.create({
  baseURL: BASE_URL,
})

type Movie = {
  id: string
  name: string
  posterUrl: string
}

export const getUpcomingFilms = async (): Promise<Movie[]> => {
  const res = await Promise.all(
    [1, 2, 3, 4, 5].map((id) =>
      instance.get(`?page=${id}`).then(({ data }) => {
        const $ = cheerio.load(data)

        const moviesNode = $("a.poster")

        const movies: Movie[] = []

        moviesNode.each((_, el) => {
          const movie = $(el)
          const id = movie.attr("data-gtmclick")
          const name = movie.find("p.poster__label").text()
          const posterUrl = movie.find("img").attr("src")

          movies.push({ id, name, posterUrl })
        })

        return movies
      })
    )
  )

  return res.flat()
}
