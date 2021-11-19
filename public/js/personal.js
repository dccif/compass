var planList = $("#plan-List");
var planItem = $("#planItem");
var login_button = $("#login-button");
var logout_button = $("#logout-button");
var logList = $("#logList");
var thelogs = $("#logMainList");
var reviewList = $("#reviewList");
var userreviewList = $("#userreviewList");

planItem.hide();
logout_button.hide();
$("#loginInfo").append('<div>You have logged in the account.</div>');

function mainLogs() {
    var mainLogs = {
        method: 'GET',
        url: '/login/database/mainlogs',
        contentType: 'application/json'
    };

    $.ajax(mainLogs).then(function (responseMessage) {
        var newElement = $(responseMessage);
        thelogs.append($("<dl>"));
        for (let i of newElement) {
            var temp = '';
            var c = 0;
            for (let j of i.addition.plansLocation) {
                if (c !== i.addition.plansLocation.length - 1) {
                    temp = temp + j.name + ' duration: ' + j.duration + '  -  ';
                    c++;
                }
                else {
                    temp = temp + j.name + ' duration: ' + j.duration;
                }
            }
            thelogs.append($("<dd class=" + i._id + ">" + temp + "</dd>"));
            thelogs.append($("<dd class=" + i._id + ">Starttime: " + i.addition.plansLocation[0].startDate + "</dd>"));
            thelogs.append($("<div class=" + i._id + ">" + '----------------' + "</div>"));
            thelogs.append($("<dt><a class='loghref1' id=" + "loghref1" + i._id + " href='http://localhost:3000/login/personal/plans'>" + i.title + "</a></dt>"));
            thelogs.append($("<dt class=" + i._id + ">" + i.feel + "<br></dt>"));
            thelogs.append($("<div class=" + i._id + "><br></div>"));
            thelogs.append($("<dt class=" + i._id + ">Author: " + i.addition.username + "</dt>"));
            thelogs.append($("<dt class=" + i._id + ">Created: " + i.date + "<br></dt>"));
            thelogs.append($("<dd class=" + i._id + ">Reading: " + i.reading + "</dd>"));
            thelogs.append($("<dd class=" + i._id + ">Like: " + i.like + "</dd>"));
            thelogs.append($("<div class=" + i._id + "><br></div>"));
            thelogs.append($("<button class='make-review' id=" + "mainlog" + i._id + ">review</button>"));
            thelogs.append($("<div id=" + "logreview" + i._id + "><label for=" + "logreviewinput" + i._id + ">Type your thinking：</label><input id=" + "logreviewinput" + i._id + " type='text' name='log-review' /></div>"));
            thelogs.append($("<button class='logreviewsubmit' id=" + "logreviewsubmit" + i._id + ">submit</button>"));
            thelogs.append($("<button class='logreviewliked' id=" + "logreviewliked" + i._id + ">Like it? Save it!</button>"));
            thelogs.append($("<div class=" + i._id + "><br><br></div>"));
            $('#logreview' + i._id).hide();
            $('#logreviewsubmit' + i._id).hide();
        }
        thelogs.append($("</dl>"));

        var logreviewId;
        var logReview;
        var logreviewsubmit;
        var logreviewinput;

        $(".make-review").click(function (event) {
            event.preventDefault();
            logreviewId = $(this).attr('id').substring(7);
            logReview = "logreview" + logreviewId;
            logreviewsubmit = "logreviewsubmit" + logreviewId;
            logreviewinput = "logreviewinput" + logreviewId;
            $('#' + logReview).show();
            $('#' + logreviewsubmit).show();
        });

        $(".logreviewsubmit").click(function (event) {
            var makelogreview = {
                method: 'POST',
                url: '/login/makereview',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: logreviewId,
                    logReview: $("#" + logreviewinput).val()
                })
            };
        
            $.ajax(makelogreview).then(function (responseMessage) {
                var newElement = $(responseMessage);
                if (newElement[0].status === false) {
                    $("#" + logreviewsubmit).append($("<div>You have to login first!</div>"));
                }
                //if (newElement[0].status === true) {
                else {
                    $('#' + logReview).hide();
                    $('#' + logreviewsubmit).hide();
                    $("#" + logreviewinput).empty();
                    $("#mainlog" + logreviewId).text("reviewed");
                }
            });
        });

        $(".logreviewliked").click(function (event) {
            event.preventDefault();
            var logId = $(this).attr('id').substring(14);
            var logliked1 = {
                method: 'POST',
                url: '/login/database/logsUpdate',
                contentType: 'application/json',
                data: JSON.stringify({
                    logId: logId,
                    like: 1
                })
            };

            $.ajax(logliked1).then(function (responseMessage) {
                var newElement = $(responseMessage);
                if (newElement[0].status === false) {
                    $("#logreviewliked" + logId).append($("<div>You have to login first!</div>"));
                }
                else {
                    $("#logreviewliked" + logId).text("saved!");
                }
            });
        });

        $(".loghref1").click(function (event) {
            event.preventDefault();
            var logId = $(this).attr('id').substring(8);
            var logreading1 = {
                method: 'POST',
                url: '/login/database/logsUpdate',
                contentType: 'application/json',
                data: JSON.stringify({
                    logId: logId,
                    reading: 1
                })
            };

            $.ajax(logreading1).then(function (responseMessage) {
                var newElement = $(responseMessage);
                $(location).attr('href', 'http://localhost:3000/login/personal/getlogs');
            });
        });
    });
}

        // $(function() {
        //     $('#logMainPage').unbind("scroll").bind("scroll", function(e) {
        //         var scrollTop = $(this).scrollTop(),scrollHeight = $(document).height(),windowHeight = $(this).height();
        //         var positionValue = (scrollTop + windowHeight) - scrollHeight;
        //         var sum = this.scrollHeight;  
        //         if (sum <= $(this).scrollTop() + $(this).height()) {  
        //             console.log(newElement);
        //     // for (let i of newElement) { 
        //     //     thelogs.append($("<dd class=" + i._id + ">" + i.title + "</dd>"));
        //     // }   
        //         }  
        //     });
        // });

function checkLogStatus() {
    $(function () {
        var checkStatus = {
            method: 'GET',
            url: '/login/status',
            contentType: 'application/json'
        };

        $.ajax(checkStatus).then(function (responseMessage) {
            var newElement = $(responseMessage);
            if (newElement[0].status === true) {
                login_button.hide();
                logout_button.show();
            }
            else {
                login_button.show();
                logout_button.hide();
            }
        });
    });
}

function getLog() {
    var getlog = {
        method: 'GET',
        url: '/login/database/logs',
        contentType: 'application/json'
    };

    $.ajax(getlog).then(function (responseMessage) {
        var newElement = $(responseMessage);
        logList.append($("<dl>"));
        for (let i of newElement) {
            var temp = '';
            var c = 0;
            for (let j of i.addition.plansLocation) {
                if (c !== i.addition.plansLocation.length - 1) {
                    temp = temp + j + '-';
                    c++;
                }
                else {
                    temp = temp + j;
                }
            }
            logList.append($("<dd class=" + i._id + ">" + temp + "</dd>"));
            logList.append($("<div class=" + i._id + ">" + '----------------' + "</div>"));
            logList.append($("<dt><a class='loghref' id=" + "loghref" + i._id + " href='http://localhost:3000/login/personal/plans'>" + i.title + "</a></dt>"));
            //logList.append($("<form id='submitanother' method='post' action='/login/personal/getlogs'><input type='hidden' name='description' value=" + i.feel + "/>"));
            //logList.append($("<a href='http://localhost:3000/login/personal/getlogs' οnclick='document.getElementById('submitanother').submit();' class='loghref' id=" + "loghref" + i._id + ">" + i.title + "<br></a></form>"));
            logList.append($("<dt id=" + "tlog" + i._id + " class=" + i._id + ">" + i.feel + "<br></dt>"));
            logList.append($("<div class=" + i._id + "><br></div>"));
            logList.append($("<dt class=" + i._id + ">Author: " + i.addition.username + "<br></dt>"));
            logList.append($("<dt class=" + i._id + ">Created: " + i.date + "<br></dt>"));
            logList.append($("<dd class=" + i._id + ">Reading: " + i.reading + "</dd>"));
            logList.append($("<dd class=" + i._id + ">Like: " + i.like + "</dd>"));
            logList.append($("<button class='close-sign1' id=" + i._id + ">&times</button>"));
            logList.append($("<div class=" + i._id + "><br><br></div>"));
        }
        logList.append($("</dl>"));

        $(".loghref").click(function (event) {
            event.preventDefault();
            var logId = $(this).attr('id').substring(7);
            
        //console.log(logId);
            var logreading = {
                method: 'POST',
                //url: '/login/database/logsUpdate',
                url: '/login/database/logsUpdate',
                contentType: 'application/json',
                data: JSON.stringify({
                    logId: logId,
                    reading: 1
                })
            };
        
            $.ajax(logreading).then(function (responseMessage) {
                var newElement = $(responseMessage);
                //$(location).attr('href', 'http://localhost:3000/login/personal/plans');
                $(location).attr('href', 'http://localhost:3000/login/personal/getlogs');
            });
            //getReviews(logId);
        });

        $(".close-sign1").click(function (event) {
            event.preventDefault();
            var item = $(this).attr('id');
            $('.' + item).hide();
            $('#tlog' + item).hide();
            $('#' + item).hide();
            $('.loghref').hide();
            var logdelete = {
                method: 'POST',
                url: '/login/database/logsdelete',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: item
                })
            };

            $.ajax(logdelete).then(function (responseMessage) {
                var newElement = $(responseMessage);
            });
        });
        
    });
}

function getPlan() {
    var requestConfig = {
        method: 'GET',
        url: '/login/database/plans',
        contentType: 'application/json'
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        planList.append($("<dl>"));
        for (let i of newElement) {
            //JSON.stringify(i.nodes);

            planList.append($(`<div id='specialList${i._id}'>`));
            for (let j = 0; j < i.nodes[0].length; j++) {
                if (i.nodes[0][j].type == "start") {
                    
                    planList.append($(`<ol id="ol-${i}">Type: ${i.nodes[0][j].type}    Day: ${i.nodes[0][j].day + 1}</ol>`));
                    planList.append($(`<li>Departure at: ${i.nodes[0][j].startNode.location_id}</li>`));
                    let startDate = new Date(i.nodes[0][j].startNode.startDate);
                    planList.append($(`<li>Departure time: ${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}</li>`));
                } else if (i.nodes[0][j].type == "traffic") {
                    planList.append($(`<ol id="ol-${i}">Type: ${i.nodes[0][j].type}    Day: ${i.nodes[0][j].day + 1}</ol>`));
                    planList.append($(`<li>From: ${i.nodes[0][j].route.legs[0].start_address}</li>`));
                    planList.append($(`<li>To: ${i.nodes[0][j].route.legs[0].end_address}</li>`));
                    planList.append($(`<li>Distance: ${i.nodes[0][j].route.legs[0].distance.text}</li>`));
                    planList.append($(`<li>Duration: ${i.nodes[0][j].route.legs[0].duration.text}</li>`));
                    planList.append($(`<li>Travel mode: ${i.nodes[0][j].route.legs[0].steps[0].travel_mode}</li>`));
                } else if (i.nodes[0][j].type == "flight") {
                    planList.append($(`<ol id="ol-${i}">Type: ${i.nodes[0][j].type}    Day: ${i.nodes[0][j].day + 1}</ol>`));
                    planList.append($(`<li>Departure iata code: ${i.nodes[0][j].flight.itineraries[0].segments[0].departure.iataCode}</li>`));
                    planList.append($(`<li>Departure terminal: ${i.nodes[0][j].flight.itineraries[0].segments[0].departure.terminal}</li>`));
                    planList.append($(`<li>Departure time: ${i.nodes[0][j].flight.itineraries[0].segments[0].departure.at}</li>`));
                    let length = i.nodes[0][j].flight.itineraries[0].segments.length;
                    planList.append($(`<li>Arrival iata code: ${i.nodes[0][j].flight.itineraries[0].segments[length - 1].arrival.iataCode}</li>`));
                    planList.append($(`<li>Arrival terminal: ${i.nodes[0][j].flight.itineraries[0].segments[length - 1].arrival.terminal}</li>`));
                    planList.append($(`<li>Arrival time: ${i.nodes[0][j].flight.itineraries[0].segments[length - 1].arrival.at}</li>`));
                } else if (i.nodes[0][j].type == "poi") {
                    planList.append($(`<ol id="ol-${i}">Type: ${i.nodes[0][j].type}    Day: ${i.nodes[0][j].day + 1}</ol>`));
                    planList.append($(`<li>Target place: ${i.nodes[0][j].poi.name}</li>`));
                    planList.append($(`<li>Duration: ${i.nodes[0][j].poi.duration} mins</li>`));
                }
            }

            planList.append($("</div>"));


           // planList.append($("<dt><a href='http://localhost:3000' class=" + i._id + ">" + i.nodes[0].startDate + "..." + "</a></dt>"));
            //for (let j of i.nodes) {
             //   planList.append($("<dt><a href='http://localhost:3000' class=" + i._id + ">" + j.name + " Duration: " + j.duration + "..." + "</a></dt>"));
           // }
           // planList.append($("<dt><a href='http://localhost:3000' class=" + i._id + ">" + i.nodes[1].name + "..." + "</a></dt>"));
            //planList.append($("<dt><a href='http://localhost:3000' class=" + i._id + ">" + i.nodes[0].position + "..." + "</a></dt>"));
            //planList.append($("<dd class=" + i._id + ">Arrival Time: " + i.nodes[0].arrival_time + "</dd>"));
            //planList.append($("<dd class=" + i._id + ">Departure Time: " + i.nodes[0].departure_time + "</dd>"));
            planList.append($("<button class='make-log' id=" + "log" + i._id + ">Make your log</button>"));
            planList.append($("<div id=" + "logtitle" + i._id + "><label>Make a title of this log：</label><input id=" + "loginput" + i._id + " type='text' name='log-title' /></div>"));
            planList.append($("<div id=" + "logfeel" + i._id + "><label>What is your thought of this trip：</label><input id=" + "loginput1" + i._id + " type='text' name='log-feel' /></div>"));
            //planList.append($("<div id=" + "logfeel" + i._id + "><label>What is your thought of this trip：</label><textarea id=" + "loginput1" + i._id + "name='log-feel' cols='30' rows='3'></textarea></div>"));
            planList.append($("<button class='logsubmit' id=" + "logsubmit" + i._id + ">submit</button>"));
            planList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
            planList.append($("<div id="+ "space" + i._id + "><br><br></div>"));
            $('#logtitle' + i._id).hide();
            $('#logfeel' + i._id).hide();
            $('#logsubmit' + i._id).hide();
        }
        planList.append($("</dl>"));

        var planId;
        var logTitle;
        var logFeel;
        var logsubmit;
        var loginput;
        var loginput1;

        $(".make-log").click(function (event) {
            event.preventDefault();
            planId = $(this).attr('id').substring(3);
            logTitle = "logtitle" + planId;
            logFeel = "logfeel" + planId;
            logsubmit = "logsubmit" + planId;
            loginput = "loginput" + planId;
            loginput1 = "loginput1" + planId;
            $('#' + logTitle).show();
            $('#' + logFeel).show();
            $('#' + logsubmit).show();
        });

        $(".logsubmit").click(function (event) {
            var makelog = {
                method: 'POST',
                url: '/login/makelog',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: planId,
                    logtitle: $("#" + loginput).val(),
                    logfeel: $("#" + loginput1).val()
                })
            };
        
            $.ajax(makelog).then(function (responseMessage) {
                var newElement = $(responseMessage);
                if (newElement[0].status === true) {
                    $('#' + logTitle).hide();
                    $('#' + logFeel).hide();
                    $('#' + logsubmit).hide();
                    $('#space' + planId).hide();
                    $("#" + loginput).empty();
                    $("#" + loginput1).empty();
                    $("#log" + planId).text('Finished');
                }
            });
        });

        $(function () {
            $(".close-sign").click(function (event) {
                event.preventDefault();
                var item = $(this).attr('id');
                $('.' + item).empty();
                $('#' + item).hide();
                $('#log' + item).hide();
                $('#logtitle' + item).hide();
                $('#logfeel' + item).hide();
                $(`#specialList${item}`).hide();
                $(location).attr('href', 'http://localhost:3000/login/personal/plans');
                var requestConfig1 = {
                    method: 'POST',
                    url: '/login/database/plansdelete',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        id: item
                    })
                };

                $.ajax(requestConfig1).then(function (responseMessage) {
                    var newElement = $(responseMessage);
                });
            });
        });
    });
}

function getReply() {
    $(".replyList2").click(function (event) {
        event.preventDefault();
        var reviewIdss = $(this).attr('id').substring(10);
        var replyinput = "replyinput" + $(this).attr('id').substring(10);
        var putreply = {
            method: 'POST',
            url: '/login/database/writereplies',
            contentType: 'application/json',
            data: JSON.stringify({
                reviewId: reviewIdss,
                replyinput: $("#" + replyinput).val()
            })
        };

        $.ajax(putreply).then(function (responseMessage) {
            var newElement = $(responseMessage);
            if (newElement[0].status === false) {
                $("#replyList2" + reviewIdss).append($("<div>You have to login first!</div>"));
            }
            $("#" + replyinput).empty();
        });
    });

    $(".replyList1").click(function (event) {
        event.preventDefault();
        var reviewIds = $(this).attr('id').substring(10);
        var getreply = {
            method: 'POST',
            url: '/login/database/replies',
            contentType: 'application/json',
            data: JSON.stringify({
                reviewId: reviewIds
            })
        };
        var replyListId = "replyList" + reviewIds;
        var replyList = $("#" + replyListId);

        $.ajax(getreply).then(function (responseMessage) {
            var newElement = $(responseMessage);
            replyList.empty();
            replyList.append($("<dl>"));
            for (let i of newElement) {
                replyList.append($("<div class=" + i._id + ">" + i.username + ": " + i.content + "</div>"));
                replyList.append($("<div class=" + i._id + ">Created: " + i.date + "</div>"));
                replyList.append($("<div class=" + i._id + "><br></div>"));
            }
            replyList.append($("</dl>"));
        });
    });
}

$("#logout-button").click(function (event) {
    event.preventDefault();
    var logout = {
        method: 'GET',
        url: '/login/logout',
        contentType: 'application/json'
    };

    $.ajax(logout).then(function (responseMessage) {
        var newElement = $(responseMessage);
    });
});

function getReviews() {
    var getReviews = {
        method: 'GET',
        url: '/login/database/getreviews',
        contentType: 'application/json'
    };

    $.ajax(getReviews).then(function (responseMessage) {
        var newElement = $(responseMessage);
        userreviewList.append($("<dl>"));
        for (let i of newElement) {
            userreviewList.append($("<div class=" + i._id + ">" + '----------------' + "</div>"));
            userreviewList.append($("<div class=" + i._id + ">" + i.content + "</div>"));
            userreviewList.append($("<div class=" + i._id + "><br></div>"));
            userreviewList.append($("<dt class=" + i._id + ">Author: " + i.addition + "<br></dt>"));
            userreviewList.append($("<dt class=" + i._id + ">Created: " + i.date + "<br></dt>"));
            userreviewList.append($("<button class='close-sign2' id=" + i._id + ">&times</button>"));
            userreviewList.append($("<div class=" + i._id + "><br><br></div>"));
        }
        userreviewList.append($("</dl>"));

        $(".close-sign2").click(function (event) {
            event.preventDefault();
            var item = $(this).attr('id');
            $('.' + item).hide();
            $('#' + item).hide();
            var logdelete = {
                method: 'POST',
                url: '/login/database/reviewsdelete',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: item
                })
            };

            $.ajax(logdelete).then(function (responseMessage) {
                var newElement = $(responseMessage);
            });
        });
        
    });
}

checkLogStatus();
getPlan();
getLog();
mainLogs();
getReply();
getReviews();