var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var Promise = require('promise');
var moment = require('moment');
var debug = require('debug');

var companiesGlobal = getRestaurants();


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
router.get('/menu/:restaurantid/:startday/', function(req, res, next) {

    var restaurantid = req.params['restaurantid'];
    var startday = req.params['startday'];
    var restaurantCompany = whatRestaurantCompany(restaurantid);

    if( restaurantCompany=== "Amica") {
        getAmicaMenu(restaurantid, startday).then( function(result) {
            return res.status(200).json(amicaMenuToGlobalFormat(result));
        });
    } else if(restaurantCompany === "Juvenes") {
        getJuvenesMenu(restaurantid, startday).then( function(result) {
            return res.status(200).json(juvenesMenuToGlobalFormat(result));
        });
    } else if(restaurantCompany === "Sodexo") {
        getSodexoMenu(restaurantid, startday).then( function(result) {
            return res.status(200).json(sodexoMenuToGlobalFormat(result));
        });
    } else {
        return res.status(404).json({"message": "Restaurant not found"});
    }

});

/* GET get all the menus of all restaurants in certain date. */
router.get('/all/menus/:day/', function(req, res, next) {

    var day = req.params['day'];

    var menus = {
        "Juvenes": [],
        "Amica": [],
        "Sodexo": []
    };

    getAllAmicaMenus(day, menus).then( function(menus) {
        getAllJuvenesMenus(day, menus).then( function(menus) {
            getAllSodexoMenus(day, menus).then( function(menus) {
                return res.status(200).json({menus: menus});
            }).catch( function(err) {
                return res.status(500).json({error: err.message});
            });
        }).catch( function(err) {
            return res.status(500).json({error: err.message});
        });
    }).catch( function(err) {
        return res.status(500).json({error: err.message});
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
function getJuvenesMenu(kitchenId, startDay) {

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
function getAmicaMenu(restaurantId, firstDay ) {
    return new Promise( function(fulfill, reject) {

        var options = {
            host: 'www.amica.fi',
            path: '/modules/json/json/Index?costNumber=' + restaurantId + '&firstDay=' + firstDay + '&lastDay=' + firstDay + '&language=fi',
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

// Get sodexo menu for a day
function getSodexoMenu(restaurantId, firstDay) {
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


// ********************************************************************************************************************
// All menus functions
// ********************************************************************************************************************

function getAllSodexoMenus(firstDay, menus) {
    return new Promise( function(fulfill, reject) {
        var SodexoRestaurants = companiesGlobal[2].restaurants;
        var day = moment(firstDay);

        for( var i = 0; i < SodexoRestaurants.length; ++i) {

            var options = {
                host: 'www.sodexo.fi',
                path: "/ruokalistat/output/daily_json/" + SodexoRestaurants[i].restaurantId + "/" + day.format('YYYY/MM/DD') + "/fi",
                method: 'GET'
            };

            var req = http.request(options, function (response) {
                var str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    menus.Sodexo.push(JSON.parse(str));
                    if(SodexoRestaurants.length === menus.Sodexo.length) {
                        fulfill(menus);
                    }
                });
            });
            req.end();

            req.on('error', function (e) {
                console.error("error:" + e);
                reject(new Error(e));
            });

        }
    });
}

//
function getAllJuvenesMenus(firstDay, menus) {
    return new Promise( function(fulfill, reject) {
        var JuvenesRestaurants = companiesGlobal[1].restaurants;
        var day = moment(firstDay);

        for( var i = 0; i < JuvenesRestaurants.length; ++i) {

            var options = {
                host: 'www.juvenes.fi',
                path: "/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?KitchenId=" +
                JuvenesRestaurants[i].restaurantId + "&MenuTypeId=" + JuvenesRestaurants[i].menu + "&Week=" + day.week()
                + "&Weekday=" + day.day() +"&lang=%27fi%27&format=json",
                method: 'GET'
            };

            var req = http.request(options, function (response) {
                var str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    menus.Juvenes.push(JSON.parse(str.slice(1, str.length).slice(0, str.length-3)));
                    if(JuvenesRestaurants.length === menus.Juvenes.length) {
                        fulfill(menus);
                    }
                });
            });
            req.end();

            req.on('error', function (e) {
                console.error("error:" + e);
                reject(new Error(e));
            });

        }

    });
}

function getAllAmicaMenus(firstDay, menus) {
    return new Promise( function(fulfill, reject) {
        var AmicaRestaurants = companiesGlobal[0].restaurants;

        for( var i = 0; i < AmicaRestaurants.length; ++i) {

            var options = {
                host: 'www.amica.fi',
                path: '/modules/json/json/Index?costNumber=' + AmicaRestaurants[i].restaurantId + '&firstDay=' + firstDay + '&lastDay=' + firstDay + '&language=fi',
                method: 'GET'
            };

            var req = http.request(options, function (response) {
                var str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    menus.Amica.push(JSON.parse(str));
                    if(AmicaRestaurants.length === menus.Amica.length) {
                        fulfill(menus);
                    }
                });
            });
            req.end();

            req.on('error', function (e) {
                console.error("error:" + e);
                reject(new Error(e));
            });
        }

    });
}

// ********************************************************************************************************************
// Menus to same formats
// ********************************************************************************************************************

// Formats in all these are like:

var new_format_menu = {
    restaurant: "",
    link: "",
    open_hours: "",
    set_menus: [
        {
            name: "",
            price: "",
            components: ["", ""],
            diets: ""
        }
    ]
};


function amicaMenuToGlobalFormat(menu) {

    var new_format_menu = {
        restaurant: "",
        link: "",
        open_hours: "",
        set_menus: []
    };

    new_format_menu.restaurant = menu.RestaurantName;
    new_format_menu.link = menu.RestaurantUrl;
    new_format_menu.open_hours = menu.MenusForDays[0].LunchTime;

    for(var i = 0; i < menu.MenusForDays[0].SetMenus.length; ++i) {
        var setMenu = {};
        var value = menu.MenusForDays[0].SetMenus[i];
        setMenu.name = value.Name;
        setMenu.price = value.Price;
        setMenu.components = value.Components;
        setMenu.diets = "";
        new_format_menu.set_menus.push(setMenu);
    }
    return new_format_menu;
}


function sodexoMenuToGlobalFormat(menu) {

    var new_format_menu = {
        restaurant: "",
        link: "",
        open_hours: "",
        set_menus: []
    };

    new_format_menu.restaurant = menu['meta']['ref_title'];
    new_format_menu.link = menu['meta']['ref_url'];
    new_format_menu.open_hours = "";

    for(var i = 0; i < menu['courses'].length; ++i) {
        var setMenu = {};
        var value = menu['courses'][i];
        setMenu.name = value.title_fi;
        setMenu.price = value.price;
        setMenu.components = [];
        setMenu.components.push(value.desc_fi);
        setMenu.diets = value.properties;
        new_format_menu.set_menus.push(setMenu);
    }
    return new_format_menu;}

function juvenesMenuToGlobalFormat(menu) {

    console.log(menu['d']['"KitchenName"']);
    var new_format_menu = {
        restaurant: "",
        link: "",
        open_hours: "",
        set_menus: []
    };

    new_format_menu.restaurant = menu['d']['"KitchenName"'];
    new_format_menu.link = "";
    new_format_menu.open_hours = "";

    for(var i = 0; i < menu['d']['MenuItems'].length; ++i) {
        var setMenu = {};
        var value = menu['d']['MenuItems'][i];
        setMenu.name = value.Name;
        setMenu.price = value.Price;
        setMenu.components = [value.Ainesosat];
        setMenu.diets = value.Diets;
        new_format_menu.set_menus.push(setMenu);
    }
    return new_format_menu;
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
