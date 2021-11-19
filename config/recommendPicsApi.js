const apiKey = {
    'X-Triposo-Account': 'T9TV2POT',
    'X-Triposo-Token': '2wve45tezxoq0kvv3dpd4odygaeb50rq'
}

let recommendPicsApiOptions = {
    method: 'GET',
    url: 'https://www.triposo.com/api/20201111/poi.json?location_id=wv__Beijing&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq',
    headers: apiKey
}

module.exports = {
    rPicQ: recommendPicsApiOptions,
}