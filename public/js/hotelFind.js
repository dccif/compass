(function ($) {
    let hotelFind = $('#Hotel')
    let inVal

    hotelFind.on('keypress', function (e) {
        inVal = filterXSS(hotelFind.val())
        let newUrl;
        if (e.which === 13) {
            if (inVal.trim() !== null) {
                newUrl = `/price/hotel/${inVal}`
                window.location.href = newUrl
            }
        }
    })

})(window.jQuery)