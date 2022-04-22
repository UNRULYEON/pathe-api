import * as cheerio from "cheerio"
import axios from "axios"

const BASE_URL = "https://www.pathe.nl"

const instance = axios.create({
  baseURL: BASE_URL,
})

export type Movie = {
  id: string
  name: string
  posterUrl: string
  agendaUrl: string
}

export const searchFilms = async (query: string): Promise<Movie[]> => {
  const result = await instance.get(`Zoek?q=${query}`).then(({ request, data }) => {
    const $ = cheerio.load(data)
    const movieContainerNode = $("#myticketsactual")

    const movies: Movie[] = []

    movieContainerNode.each((i, el) => {
      const movieListNode = $(el).children("div")

      movieListNode.each((i, el) => {
        const movieNode = $(el)
        const id = movieNode.find(".search-poster__poster > a").attr("href").split("/")[2]
        const name = movieNode.find("h4 > a").text()
        const posterUrl = movieNode.find("a.poster > img").attr("src")
        const agendaUrl = `${BASE_URL}${movieNode.find(".search-poster__btn-row > a").attr("href")}`

        movies.push({ id, name, posterUrl, agendaUrl })
      })
    })

    return movies
  })

  //console.log(result)

  return result
}
