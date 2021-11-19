const express = require("express")
const axios = require('axios')
const router = express.Router()
const hotelApi = require('../config/hotelApi')
const citydata = require('../data')

let errorBox = []

async function renderHotelList(data, res) {
    let results = citydata.cityQuery.getCityDestinationIdlList(data)

    try {
        let hotelList = await queryHotelList(results.desIdArray)
        res.render('layouts/hotel',
            {
                location: results.cityList,
                hotels: hotelList
            })

    } catch (error) {
        res.render('layouts/error',
            {errorMes: error})
    }
}

async function queryHotelList(data) {
    let nowDate = new Date()
    let inData = nowDate.toISOString().split('T')[0]
    let outData = new Date(nowDate.setDate(nowDate.getDate() + 3)).toISOString().split('T')[0]

    let queryParms = {
        pageNumber: '1',
        checkIn: inData,
        checkOut: outData,
        pageSize: '25',
        adults1: '1',
        currency: 'USD',
        locale: 'en_US',
        sortOrder: 'PRICE'
    }

    let hotelList = []
    for (i of data) {
        queryParms.destinationId = i
        hotelApi.hotQ.params = queryParms
        hotelList.push(await axios.request(hotelApi.hotQ).then(function (response) {
            //console.log(response.data.data.body.searchResults.results)
            return response.data.data.body.searchResults.results
        }).catch(function (error) {
            console.log(error)
            res.render('layouts/error', {errorMes: error})
        }))
    }
    return hotelList
}

router.get('/hotel/:loc', async (req, res) => {
    const locQuery = req.params.loc.trim()
    const localelang = req.headers["accept-language"].split(',')[0]
    if (locQuery !== null) {
        const queryData = await citydata.cityQuery.queryCity(locQuery)
        renderHotelList(queryData, res)
    }
})

router.get('/meal', async (req, res) => {
    // const locQuery = req.params.loc.trim()
    // if (locQuery !== null) {
    res.render('layouts/meal')
    // } else {
    //     let messErr = 'No location'
    //     res.render('layouts/error',
    //         {errorMes: messErr})
    // }
})

router.get('/airline/:loc', async function (req, res) {
    const locQuery = req.params.loc.trim()
    try {
        await citydata.cityQuery.queryCity(locQuery)
    } catch (error) {
        res.render('layouts/error',
            {errorMes: error})
    }
    if (locQuery !== null) {
        //console.log(await citydata.cityQuery.getIATAList(locQuery))
    }
})

router.get('/airline', async function (req, res) {
    res.render('layouts/airline')
})

router.post('/airline', async function (req, res) {
    const locQuery = req.body
    let oriCity = (await citydata.cityQuery.getCityAirportIATA(locQuery.originLocationCode))[0]
    let destCity = (await citydata.cityQuery.getCityAirportIATA(locQuery.destinationLocationCode))[0]
    locQuery.originLocationCode = oriCity
    locQuery.destinationLocationCode = destCity

    try {
        let resu = await citydata.cityQuery.queryAirTicket(locQuery)
        console.log(resu)
        res.json(resu)
    } catch (error) {
        errorBox.push(error)
        res.redirect('/price/error')
    }
})

router.get('/apiTest', async function (req, res) {
    // let token = await amadeusGetToken()
    // console.log(token)
    //
    // let config = {
    //     headers: {Authorization: `Bearer ${token}`}
    // }

    let queryParams = {
        originLocationCode: 'SYD',
        destinationLocationCode: 'BKK',
        departureDate: '2021-02-01',
        adults: 1,
    }
    citydata.cityQuery.queryAirTicket(queryParams)
    // let queryUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${queryParams.originLocationCode}&destinationLocationCode=${queryParams.destinationLocationCode}&departureDate=${queryParams.departureDate}&adults=${queryParams.adults}&nonStop=false&max=250`
    // await axios.get(queryUrl, config).then(async (response) => {
    //     console.log(response.data)
    // })
})

router.get('error', async function (req, res) {
    console.log(errorBox)
    res.render('layouts/error',
        {errorMes: errorBox.pop()})
})

module.exports = router