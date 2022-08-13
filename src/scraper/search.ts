import * as cheerio from "cheerio"
import axios from "axios"
import { Movie } from "../telegram/types"

const BASE_URL = "https://www.pathe.nl"

const instance = axios.create({
  baseURL: BASE_URL,
})

export const searchFilms = async (query: string): Promise<Movie[]> => {
  const result = await instance.get(`Zoek?q=${query}`).then(({ request, data }) => {
    const $ = cheerio.load(data)
    const rootNode = $("#js-body > div > div.container > section > div > div > div > div")
    const titleNodes = rootNode.find(".heading__title")

    const movies: Movie[] = []

    const getMoviesfromList = (movieListNode: any) => {
      const movieNodes = movieListNode.children("div")

      movieNodes.each((i, el) => {
        const movieNode = $(el)
        const id = movieNode.find(".search-poster__poster > a").attr("href").split("/")[2]
        const name = movieNode.find("h4 > a").text()
        const posterUrl = movieNode.find("a.poster > img").attr("src")
        const agendaUrl = `${BASE_URL}${movieNode.find(".search-poster__btn-row > a").attr("href")}`

        movies.push({ id, name, posterUrl, agendaUrl })
      })
    }

    titleNodes.each((i, el) => {
      const titleNode = $(el)

      if (titleNode.text().trim() === "Nu bij Pathé") {
        getMoviesfromList($("#js-body > div > div.container > section > div > div > div > div > div:nth-child(4)"))
      }

      if (titleNode.text().trim() === "Binnenkort") {
        if (movies.length > 0) {
          getMoviesfromList($("#js-body > div > div.container > section > div > div > div > div > div:nth-child(6)"))
        } else {
          getMoviesfromList($("#js-body > div > div.container > section > div > div > div > div > div:nth-child(4)"))
        }
      }
    })

    return movies
  })

  return result
}
