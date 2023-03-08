var axios = require('axios')
const EpEnvVar = "RAPIDAPI_KEY"

export class SkyscannerError extends Error { }

let AxiosDefaultOptions = {
    method: '',
    url: '',
    headers: {
        'X-RapidAPI-Key': '',
        'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
    },
    params: {}
}

export enum CabinClass {
    CABIN_CLASS_UNSPECIFIED = "CABIN_CLASS_UNSPECIFIED",
    CABIN_CLASS_ECONOMY = "CABIN_CLASS_ECONOMY",
    CABIN_CLASS_PREMIUM_ECONOMY = "CABIN_CLASS_PREMIUM_ECONOMY",
    CABIN_CLASS_BUSINESS = "CABIN_CLASS_BUSINESS",
    CABIN_CLASS_FIRST = "CABIN_CLASS_FIRST"
}
export enum LocationType {
    PLACE_TYPE_UNSPECIFIED = "PLACE_TYPE_UNSPECIFIED",
    PLACE_TYPE_AIRPORT = "PLACE_TYPE_AIRPORT",
    PLACE_TYPE_CITY = "PLACE_TYPE_CITY",
    PLACE_TYPE_COUNTRY = "PLACE_TYPE_COUNTRY",
    PLACE_TYPE_CONTINENT = "PLACE_TYPE_CONTINENT"
}
export interface Market {
    code: string,
    name: string,
    currency: string
}
export interface Locale {
    code: string,
    name: string
}
export interface Currency {
    code: string,
    symbol: string,
    thousandsSeparator: string,
    decimalSeparator: string,
    symbolOnLeft: boolean,
    spaceBetweenAmountAndSymbol: boolean,
    decimalDigits: number
}
export interface Carrier {
    name: string,
    iata: string
}
export interface LocationCoordinates {
    latitude: number,
    longitude: number
}
export interface Location {
    entityId: string,
    parentId: string,
    name: string,
    type: LocationType,
    iata: string
    coordinates: LocationCoordinates
}
export interface PlaceId {
    iata?: string
    entityId?: string
}
export interface Date {
    year: number;
    month: number;
    day: number;
}
export interface QueryLeg {
    originPlaceId: PlaceId;
    destinationPlaceId: PlaceId;
    date: Date;
}

export interface FlightQuery {
    market: string;
    locale: string;
    currency: string;
    queryLegs: QueryLeg[];
    cabinClass: CabinClass;
    adults: number;
    childrenAges?: number[];
}

export interface HotelQuery {
    market: string,
    locale: string,
    currency: string,
    placeId: PlaceId,
    checkInDate: Date,
    checkOutDate: Date,
    adults: number,
    rooms: number,
    childrenAges?: number[],
    sortBy: string
}

export interface AutosuggestFlightQuery {
    market: string,
    locale: string,
    searchTerm: string,
}

export interface AutosuggestHotelQuery {
    market: string,
    locale: string,
    searchTerm: string,
}

function generateOptions(method: string, url: string, key?: string): any {
    if (key === undefined && process.env[EpEnvVar] && process.env[EpEnvVar].length > 0) {
        key = process.env[EpEnvVar]
    } else {
        throw new SkyscannerError(`
            Skyscanner Client Library requires a valid Rapid API Key.
            Visit https://rapidapi.com/rpi4gx/api/skyscanner-api to get one for free.
        `)
    }
    let options = AxiosDefaultOptions
    options.method = method
    options.url = url
    options.headers['X-RapidAPI-Key'] = key
    return options
}

export async function locales(key?: string): Promise<Locale[]> {
    let options = generateOptions("GET", "https://skyscanner-api.p.rapidapi.com/v3/culture/locales", key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE") {
        return result.data.locales
    }
    throw new SkyscannerError(`failure retrieving locales: ${JSON.stringify(result.data)}`)
}

export async function markets(locale: string, key?: string): Promise<Market[]> {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3/culture/markets/${locale}`, key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE") {
        return result.data.markets
    }
    throw new SkyscannerError(`failure retrieving markets: ${JSON.stringify(result.data)}`)
}

export async function currencies(key?: string): Promise<Currency[]> {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3/culture/currencies`, key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE") {
        return result.data.currencies
    }
    throw new SkyscannerError(`failure retrieving currencies: ${JSON.stringify(result.data)}`)
}

export async function carriers(key?: string): Promise<Map<string, Carrier>> {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3/flights/carriers`, key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE") {
        return result.data.carriers
    }
    throw new SkyscannerError(`failure retrieving carriers: ${JSON.stringify(result.data)}`)
}

export async function locations(locale: string, key?: string): Promise<Map<string, Location>> {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3/geo/hierarchy/flights/${locale}`, key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE") {
        return result.data.places
    }
    throw new SkyscannerError(`failure retrieving locations: ${JSON.stringify(result.data)}`)
}

export async function flightSyncSearch(query: FlightQuery, key?: string) {
    let options = generateOptions("POST", `https://skyscanner-api.p.rapidapi.com/v3e/flights/live/search/synced`, key)
    options['data'] = { query }
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE" || result.data.status == "RESULT_STATUS_INCOMPLETE") {
        return result.data
    }
    throw new SkyscannerError(`failure running search: ${JSON.stringify(result.data)}`) 
}

export async function flightAsyncCreateSearch(query: FlightQuery, key?: string) {
    let options = generateOptions("POST", `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`, key)
    options['data'] = { query }
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE" || result.data.status == "RESULT_STATUS_INCOMPLETE") {
        return result.data
    }
    throw new SkyscannerError(`failure running search: ${JSON.stringify(result.data)}`) 
}

export async function flightAsyncPollSearch(sessionToken: string, key?: string) {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/poll/${sessionToken}`, key)
    let result = await axios.request(options)
    if (result.data.status == "RESULT_STATUS_COMPLETE" || result.data.status == "RESULT_STATUS_INCOMPLETE") {
        return result.data
    }
    throw new SkyscannerError(`failure running search: ${JSON.stringify(result.data)}`) 
}

export async function hotelCreateSearch(query: HotelQuery, key?: string) {
    let options = generateOptions("POST", `https://skyscanner-api.p.rapidapi.com/v3e/hotels/live/search/create`, key)
    options['data'] = { query }
    let result = await axios.request(options)
    return result.data
}

export async function hotelPollPageSearch(sessionToken: string, page: number, key?: string) {
    let options = generateOptions("GET", `https://skyscanner-api.p.rapidapi.com/v3e/hotels/live/search/poll/${page}/${sessionToken}`, key)
    let result = await axios.request(options)
    return result.data
}

export async function autosuggestFlights(query: AutosuggestFlightQuery, key?: string) {
    let options = generateOptions("POST", `https://skyscanner-api.p.rapidapi.com/v3/autosuggest/flights`, key)
    options['data'] = { query }
    let result = await axios.request(options)
    return result.data
}

export async function autosuggestHotels(query: AutosuggestHotelQuery, key?: string) {
    let options = generateOptions("POST", `https://skyscanner-api.p.rapidapi.com/v3/autosuggest/hotels`, key)
    options['data'] = { query }
    let result = await axios.request(options)
    return result.data
}
