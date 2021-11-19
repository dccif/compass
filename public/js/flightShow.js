(function ($) {
    let flighShow = $('#flightShow')
    let ticketList = $('#ticketList')
    let airform = $('#airline-pick')
    let errorShow = $('#errorShow')

    function combineObj(dataArray) {
        let obj = {}
        let keyData, valueData
        $.each(dataArray, function () {
            item = $(this)
            keyData = filterXSS(item[0].name)
            valueData = filterXSS(item[0].value)
            obj[keyData] = valueData
        })
        return obj
    }


    $(document).ajaxStart(function () {
        $("#loadingAni").show();
        let btn = $('.btn')
        btn.on('click', function () {
            $(this).addClass('btn__progress');
            setTimeout(function () {
                btn.addClass('btn__progress--fill')
            }, 500);
            setTimeout(function () {
                btn.removeClass('btn__progress--fill')
            }, 4100);
            setTimeout(function () {
                btn.addClass('btn__complete')
            }, 4400);
        })
    })

    airform.submit(function (e) {
        e.preventDefault()
        let formData = airform.serializeArray()

        let queryParam = combineObj(formData)

        let requestConfig = {
            method: 'POST',
            url: '/price/airline',
            data: queryParam
        }

        $.when(
            $.ajax(requestConfig).then(function (responseMessage) {
                errorShow.empty()
                console.log(responseMessage)
                if (responseMessage.data !== undefined) {
                    responseMessage.data.forEach((item) => {
                        ticketList.append(`<li><div class="card"><div class="card-body">from ${item.itineraries[0].segments[0].departure.iataCode}</div><div class="card-body">to ${item.itineraries[0].segments[0].arrival.iataCode}</div><div class="card-body">Price ${item.price.base}</div></div></li>`)
                    })
                } else {
                    errorShow.append(`<h1>Error ticket info</h1>`)
                }
            })
        ).done(function (response) {
            setTimeout(() => {
                $("#loadingAni").hide()
            }, 2000)
        })
    })

})(window.jQuery)