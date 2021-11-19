//core algorithm
//unit of time in minutes
//node add duration attribution
const axios = require("axios");
const airports = require("./airports");
const iatas = require("./cityQuery");

let maxWaitTime = 180;//3 hours wait for flight
let minPrepareTime = 60;//1 hour prepare for flight
let dailyStartTime = 480;//8:00
let dailyEndTime = 1320;//22:00
let dailyMaxEndTime = 1440;//24:00
let maxFlightSearch = 20;

Date.prototype.clone = function () {
    return new Date(this.valueOf());
}

async function findLowestCostPlan(sourceNodeList) {
    //console.log("findlowest")
    //sourceNodeList index0=start position index length-1=end postion
    let startPositon = sourceNodeList[0];
    let endPosition = sourceNodeList[sourceNodeList.length - 1];
    sourceNodeList.splice(0, 1);
    //sourceNodeList.splice(sourceNodeList.length - 1, 1);
    //console.log("generate arrangement");
    let allPlans = generateArrangement(sourceNodeList, [], []);
    //console.log(allPlans[0]);
    //console.log(allPlans[1]);

    //console.log(allPlans);
    let allPlansWithCost = [];
    for (let i = 0; i < allPlans.length; i++) {
        let tempPlan = allPlans[i];
        tempPlan.splice(0, 0, startPositon);
        //console.log(tempPlan);
        //tempPlan.push(endPosition);
        let mPlan = await makePlan(tempPlan);
        //console.log(mPlan);
        if (mPlan.type == "faild") continue;
        else {
            allPlansWithCost.push(mPlan);
        }
    }
    let lowestCost = allPlansWithCost[0].cost;
    let planIndex = 0;
    for (let i = 0; i < allPlansWithCost.length; i++) {
        if (allPlansWithCost[i].cost <= lowestCost) {
            lowestCost = allPlansWithCost[i].cost;
            planIndex = i;
        }
    }
    console.log(allPlansWithCost[planIndex]);
    //console.log(allPlansWithCos)
    return allPlansWithCost[planIndex];
}

function generateArrangement(nodeList, currentPlan, planList) {
    if (nodeList.length == 0) {
        planList.push(currentPlan.concat());
        return planList;
    } else {
        for (let i = 0; i < nodeList.length; i++) {
            currentPlan.push(nodeList[i]);
            let temp=nodeList.splice(i, 1);
            planList=(generateArrangement(nodeList, currentPlan, planList));
            nodeList.splice(i, 0,temp[0]);
            currentPlan.splice(currentPlan.length-1,1);
        }
        return planList;
    }
}

//startNode location_id name startDate coordinates{latitude,longtitude} 
//return {plan duration endtime type cost}
async function makePlan(nodeList) {
    //startnode
    //console.log("makeplan");
    let day = 0;
    let cost = 0;
    let timePoint = dailyStartTime;
    let plan = [];
    let startNode = nodeList[0];
    //let endNode = nodeList[nodeList.length - 1];
    let startDate = new Date(startNode.startDate);
    let start = {
        type: "start",
        startNode: startNode,
        day: day
    }
    plan.push(start);
    //other nodes
    for (let i = 1; i < nodeList.length; i++) {
        if (timePoint >= dailyEndTime) {// past end time
            day++;
            timePoint = dailyStartTime;
        }
         console.log(nodeList[0].location_id);
         console.log(nodeList[1].location_id);
        if (isInSameCity(nodeList[i - 1].location_id, nodeList[i].location_id)) {
            //same city
            let trafficRoute = await getCityTraffic(nodeList[i - 1].coordinates, nodeList[i].coordinates);
            let duration = Math.ceil(trafficRoute.legs[0].duration.value / 60);
            if ((timePoint + duration) > dailyMaxEndTime) {
                //past acceptable end time
                day++;
                timePoint = dailyStartTime;
            }
            timePoint += duration;
            let trafficNode = {
                type: "traffic",
                route: trafficRoute,
                day: day
            }
            plan.push(trafficNode);
            let playDuration = nodeList[i].duration;
            if (timePoint > dailyEndTime || (timePoint + playDuration) > dailyMaxEndTime) {
                day++;
                timePoint = dailyStartTime;
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            }
        } else {
            // different city
            // find airport coordinates

            console.log(nodeList[i - 1].location_id);
            console.log(nodeList[i].location_id);
            let startIata = await getCityIata(nodeList[i - 1].location_id);
            let endIata = await getCityIata(nodeList[i].location_id);
            let startAirport = await findAirport(startIata);
            let endAirport = await findAirport(endIata);

            // console.log("startIata" + startIata)
            // console.log("endIata" + endIata)
            // console.log(startAirport)
            // console.log(endAirport)

            // traffic to airport
            let trafficRoute = await getCityTraffic(nodeList[i - 1].coordinates, startAirport);
            //console.log(trafficRoute.legs[0].duration.value / 60);
            let duration = Math.ceil(trafficRoute.legs[0].duration.value / 60);
            let tempStartDate = startDate.clone();
            //console.log(new Date(startDate));
            tempStartDate.setDate(tempStartDate.getDate() + day);
            console.log(startIata + "|" + endIata + "|" + tempStartDate + "|" + (timePoint + duration + minPrepareTime));
            let flight = await getFlight(startIata, endIata, tempStartDate, timePoint + duration + minPrepareTime);
            //transform flight timetable
            //let departureTime = transformFlightTime(flight.itineraries[0].segments[0].departure.at);
            //let arrivalTime = transformFlightTime(flight.itineraries[0].segments[0].arrival.at);
            if (!flight) {//当日没有航班
                //日期增加 查询新航班
                day++;
                timePoint = dailyStartTime;
                tempStartDate = startDate.clone();
                tempStartDate.setDate(tempStartDate.getDate() + day);
                flight = await getFlight(startIata, endIata, tempStartDate, timePoint + duration + minPrepareTime);
            }
            console.log(flight);
            if(!flight) return {type:"faild"};
            let departureTime = transformFlightTime(flight.itineraries[0].segments[0].departure.at);
            let flightDuration = convertPTToM(flight.itineraries[0].duration);
            let arrivalTime = departureTime + flightDuration;
            let pastDays = parseInt(arrivalTime / 1440);
            timePoint = arrivalTime % 1440;

            console.log("days" + day);
            console.log("tp" + timePoint);
            //arrivalTime = transformFlightTime(flight.itineraries[0].segments[0].arrival.at);
            let trafficNode = {
                type: "traffic",
                route: trafficRoute,
                day: day
            }
            plan.push(trafficNode);
            let flightNode = {
                type: "flight",
                flight: flight,
                day: day
            }
            day += pastDays;
            cost += parseFloat(flight.price.total);
            plan.push(flightNode);
            //timePoint = arrivalTime;
            // } else {
            //     let trafficNode = {
            //         type: "traffic",
            //         route: trafficRoute,
            //         day: day
            //     }
            //     plan.push(trafficNode);
            //     let flightNode = {
            //         type: "flight",
            //         flight: flight,
            //         day: day
            //     }
            //     cost += parseFloat(flight.price.total);
            //     plan.push(flightNode);
            //     timePoint = arrivalTime;
            // }
            //traffic from airport to poi
            let trafficRoute2 = await getCityTraffic(endAirport, nodeList[i].coordinates);
            let duration2 = Math.ceil(trafficRoute2.legs[0].duration.value / 60);
            if (timePoint >= dailyEndTime) {//exceed daily plan
                day++;
                timePoint = dailyStartTime;
                let trafficNode = {
                    type: "traffic",
                    route: trafficRoute2,
                    day: day
                }
                plan.push(trafficNode);
                timePoint += duration2;
            } else {
                if ((timePoint + duration2) > dailyMaxEndTime) {//exceed daily plan
                    day++;
                    timePoint = dailyStartTime;
                    let trafficNode = {
                        type: "traffic",
                        route: trafficRoute2,
                        day: day
                    }
                    plan.push(trafficNode);
                    timePoint += duration2;
                } else {
                    let trafficNode = {
                        type: "traffic",
                        route: trafficRoute2,
                        day: day
                    }
                    plan.push(trafficNode);
                    timePoint += duration2;
                }
            }
            let playDuration = nodeList[i].duration;
            if (timePoint > dailyEndTime || (timePoint + playDuration) > dailyMaxEndTime) {
                day++;
                timePoint = dailyStartTime;
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            }
        }

    }
    return {
        plan: plan,
        cost: cost,
        duration: day,
        type: "success"
    }
}

//
async function getFlight(startIata, endIata, startDate, startTime) {
    let lowestFlight;
    let latestStartTime = startTime + maxWaitTime;
    //console.log(startDate)
    //const { data } = await axios.get(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${startIata}&destinationLocationCode=${endIata}&departureDate=${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}&adults=1&max=${maxFlightSearch}`);
    let paramsObj = {
        originLocationCode: startIata,
        destinationLocationCode: endIata,
        departureDate: `${startDate.getFullYear()}-${("0" + (startDate.getMonth() + 1)).slice(-2)}-${startDate.getDate()}`,
        adults: 1,
        max: 20
    }
    let data = await iatas.queryAirTicket(paramsObj);
    let flightList = data.data;
    for (let i = 0; i < flightList.length; i++) {
        let dTime = transformFlightTime(flightList[i].itineraries[0].segments[0].departure.at);
        //console.log(dTime + "x");
        //console.log(startTime + "y");
        //console.log(latestStartTime + "z");
        if (dTime >= startTime) {
            if (!lowestFlight) {
                lowestFlight = flightList[i];
            } else if (flightList[i].price.total < lowestFlight.price.total) {
                lowestFlight = flightList[i];
            }
        }
    }
    return lowestFlight;
}

function isInSameCity(startLocation, endLocation) {
    return (startLocation == endLocation);
}

//commuting route in the city  
async function getCityTraffic(startCoordinates, endCoordinates) {
    //baidu api
    //const { data } = await axios.get(`http://api.map.baidu.com/direction_abroad/v1/transit?origin=${startCoordinates.latitude.toFixed(6)},${startCoordinates.longitude.toFixed(6)}&destination=${endCoordinates.latitude.toFixed(6)},${endCoordinates.longitude.toFixed(6)}&coord_type=wgs84&ak=up1toaVyKpIE6fXc9dqc4eItjbhICylS`);
    //google api
    let { data } = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startCoordinates.latitude.toFixed(6)},${startCoordinates.longitude.toFixed(6)}&destination=${endCoordinates.latitude.toFixed(6)},${endCoordinates.longitude.toFixed(6)}&key=AIzaSyDkFqsopNObdSVwPslxnZEFBOG6AVXeVgg&mode=traffic`);
    //console.log(data);
    //test data
    // let data = {
    //     "geocoded_waypoints": [
    //         {
    //             "geocoder_status": "OK",
    //             "place_id": "ChIJYSisacJS8DURHGsrPws35Uc",
    //             "types": ["route"]
    //         },
    //         {
    //             "geocoder_status": "OK",
    //             "place_id": "ChIJGyBw9t0F8TURVL4jTjr1fEk",
    //             "types": ["airport", "establishment", "point_of_interest"]
    //         }
    //     ],
    //     "routes": [
    //         {
    //             "bounds": {
    //                 "northeast": {
    //                     "lat": 40.0805387,
    //                     "lng": 116.5936159
    //                 },
    //                 "southwest": {
    //                     "lat": 39.9071492,
    //                     "lng": 116.3971038
    //                 }
    //             },
    //             "copyrights": "Map data ©2020",
    //             "legs": [
    //                 {
    //                     "distance": {
    //                         "text": "31.1 km",
    //                         "value": 31118
    //                     },
    //                     "duration": {
    //                         "text": "39 mins",
    //                         "value": 2324
    //                     },
    //                     "end_address": "Beijing Capital International Airport (PEK), Shunyi District, Beijing Shi, China",
    //                     "end_location": {
    //                         "lat": 40.0789024,
    //                         "lng": 116.5934993
    //                     },
    //                     "start_address": "Unnamed Road, Dongcheng Qu, Beijing Shi, China",
    //                     "start_location": {
    //                         "lat": 39.9163434,
    //                         "lng": 116.3971038
    //                     },
    //                     "steps": [
    //                         {
    //                             "distance": {
    //                                 "text": "0.9 km",
    //                                 "value": 933
    //                             },
    //                             "duration": {
    //                                 "text": "4 mins",
    //                                 "value": 231
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9079546,
    //                                 "lng": 116.3974974
    //                             },
    //                             "html_instructions": "Head \u003cb\u003esouth\u003c/b\u003e",
    //                             "polyline": {
    //                                 "points": "cdsrF{xleUxACl@AXAD?n@CLCT?`BCn@A`@AXA`AA|DGpBCdEGdDGxMWJ?"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9163434,
    //                                 "lng": 116.3971038
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.5 km",
    //                                 "value": 499
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 89
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9078952,
    //                                 "lng": 116.4032021
    //                             },
    //                             "html_instructions": "Turn \u003cb\u003eleft\u003c/b\u003e",
    //                             "maneuver": "turn-left",
    //                             "polyline": {
    //                                 "points": "uoqrFk{leUKqJC{ACyBA}AE{DEaFBEf@i@"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9079546,
    //                                 "lng": 116.3974974
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "17 m",
    //                                 "value": 17
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 3
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9077442,
    //                                 "lng": 116.4031585
    //                             },
    //                             "html_instructions": "Slight \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003e南池子大街\u003c/b\u003e",
    //                             "maneuver": "turn-slight-right",
    //                             "polyline": {
    //                                 "points": "koqrF__neU^F"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9078952,
    //                                 "lng": 116.4032021
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "1.3 km",
    //                                 "value": 1259
    //                             },
    //                             "duration": {
    //                                 "text": "4 mins",
    //                                 "value": 242
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9081752,
    //                                 "lng": 116.4179113
    //                             },
    //                             "html_instructions": "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003e东长安街\u003c/b\u003e",
    //                             "maneuver": "turn-left",
    //                             "polyline": {
    //                                 "points": "knqrFw~meUCgBCkCC}ACkCAo@CkCAI?u@Am@?K?c@Ai@AsBAK?a@EcEAg@?u@Am@Ao@A{ACiBAa@?IAkCAc@?KEkE?m@E{D?m@Ao@?m@?GAeA?uAEkCAm@Ao@CkBAW"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9077442,
    //                                 "lng": 116.4031585
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "1.5 km",
    //                                 "value": 1549
    //                             },
    //                             "duration": {
    //                                 "text": "3 mins",
    //                                 "value": 174
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9084983,
    //                                 "lng": 116.4360636
    //                             },
    //                             "html_instructions": "Continue onto \u003cb\u003e建国门内大街\u003c/b\u003e",
    //                             "polyline": {
    //                                 "points": "cqqrF}zpeU?G?c@Cw@?I?[CyD?o@Am@A}A?i@?E?[AiA?y@?EAkA?o@?AAe@?o@?GAu@?C?sA?SAgA?m@?}A?I?o@As@?YCgDAo@?q@AaA?W?e@?k@?CCoDAkC?SC}@?O?UA_CA}AAc@?a@?w@C_C?{@AgAE}EAm@A}AAcA?Y?cB?a@@a@?_@?_@"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9081752,
    //                                 "lng": 116.4179113
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "4.5 km",
    //                                 "value": 4460
    //                             },
    //                             "duration": {
    //                                 "text": "5 mins",
    //                                 "value": 324
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9454815,
    //                                 "lng": 116.4337996
    //                             },
    //                             "html_instructions": "Take the ramp onto \u003cb\u003e东二环\u003c/b\u003e",
    //                             "maneuver": "ramp-right",
    //                             "polyline": {
    //                                 "points": "csqrFklteUH[BK@E@ABCBCDCFA?AD?\\AjBEDA\\?D?F@HBHD@?DFDL@F@HALCHCDGD]XyBBaJHcCD}AFg@Fs@HkANeANy@LkC^eANMBG?s@H[B_AFS@aBDa@@q@@}@BoAB}ABA?iBBw@BgBBg@@oILaCBgBDcDDO?yBDmLRg@@oMPmABq@@cCDi@@aABqABu@@kA@gABcD@gADqEHq@@e@@oCBc@?cA@q@BoFL_DFoEDkCHQ?}FH}HLgAB{FHq@@_@?sBAA?eAAA?{CAcBAS?"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9084983,
    //                                 "lng": 116.4360636
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.5 km",
    //                                 "value": 464
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 43
    //                             },
    //                             "end_location": {
    //                                 "lat": 39.9493878,
    //                                 "lng": 116.4342046
    //                             },
    //                             "html_instructions": "Take the exit toward \u003cb\u003eS12机场高速\u003c/b\u003e",
    //                             "maneuver": "ramp-right",
    //                             "polyline": {
    //                                 "points": "gzxrFg~seUwA[UEC?C?IAS?UAaCAk@@g@@OBC?a@DUF_@H[JSDGBQFGBWJI@KBO@O?O?KCC?MGOIKIEEGIGGEGEMCKQc@"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9454815,
    //                                 "lng": 116.4337996
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "20.7 km",
    //                                 "value": 20737
    //                             },
    //                             "duration": {
    //                                 "text": "18 mins",
    //                                 "value": 1053
    //                             },
    //                             "end_location": {
    //                                 "lat": 40.0765779,
    //                                 "lng": 116.5883552
    //                             },
    //                             "html_instructions": "Continue onto \u003cb\u003eS12机场高速\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003eToll road\u003c/div\u003e",
    //                             "polyline": {
    //                                 "points": "uryrFw`teUAUAa@?WAc@?sC?oA?wB?w@?_BAsEAuD?sAA}BCcJ?a@?e@?wAAeB?_AA]?IAG?c@C_@C]Gg@Im@Ie@AAAEIY?CI]MYOa@CGMYQ[KSKOCEGGMQq@y@aAiAWYoAwAyCiDyAcBgAmAyAeBCC_CqCaAgAg@i@e@i@iAqA[]{CgDg@k@wBaCoA{Ag@m@_AeAo@u@iGkH}BiCuCaDeBoBcCmCOOkAsAWY_AeAaJkKIIqNqPkC}C}DuEo@s@EEk@o@y@_AiAsAiCkDkF}FyB}BiHaIWY_EwEiAuAgBsBo@u@AA{CkDsK}LaBmBoD_E_QuR{EuFgHiImIuJQSyCiDmGiHmHmIk@q@kCyCyCkDqHoIuCcD_FwFqB{BuBcC_CkCq@w@iE{EmC{CyCiDgAoAiByBqL{MaAkAqGmH[]cAiAoB{BwAaB}FsGuFwGW[y@_AqFkGkBuBqHsI{BuCmBiCsBuCuCmFc@w@}AiDqAgDq@kBs@kBuAmFOi@Mc@Sw@uByHaCoJ{BwI}DePUaAyF}T_HiXaDgMwHsZ{A}FuB{IAEwBcK{@_Ea@iBcAoEq@{CEOiAmFwA_Hu@iD[qAg@sBOi@GYGQg@kBeBoFmAiDiFoNs@mBIQeCuGeEyK}DkKyBwFiAgCq@qAs@uAy@qA}@oAmAyAsAwAcC{BgDuCuBmBuI{GaBwAyDgDwAsAkCoCkByBgD{DeF}GaB_Cw@cA]c@WY[Yi@e@s@u@gC}CaAiAu@u@q@k@u@q@WUWSk@c@k@_@m@_@m@[k@[WKWKm@Wo@Wq@SGCg@Oq@Qq@Mq@Ks@O}@KeAI_AGq@Au@?q@@aADsAF_CPgAHw@HkBNiBP{ANa@BiE`@cE\\}BRI@_BLsD\\aDVsDZeE\\}BRiAJwALcDXwE`@yALiBNO@sAJoADu@Bw@@kBAc@?yAGGA_AEu@G}BW}BWWCE?mBUu@Ie@G"
    //                             },
    //                             "start_location": {
    //                                 "lat": 39.9493878,
    //                                 "lng": 116.4342046
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.3 km",
    //                                 "value": 319
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 26
    //                             },
    //                             "end_location": {
    //                                 "lat": 40.0792166,
    //                                 "lng": 116.5897572
    //                             },
    //                             "html_instructions": "Take the exit on the \u003cb\u003eleft\u003c/b\u003e",
    //                             "maneuver": "ramp-left",
    //                             "polyline": {
    //                                 "points": "smrsFgdrfUu@KOI}AcA}@k@SMoB{@qAk@UGICw@O"
    //                             },
    //                             "start_location": {
    //                                 "lat": 40.0765779,
    //                                 "lng": 116.5883552
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.1 km",
    //                                 "value": 149
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 15
    //                             },
    //                             "end_location": {
    //                                 "lat": 40.0805387,
    //                                 "lng": 116.5895958
    //                             },
    //                             "html_instructions": "Continue straight",
    //                             "maneuver": "straight",
    //                             "polyline": {
    //                                 "points": "c~rsF_mrfU_@IgFh@"
    //                             },
    //                             "start_location": {
    //                                 "lat": 40.0792166,
    //                                 "lng": 116.5897572
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.3 km",
    //                                 "value": 333
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 48
    //                             },
    //                             "end_location": {
    //                                 "lat": 40.0776224,
    //                                 "lng": 116.5902028
    //                             },
    //                             "html_instructions": "Sharp \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003e航管南路\u003c/b\u003e",
    //                             "maneuver": "turn-sharp-right",
    //                             "polyline": {
    //                                 "points": "kfssF_lrfUFQDEBCDE`Iq@hBOfAKz@G"
    //                             },
    //                             "start_location": {
    //                                 "lat": 40.0805387,
    //                                 "lng": 116.5895958
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         },
    //                         {
    //                             "distance": {
    //                                 "text": "0.4 km",
    //                                 "value": 399
    //                             },
    //                             "duration": {
    //                                 "text": "1 min",
    //                                 "value": 76
    //                             },
    //                             "end_location": {
    //                                 "lat": 40.0789024,
    //                                 "lng": 116.5934993
    //                             },
    //                             "html_instructions": "Turn \u003cb\u003eleft\u003c/b\u003e at \u003cb\u003e航管南路南口\u003c/b\u003e onto \u003cb\u003e首都机场路\u003c/b\u003e",
    //                             "maneuver": "turn-left",
    //                             "polyline": {
    //                                 "points": "ctrsFworfUIuAIcBAg@k@iM[@E?eAHuAJ"
    //                             },
    //                             "start_location": {
    //                                 "lat": 40.0776224,
    //                                 "lng": 116.5902028
    //                             },
    //                             "travel_mode": "DRIVING"
    //                         }
    //                     ],
    //                     "traffic_speed_entry": [],
    //                     "via_waypoint": []
    //                 }
    //             ],
    //             "overview_polyline": {
    //                 "points": "cdsrF{xleUfDG|@GvBClDGzS[dNWOmMQuRj@o@^FCgBGiFE{DGyFCmEOiO_@ce@MoIG}MI{USo]IaOIoKC_H@cCPo@TMnCIp@?RHFFFT?VGNe@^{MLcCD}AF{APqC^yG`AwCTiEJmFJo_@j@sh@x@sFJ_KLcGJuDDiKRoJL}CH_[d@oOES?wA[YEw@CmD?w@De@Du@PiA\\u@T_@@[CQG[S[_@IYQc@AUAy@AwD?_JI_b@CmEIiBQuAKg@UaAo@}Am@eAiC}C{I_KeHiIyEmFwIsJgFeGgKuL{FqGwFkG}g@{l@eBoBiAsAiCkDkF}FyB}BaI{IaLwMsSyUoVuXcO_QgW}Yyk@mp@qNcPgHeIqDiEaXsZiO{PyP_S}KiM{BuCmBiCsBuCuCmFaCaFcCsGs@kBuAmF]mAiCqJ}FgUsEgRs^cxAqEyQyBiK}AiHuBkJ}EgU{AiGo@}BsDyKmLe[cKeXyBwFiAgCeBgDwBaDaDqDcC{BgDuCuBmBuI{G{G_GcFcFsGuHgI}KuAgBqCoCiEgFgBaBmAgAcAw@yA_AyAw@mCgAy@WyAa@cBYqB[eCQgBAsBFsEXuIt@kOrAu`@fD}OtAgHj@eCHcD?}BGgAGiI{@oEg@u@KOI}AcAqAy@aEgB_@KwAYgFh@FQHIDE`Iq@pD[z@GIuAKkCk@iM[@kAHuAJ"
    //             },
    //             "summary": "S12机场高速",
    //             "warnings": [],
    //             "waypoint_order": []
    //         }
    //     ],
    //     "status": "OK"
    // };

    let routes = data.routes;
    if (routes.length >= 0) {
        let route = routes[0];
        route.type = "traffic";
        return route;
    } else {
        let { data } = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startCoordinates.latitude.toFixed(6)},${startCoordinates.longitude.toFixed(6)}&destination=${endCoordinates.latitude.toFixed(6)},${endCoordinates.longitude.toFixed(6)}&key=AIzaSyDkFqsopNObdSVwPslxnZEFBOG6AVXeVgg`);
        routes = data.routes;
        let route = routes[0];
        route.type = "drive";
        return route;
    }

}

// find airport coordinates
async function findAirport(iata) {
    //let iata = await getCityIata(node.location_id);
    let location = airports.airports.get(iata);
    return {
        latitude: location[0],
        longitude: location[1]
    }
}

function transformFlightTime(flightTime) {
    let list = flightTime.split("T");
    let time = list[1].split(":");
    return Number(time[0]) * 60 + Number(time[1]);
}

async function getCityIata(cityName) {
    let iatalist = await iatas.getIATAList(cityName);
    return iatalist[0];
}
let i = 0;
async function getPoi(searchTerm) {
    let {data} =await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchTerm}&inputtype=textquery&fields=photos,formatted_address,name,plus_code,geometry&language=en&key=AIzaSyDkFqsopNObdSVwPslxnZEFBOG6AVXeVgg`);

    // let data = {
    //     "candidates": [
    //         {
    //             "formatted_address": "4 Jingshan Front St, Dongcheng, Beijing, China, 100009",
    //             "geometry": {
    //                 "location": {
    //                     "lat": 39.9163447,
    //                     "lng": 116.3971546
    //                 },
    //                 "viewport": {
    //                     "northeast": {
    //                         "lat": 39.91769452989272,
    //                         "lng": 116.3985044298927
    //                     },
    //                     "southwest": {
    //                         "lat": 39.91499487010728,
    //                         "lng": 116.3958047701073
    //                     }
    //                 }
    //             },
    //             "name": "The Palace Museum",
    //             "plus_code": {
    //                 "compound_code": "W98W+GV Dongcheng, Beijing, China",
    //                 "global_code": "8PFRW98W+GV"
    //             }
    //         }
    //     ],
    //     "status": "OK"
    // };
    // let data2 = {
    //     "candidates": [
    //         {
    //             "formatted_address": "2684 Lacy St, Los Angeles, CA 90031, United States",
    //             "geometry": {
    //                 "location": {
    //                     "lat": 34.0833839,
    //                     "lng": -118.2180313
    //                 },
    //                 "viewport": {
    //                     "northeast": {
    //                         "lat": 34.08481272989273,
    //                         "lng": -118.2167674701073
    //                     },
    //                     "southwest": {
    //                         "lat": 34.08211307010728,
    //                         "lng": -118.2194671298927
    //                     }
    //                 }
    //             },
    //             "name": "Yellow LA",
    //             "plus_code": {
    //                 "compound_code": "3QMJ+9Q Los Angeles, California",
    //                 "global_code": "85633QMJ+9Q"
    //             }
    //         }
    //     ],
    //     "status": "OK"
    // };
    // let data3={
    //     "candidates" : [
    //        {
    //           "formatted_address" : "1 Tiantan E Rd, Dongcheng, China, 100061",
    //           "geometry" : {
    //              "location" : {
    //                 "lat" : 39.8821803,
    //                 "lng" : 116.4066056
    //              },
    //              "viewport" : {
    //                 "northeast" : {
    //                    "lat" : 39.88353012989272,
    //                    "lng" : 116.4079554298927
    //                 },
    //                 "southwest" : {
    //                    "lat" : 39.88083047010727,
    //                    "lng" : 116.4052557701072
    //                 }
    //              }
    //           },
    //           "name" : "Temple of Heaven",
    //           "photos" : [
    //              {
    //                 "height" : 1206,
    //                 "html_attributions" : [
    //                    "\u003ca href=\"https://maps.google.com/maps/contrib/112902215904151571449\"\u003eFernando\u003c/a\u003e"
    //                 ],
    //                 "photo_reference" : "ATtYBwLGOYQEGFBFMaiK7R0RuxZnAyImei7LzYvDJsGrFvtEloxrbuOSnzjfR9pPLUMmdypAMBnBDnoHUPf-_vl2eVz7ByPt17mA3iZ1s5OOM6R5JRY6Pi6xRBRNKGRuBgBhIm0Yzl1ZBzUwziNxdGgx4LAXcxo3u8xAEsqYyAwHUOa87gaO",
    //                 "width" : 2048
    //              }
    //           ],
    //           "plus_code" : {
    //              "compound_code" : "VCJ4+VJ Dongcheng, Beijing, China",
    //              "global_code" : "8PFRVCJ4+VJ"
    //           }
    //        }
    //     ],
    //     "status" : "OK"
    //  }
    //  if(i==0){
    //      i++;
    //      return data;
    //  }else if(i==1){
    //      i++;
    //      return data3;
    //  }else{
    //      return data2;
    //  }
    return data;
}

function convertPTToM(PTString) {
    let temp = PTString.split("PT");
    let t = temp[1];
    let tl = t.split("H");
    let h = tl[0];
    if (tl[1].trim() == "") {
        return parseInt(h) * 60;
    } else {
        let mp = t[1];
        let ml = mp.split("M");
        let m = ml[0];
        return parseInt(h) * 60 + parseInt(m);
    }
}

module.exports = {
    findLowestCostPlan, getPoi
}