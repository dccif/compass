const express = require('express');
const axios = require('axios');
const router = express.Router();
const recommendPicsApi = require('../config/recommendPicsApi');
const fs = require('fs');

router.get('/', async (req, res) => {
    try {
        let picsData = await getPicsData();
        let picsDataList = queryLists(picsData);

        res.render('travel/recommend', { title: "Travel Consulter", picsData: picsDataList });
    } catch (e) {
        res.render('travel/error', { status: 500, message: e.message });
    }
});

async function getPicsData(locationId) {

    if (locationId) {
        /*
            cause my network problem, them following code can only run with effective network.
        */
        const queryData = await axios.request(`https://www.triposo.com/api/20201111/poi.json?location_id=${locationId}`
            + '&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq').then(async function (response) {
                return response.data
            }).catch(function (error) {
                console.log(error)
            })
    } else {

        const tagsLabels = [
            "subtype-Active_volcanoes|adrenaline",
            "poitype-Massage|poitype-Mountain",
            "music|poitype-Cafe",
            "poitype-Club|poitype-Convention_centre",
            "poitype-Cave|poitype-Canal",
            "poitype-Casino|poitype-Castle",
            "poitype-Cliff|poitype-Church|climate",
            "feature|hidden-Expensive|fishing",
            "sightseeing|poitype-Skyscraper",
            "sailing|poitype-Shipwrecks",
            "poitype-Fountain|golf",
            "poitype-Sight|poitype-Street",
            "poitype-Volcano|poitype-Tomb",
            "amusementparks|poitype-Bar|poitype-Canyon",
            "art|poitype-Art_gallery|architecture",
            "subtype-Natural_history_museums|poitype-Petting_zoo",
            "air|subtype-Football_stadiums|poitype-Park",
            "hiking|character-Crowded",
            "character-Quiet|wildlife",
            "poitype-Obelisk|rafting",
            "relaxinapark|poitype-River_cruise",
            "poitype-Shrine|showstheatresandmusic",
            "poitype-Shopping_centre|shopping",
            "poitype-Shopping_district|poitype-Tower",
            "poitype-Tunnel|poitype-Valley",
            "poitype-View_point|poitype-Water_ski",
            "poitype-Watermill|poitype-Waterfall",
            "watersports|character-Wheelchair_friendly",
            "poitype-Windmill|wintersport",
            "poitype-Wilderness_hut|whalewatching",
            "poitype-Wayside_shrine|zoos",
            "poitype-Theatre|poitype-Temple",
            "character-Romantic|poitype-Royal_guard",
            "poitype-Rock|riding",
            "cruises|sailing",
            "subtype-Sci-tech_museums|character-Shingle_beach",
            "poitype-Prison|poitype-Red-light_district",
            "private_tours|poitype-Pyramid",

        ]

        let i = Math.round(tagsLabels.length * Math.random());
        searchTag = tagsLabels[i];

        /*
            cause my network problem, them following code can only run with local json files.
        */
        const data = fs.readFileSync('data/rPicApiData.json', 'utf-8');
        const parsedData = JSON.parse(data);
        return parsedData

        /*
            cause my network problem, them following code can only run with effective network.
        */
        // const queryData = await axios.request(`https://www.triposo.com/api/20201111/poi.json?tag_labels=${searchTag}`
        //     + '&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq').then(async function (response) {
        //     return response.data
        // }).catch(function (error) {
        //     console.log(error)
        // })

    }
}

function queryLists(data) {
    if (data) {

        let dataLists = [];
        const imagePerPage = 6;

        const maxTime = 6;
        const minTime = 1;

        for (let i = 0; i < imagePerPage; i++) {

            let estimateDutation = 30 * Math.round((maxTime - minTime + 1) * Math.random() + minTime);
            JSON.stringify(estimateDutation);

            dataLists[i] = {

                name: data.results[i].name,
                url: data.results[i].images[0],
                location_id: data.results[i].location_id,
                snippet: data.results[i].snippet,
                coordinates: data.results[i].coordinates,
                score: data.results[i].score,
                booking_info: data.results[i].booking_info,
                attribution: data.results[i].attribution,
                price_tier: data.results[i].price_tier,
                duration: estimateDutation

            }
        }
        return dataLists
    } else throw new Error("no data");
}


module.exports = router;