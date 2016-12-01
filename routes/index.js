var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var Promise = require('promise');
var moment = require('moment');


/* GET home page. */
router.get('/exampleapp', function(req, res, next) {
    getLocation("Korkeakoulunkatu", "7", "33720", "Tampere").then( function(result) {
        res.render('index', {
            title: 'Express',
            text: result.results
        });
    });
});

/* GET all the restaurants. */
router.get('/restaurants', function(req, res, next) {
    return res.status(200).json({restaurants: getRestaurants()});
});

/* GET restaurant info of one restaurant. */
router.get('/restaurantinfo/:restaurantid', function(req, res, next) {
    var restaurantid = req.params['restaurantid'];

    var companies = getRestaurants();
    var restaurant;

    for (var i = 0; i < companies.length; ++i) {
        for (var j = 0; j < companies[i].restaurants.length; ++j) {
            if(restaurantid === companies[i].restaurants[j].restaurantId) {
                restaurant = companies[i].restaurants[j];
            }
        }
    }
    if(restaurant) {
        return res.status(200).json(restaurant);
    } else {
        return res.status(404).json({message: "Restaurant not found"});
    }

});

/* GET get menu from one restaurant in certain dates. */
router.get('/menu/:restaurantid/:startday/:endday', function(req, res, next) {

    var restaurantid = req.params['restaurantid'];
    var startday = req.params['startday'];
    var endday = req.params['endday'];
    var restaurantCompany = whatRestaurantCompany(restaurantid);

    if( restaurantCompany=== "Amica") {
        console.log("Amica");
        getAmicaMenu(restaurantid, startday, endday).then( function(result) {
            return res.status(200).json(result);
        });
    } else if(restaurantCompany === "Juvenes") {
        console.log("Juvenes");
        getJuvenesMenu(restaurantid, startday, endday).then( function(result) {
            return res.status(200).json(result);
        });
    } else if(restaurantCompany === "Sodexo") {
        getSodexoMenu(restaurantid, startday, endday).then( function(result) {
            return res.status(200).json(result);
        });
    } else {
        return res.status(404).json({"message": "Restaurant not found"});
    }

});

/* GET get all the menus of all restaurants in certain dates. */
router.get('/all/menus/:startday/:endday', function(req, res, next) {

    var startday = req.params['startday'];
    var endday = req.params['endday'];

    var menus = [
        {"Juvenes": []},
        {"Amica": []},
        {"Sodexo": []}
    ];
    var companies = getRestaurants();

    return new Promise(function(fulfill, reject) {

        for (var i = 0; i < companies.length; ++i) {
            for (var j = 0; j < companies[i].restaurants.length; ++j) {

                var company = companies[i].companyName;

                if (company === "Amica") {
                    getAmicaMenu(companies[i].restaurants[j].restaurantId, startday, endday).then(function (result) {

                        menus.Amica.push(result);
                    });
                } else if (company === "Juvenes") {
                    getJuvenesMenu(companies[i].restaurants[j].restaurantId, startday, endday).then(function (result) {
                        menus.Juvenes.push(result);
                    });
                } else if (company === "Sodexo") {
                    //return res.status(404).json({"message": "TODO"});
                } else {
                    //return res.status(404).json({"message": "Restaurant not found"});
                }

                if(i+1 === companies.length && j+1 === companies[i].restaurants.length) {
                    fulfill(menus);
                }
            }
        }
    }).then( function(menusReturn) {
        return res.status(200).json({menus: menusReturn});
    });

});

/* GET API documentation */
router.get('/api_documentation', function(req, res, next) {
    return res.render('index', { title: 'Express' });
});



// ********************************************************************************************************************
// Helper functions
// ********************************************************************************************************************


// Returns what restaurant company according to ID (Amica, Juvenes or Sodexo)
function whatRestaurantCompany(restaurantId) {
    var companies = getRestaurants();

    for (var i = 0; i < companies.length; ++i) {
        for (var j = 0; j < companies[i].restaurants.length; ++j) {
            if(restaurantId === companies[i].restaurants[j].restaurantId) {
                return companies[i].companyName;
            }

        }
    }
    return "NOTFOUND";
}


// Returns Juvenes menu by kitchen and day
// startDay in format: 2014-06-23
function getJuvenesMenu(kitchenId, startDay, endDay) {

    return new Promise( function(fulfill, reject) {

        var day = moment(startDay);
        var companies = getRestaurants();
        var menuTypeId;

        for (var i = 0; i < companies.length; ++i) {
            if(companies[i].companyName === "Juvenes") {
                for (var j = 0; j < companies[i].restaurants.length; ++j) {
                    if (kitchenId = companies[i].restaurants[j].restaurantId) {
                        menuTypeId = companies[i].restaurants[j].menu;
                        break;
                    }
                }
            }
        }

        var options = {
            host: 'www.juvenes.fi',
            path: "/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?KitchenId=" +
            kitchenId + "&MenuTypeId=" + menuTypeId + "&Week=" + day.week()
            + "&Weekday=" + day.day() +"&lang=%27fi%27&format=json",
            method: 'GET'
        };

        var req = http.request(options, function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                fulfill(JSON.parse(str.slice(1, str.length).slice(0, str.length-3)));
            });
        });
        req.end();

        req.on('error', function (e) {
            console.error("error:" + e);
            reject(new Error(e));
        });
    });
}


//http://www.amica.fi/modules/json/json/Index?costNumber=[RavintolaID]&firstDay=[Aloituspv]&lastDay=[Lopetuspv]&language=fi
// firstDay in format: 2014-06-23
function getAmicaMenu(restaurantId, firstDay, lastDay ) {
    return new Promise( function(fulfill, reject) {

        var options = {
            host: 'www.amica.fi',
            path: '/modules/json/json/Index?costNumber=' + restaurantId + '&firstDay=' + firstDay + '&lastDay=' + lastDay + '&language=fi',
            method: 'GET'
        };

        var req = http.request(options, function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                fulfill(JSON.parse(str));
            });
        });
        req.end();

        req.on('error', function (e) {
            console.error("error:" + e);
            reject(new Error(e));
        });
    });
}

//
function getSodexoMenu(restaurantId, firstDay, lastDay) {
    return new Promise( function(fulfill, reject) {

        var day = moment(firstDay);

        var options = {
            host: 'www.sodexo.fi',
            path: "/ruokalistat/output/daily_json/" + restaurantId + "/" + day.format('YYYY/MM/DD') + "/fi",
            method: 'GET'
        };
        
        var req = http.request(options, function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                fulfill(JSON.parse(str));
            });
        });
        req.end();

        req.on('error', function (e) {
            console.error("error:" + e);
            reject(new Error(e));
        });
    });
}


// Returns the coordinates of an address
function getLocation(address, number, postalcode, city) {

    return new Promise( function(fulfill, reject) {

        var API_Key = "AIzaSyA50QvlnzrfRDoDC4LWZppr9Ta2ltJgV-E";
        var options = {
            host: 'maps.googleapis.com',
            path: '/maps/api/geocode/json?address=' + address + '+' + number + ',+' + postalcode + '+' + city + '&key=' + API_Key,
            method: 'GET'
        };

        var req = https.request(options, function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                fulfill(JSON.parse(str));
            });
        });
        req.end();

        req.on('error', function (e) {
            console.error("error:" + e);
            reject(new Error(e));
        });
    });
}


// Returns the restaurants in a list.
function getRestaurants() {

    // Amica restaurants
    var Reaktori = {name: "Reaktori", restaurantId: "0812"};
    var Minerva = {name: "Minerva", restaurantId: "0815"};
    var Pirteria = {name: "Pirteria", restaurantId: "0823"};

    // Fills the restaurant infos here
    // Juvenes restaurants
    var Newton = {name: "Newton", restaurantId: "6", menu: "60" };
    var TAYravintola = {name: "Yliopiston Ravintola", restaurantId: "13", menu: "6" };
    var TAYravintolaVEGE = {name: "Yliopiston Ravintola / VegeBar", restaurantId: "13", menu: "5" };
    var TAYCafeCampus = {name: "Café Campus", restaurantId: "130019", menu: "23" };
    var CafePinni = {name: "Café Pinni", restaurantId: "130016", menu: "60"};
    var Arvo = {name: 'Arvo', restaurantId: "5", menu: "60"};
    var CafeLeaFusion = {name: "Café Lea (Fusion Kitchen)", restaurantId: "50026", menu: "3"};
    var CafeLeaSalad = {name: "Café Lea (My Salad)", restaurantId: "50026", menu: "76"};
    var KonehuoneSåås = {name: "Café Konehuone / Såås bar", restaurantId: "60038", menu: "77" };
    var KonehuoneFusion = {name: "Café Konehuone / Fusion", restaurantId: "60038", menu: "3" };
    var Ziberia = {name: "Ziberia", restaurantId: "11", menu: "60" };
    var Frenckell = {name: "Frenckell", restaurantId: "33", menu: "60"};
    var FrenckellSåås = {name: "Frenckell / Såås Bar", restaurantId: "33", menu: "77" };

    // Sodexo restaurants
    var Hertsi = {name: "Hertsi", restaurantId: "12812"};
    var Linna = {name: "Linna", restaurantId: "92"};
    var Erkkeri = {name: "Erkkeri", restaurantId: "100"};


    return [{
        companyName: "Amica",
        restaurants: [Reaktori, Minerva, Pirteria]
    }, {
        companyName: "Juvenes",
        restaurants: [Newton, TAYravintola, TAYravintolaVEGE, TAYCafeCampus, CafePinni, Arvo,
            CafeLeaFusion, CafeLeaSalad, KonehuoneFusion,
            KonehuoneSåås, Ziberia, Frenckell, FrenckellSåås]
    }, {
        companyName: "Sodexo",
        restaurants: [Hertsi, Linna, Erkkeri]
    }];
}


// Returns API info of restaurant.
function getAPIinformation(restaurant) {

}


module.exports = router;
