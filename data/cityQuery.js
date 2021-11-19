const axios = require('axios')
const streamArray = require('stream-json/streamers/StreamArray')
const Fuse = require('fuse.js')
const fs = require('fs')
const hotelApi = require('../config/hotelApi')

// read Airport JSON
let airportData = []

const jsonStream = streamArray.withParser()

const jsonPipe = fs.createReadStream('./data/airports.json').pipe(jsonStream.input)

jsonStream.on('data', ({key, value}) => {
    airportData.push({key, value})
})

jsonStream.on('end', () => {
    console.log('Airport json read all done')
})

let cityInfo
let cityTransport = []

function getTransportList(data) {
    cityTransport = data.suggestions.find(o => {
        return o.group === 'TRANSPORT_GROUP'
    }).entities
    return cityTransport
}

function getAirportNameList(data) {
    return getTransportList(data).filter(o => o.type === 'AIRPORT').map(o => o.name);
}

function getCityDestinationIdlList(data) {
    cityList = data.suggestions.find(o => {
        return o.group === 'CITY_GROUP'
    }).entities
    let desIdArray = []
    for (i of cityList) {
        desIdArray.push(i.destinationId)
    }
    return {cityList, desIdArray}
}

async function queryCity(name) {
    let queryParms = {
        query: name,
        locale: 'en_US'
    }
    if (name !== null) {
        hotelApi.locQ.params = queryParms
        return await axios.request(hotelApi.locQ).then(async function (response) {
            //console.log(response.data)
            cityInfo = response.data
            return response.data
        }).catch(function (error) {
            console.log(error)
        })
    }
}

async function getIATAList(name) {
    let cityInfo = await queryCity(name)
    let nameList = getAirportNameList(cityInfo)

    let keyName = []
    for (i of nameList) {
        if (i.includes('(')) {
            keyName.push(i.split('(')[1].substr(0, 3))
        } else {
            keyName.push(i.split(',')[0])
        }
    }

    let iataList = []
    //fuse config
    const options = {
        includeScore: true,
        shouldSort: true,
        threshold: 0.3,
        keys: ['value.name', 'value.iata']
    }
    const fuse = new Fuse(airportData, options)

    for (i of keyName) {
        iataList.push(fuse.search(i).map(o => o.item.value.iata)[0])
    }

    iataList = iataList.filter(o => o !== undefined)

    return iataList
}

async function getCityAirportIATA(name) {
    return getIATAList(name)
}

function combineQueryUrl(obj) {
    let requiredUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${obj.originLocationCode}&destinationLocationCode=${obj.destinationLocationCode}&departureDate=${obj.departureDate}&adults=${obj.adults}`
    if (obj.hasOwnProperty('returnData')) {
        requiredUrl += `&returnData=${obj.returnData}`
    }
    if (obj.hasOwnProperty('childrenQuery')) {
        requiredUrl += `&children=${obj.childrenQuery}`
    }
    if (obj.hasOwnProperty('infants')) {
        requiredUrl += `&infants=${obj.infants}`
    }
    if (obj.hasOwnProperty('travelClass')) {
        requiredUrl += `&travelClass=${obj.travelClass}`
    }
    if (obj.hasOwnProperty('includedAirlineCodes')) {
        requiredUrl += `&includedAirlineCodes=${obj.includedAirlineCodes}`
        if (obj.hasOwnProperty('excludedAirlineCodes'))
            delete obj.excludedAirlineCodes
    }
    if (obj.hasOwnProperty('excludedAirlineCodes')) {
        requiredUrl += `&excludedAirlineCodes=${obj.excludedAirlineCodes}`
        if (obj.hasOwnProperty('includedAirlineCodes'))
            delete obj.includedAirlineCodes
    }
    if (obj.hasOwnProperty('nonStop')) {
        requiredUrl += `&nonStop=${obj.nonStop}`
    }
    if (obj.hasOwnProperty('currencyCode')) {
        requiredUrl += `&currencyCode=${obj.currencyCode}`
    }
    if (obj.hasOwnProperty('maxPrice')) {
        requiredUrl += `&maxPrice=${obj.maxPrice}`
    }
    if (obj.hasOwnProperty('max')) {
        requiredUrl += `&max=${obj.max}`
    }
    return requiredUrl
}


async function amadeusGetToken() {
    return await axios.request(hotelApi.amadeusToken).then(async function (response) {
        return response.data.access_token
    })
}

async function queryAirTicket(paramsObj) {
    let queryUrl = combineQueryUrl(paramsObj)

    let config = {
        headers: {Authorization: `Bearer ${await amadeusGetToken()}`}
    }
    return await axios.get(queryUrl, config).then(async (response) => {
        //console.log(response.data)
        return response.data
    })
}

module.exports = {
    queryCity,
    getIATAList,
    getCityAirportIATA,
    getCityDestinationIdlList,
    queryAirTicket
}