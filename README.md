# Javascript client library for [Skyscanner API](https://rapidapi.com/rpi4gx/api/skyscanner-api)

:warning: This library requires a valid Rapid API key to access Skyscanner API. A Rapid API key can easily be obtained on https://rapidapi.com/.

---
## Getting started
```bash
$ npm install rapidapi-skyscanner
```
## Examples:
All examples require an environment variable `RAPIDAPI_KEY` set to the user's key.
```bash
$ export RAPIDAPI_KEY=my_key_from_rapidapi_here
```
### Flights - One way flight search:
```js
const skyscanner = require('rapidapi-skyscanner')
import { FlightQuery, CabinClass } from "rapidapi-skyscanner"

(async () => {
    let query: FlightQuery = {
        market: "UK",
        locale: "en-GB",
        currency: "EUR",
        queryLegs: [
            {
                originPlaceId: {
                    "iata": "LHR"
                },
                destinationPlaceId: {
                    "iata": "DXB"
                },
                date: {
                    year: 2023,
                    month: 9,
                    day: 20
                }
            }
        ],
        cabinClass: CabinClass.CABIN_CLASS_ECONOMY,
        adults: 2,
        childrenAges: [
            3,
            9
        ]
    }
    let response = await skyscanner.flightSyncSearch(query)
    console.log(JSON.stringify(response))
})()

```
Using asynchronous API endpoints:
```js
...
    let response = await skyscanner.flightAsyncCreateSearch(query)
    while (response.status == "RESULT_STATUS_INCOMPLETE") {
        response = await skyscanner.flightAsyncPollSearch(response.sessionToken)
        await new Promise(r => setTimeout(r, 2000)); // sleep for 2 secs
    }
    console.log(JSON.stringify(response))
...
```

### Hotels
```js
const skyscanner = require('rapidapi-skyscanner')
import { HotelQuery } from "rapidapi-skyscanner"

(async () => {
    let query: HotelQuery = {
        market: "UK",
        locale: "en-GB",
        currency: "GBP",
        adults: 2,
        placeId: {
            entityId: "27539564"
        },
        checkInDate: {
            year: 2023,
            month: 9,
            day: 3
        },
        checkOutDate: {
            year: 2023,
            month: 9,
            day: 12
        },
        rooms: 1,
        childrenAges: [
            4,
            2
        ],
        sortBy: "RELEVANCE_DESC"
    }
    let response = await skyscanner.hotelCreateSearch(query)
    console.log(JSON.stringify(response))
})()

```
Pull all pages from previous hotel search:
```js
...
    let nPages = response.totalPages
    for (let page=1; page <nPages; page++) {
        response =  await skyscanner.hotelPollPageSearch(response.sessionToken, page)
        console.log(JSON.stringify(response))
    }
...
```
