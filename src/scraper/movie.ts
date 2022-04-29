import * as cheerio from "cheerio"

import axios from "axios"
import prisma from "../prisma/context"

const BASE_URL = "https://www.pathe.nl"

const getQueryString = (movieId: number): string => `film/${movieId}`

const instance = axios.create({
  baseURL: BASE_URL,
})

const getAvailableLocationsById = async (movieId: number): Promise<string[]> => {
  const result = await instance.get(getQueryString(movieId)).then(({ data }) => {
    const $ = cheerio.load(data)

    if ($("#js-schedules-section").length === 0) return []

    const availableLocation: string[] = []
    const dropdownCinemaSelector = $("#js-all-cinema-filter-container > ul > li > ul > li > label")
    const singleCinemaSelector = $("#js-all-cinema-filter-container > ul > li > label")

    singleCinemaSelector
      .filter((_, elem) => $(elem).attr("for").includes("cinema"))
      .each((_, locationElement) => {
        const location = $(locationElement).text()
        availableLocation.push(`Pathé ${location}`)
      })
    dropdownCinemaSelector.each((_, locationElement) => {
      const location = $(locationElement).text()

      availableLocation.push(location)
    })

    return availableLocation
  })

  return result
}

export default getAvailableLocationsById
