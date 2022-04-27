import * as cheerio from "cheerio"

import axios from "axios"
import prisma from "../prisma/context"

const BASE_URL = "https://www.pathe.nl"

const getQueryString = (movieId: number, cinemaIds: number[]): string =>
  `film/${movieId}/agenda?${cinemaIds.reduce((acc, id) => acc + `cinemas=${id}&`, "")}`

const instance = axios.create({
  baseURL: BASE_URL,
})

const getAvailableLocationsById = async (movieId: number): Promise<string[]> => {
  const cinemaIds = await prisma.cinema
    .findMany({ select: { patheId: true } })
    .then((cinemas) => cinemas.map((cinema) => cinema.patheId))

  const result = await instance.get(getQueryString(movieId, cinemaIds)).then(({ data }) => {
    const $ = cheerio.load(data)

    if ($("body > div").length === 0) return []

    const availableLocation: string[] = []
    const locationNodes = $("body > div > div > div > div > p")

    locationNodes.each((_, locationElement) => {
      const location = $(locationElement).text()

      if (!availableLocation.includes(location)) availableLocation.push(location)
    })

    return availableLocation
  })

  return result
}

export default getAvailableLocationsById
