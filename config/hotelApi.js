let apiKey =
    {
        'x-rapidapi-key': 'b2e977b2e9msh77b94e0ede0d61dp101aa8jsn3a7448b904a0',
        'x-rapidapi-host': 'hotels4.p.rapidapi.com'
    }

let amadeusKey = {
    'apiKey': 'PovUwJikGBhouqNwJ0mVMAdYgXMOk8qg',
    'apiSecret': 'eI6KdFq90VwchZSV'
}

let locApiOptions = {
    method: 'GET',
    url: 'https://hotels4.p.rapidapi.com/locations/search',
    headers: apiKey
};

let hotelApiOptions = {
    method: 'Get',
    url: 'https://hotels4.p.rapidapi.com/properties/list',
    headers: apiKey
}

let amadeusTokenOptions = {
    method: 'POST',
    url: 'https://test.api.amadeus.com/v1/security/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: `grant_type=client_credentials&client_id=${amadeusKey.apiKey}&client_secret=${amadeusKey.apiSecret}`
}

module.exports = {
    locQ: locApiOptions,
    hotQ: hotelApiOptions,
    amadeusToken: amadeusTokenOptions
}