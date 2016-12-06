var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var Promise = require('promise');
var moment = require('moment');
var debug = require('debug');
var path = require('path');

var companiesGlobal = getRestaurants();

moment.locale("fi");

/* GET home page. */
router.get('/', function(req, res, next) {

    var restaurants = getRestaurants();
    console.log(restaurants[0].restaurants[0].name);

    res.render('index', {
        title: 'Opiskelijaruoka Tampereella',
        text: "",
        restaurants: getRestaurants()
    });
});

/* GET all the restaurants. */
/**
 * @api {get} /restaurants Request restaurants and their information
 * @apiName GetRestaurants
 * @apiGroup Restaurants
 *
 *
 * @apiSuccess {Object[]} companies Array of companies
 * @apiSuccess {String} companies.companyName  Name of the company
 * @apiSuccess {String} companies.companyName  Name of the company
 * @apiSuccess {String} companies.restaurants  Restaurants of the company in Tampere
 * @apiSuccess {String} companies.restaurants.name  Name of the restaurant
 * @apiSuccess {Number} companies.restaurants.restaurantId  Id of the restaurant
 *
 */
router.get('/restaurants', function(req, res, next) {
    return res.status(200).json({companies: getRestaurants()});
});


/* GET restaurant info of one restaurant. */
/**
 * @api {get} /restaurantinfo/:restaurantid Get information of one restaurant
 * @apiName GetRestaurantInfo
 * @apiGroup Restaurants
 *
 * @apiParam  {Number} restaurantid Restaurants unique ID.
 *
 * @apiSuccess {String} name  Name of the restaurant
 * @apiSuccess {Number} restaurantId Id of the restaurant
 * @apiSuccess {Number} menu Menu type id of the restaurant. Only with Juvenes restaurants.
 *
 * @apiError RestaurantNotFound  Restaurant not found.
 */
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
        return res.status(404).json({error: "RestaurantNotFound"});
    }

});

/* GET get menu from one restaurant in certain dates. */
/**
 * @api {get} /menu/:restaurantid/:date Get menu of one restaurant for certain date
 * @apiName GetRestaurantMenu
 * @apiGroup Menus
 *
 * @apiParam  {Number} restaurantid Restaurants unique ID.
 * @apiParam  {Date} date Date when the menu is wanted. Format must be YYYY-MM-DD
 *
 * @apiSuccess {String} restaurant  Name of the restaurant
 * @apiSuccess {String} link Link to the website of the restaurant
 * @apiSuccess {String} open_hours Opening hours of the restaurant
 * @apiSuccess {Object[]} set_menus Array of menu objects
 * @apiSuccess {String} set_menus.name Name of the menu.
 * @apiSuccess {String} set_menus.price Price of the menu.
 * @apiSuccess {String[]} set_menus.components Array of components of the menu.
 * @apiSuccess {String} set_menus.diets Diets of the menu.
 *
 * @apiError RestaurantNotFound  Restaurant not found.
 */
router.get('/menu/:restaurantid/:date', function(req, res, next) {

    var restaurantid = req.params['restaurantid'];
    var date = req.params['date'];
    var restaurantCompany = whatRestaurantCompany(restaurantid);

    if( restaurantCompany=== "Amica") {
        getAmicaMenu(restaurantid, date).then( function(result) {
            return res.status(200).json(amicaMenuToGlobalFormat(result));
        });
    } else if(restaurantCompany === "Juvenes") {
        getJuvenesMenu(restaurantid, date).then( function(result) {
            return res.status(200).json(juvenesMenuToGlobalFormat(result));
        });
    } else if(restaurantCompany === "Sodexo") {
        getSodexoMenu(restaurantid, date).then( function(result) {
            return res.status(200).json(sodexoMenuToGlobalFormat(result));
        });
    } else {
        return res.status(404).json({"message": "Restaurant not found"});
    }

});


/* GET get all the menus of all restaurants in certain date. */
/**
 * @api {get} /all/menus/:date Get all menus for certain date
 * @apiName GetAllMenus
 * @apiGroup Menus
 *
 * @apiParam  {Date} date Date when the menu is wanted. Format must be YYYY-MM-DD
 *
 * @apiSuccess {Object[]} menus Array of company objecs
 * @apiSuccess {Object[]} menus.Juvenes Menus from Juvenes
 * @apiSuccess {Object[]} menus.Amica  Menus of Amica
 * @apiSuccess {Object[]} menus.Sodexo  Menus of Sodexo
 * @apiSuccess {String} menus.Sodexo.restaurant  Name of the restaurant
 * @apiSuccess {String} menus.Sodexo.link Link to the website of the restaurant
 * @apiSuccess {String} menus.Sodexo.open_hours Opening hours of the restaurant
 * @apiSuccess {Object[]} menus.Sodexo.set_menus Array of menu objects
 * @apiSuccess {String} menus.Sodexo.set_menus.name Name of the menu.
 * @apiSuccess {String} menus.Sodexo.set_menus.price Price of the menu.
 * @apiSuccess {String[]} menus.Sodexo.set_menus.components Array of components of the menu.
 * @apiSuccess {String} menus.Sodexo.set_menus.diets Diets of the menu.
 *
 */
router.get('/all/menus/:date', function(req, res, next) {

    var date = req.params['date'];

    var menus = {
        "Juvenes": [],
        "Amica": [],
        "Sodexo": []
    };

    getAllAmicaMenus(date, menus).then( function(menus) {
        getAllJuvenesMenus(date, menus).then( function(menus) {
            getAllSodexoMenus(date, menus).then( function(menus) {
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
/**
 * @api {get} /api_documentation Get API documentation
 * @apiName GetAPIDocumentation
 * @apiGroup Documentation
 *
 *
 * @apiSuccess {HTML} API documentation as HTML file.
 *
 */
router.get('/api_documentation', function(req, res, next) {
    res.sendFile(path.join(__dirname + '/apidoc/index.html'));
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

// Returns the restaurants in a list.
function getRestaurants() {

    // Amica restaurants
    var Reaktori = {name: "Reaktori", restaurantId: "0812", menu: "" };
    var Minerva = {name: "Minerva", restaurantId: "0815", menu: "" };
    var Pirteria = {name: "Pirteria", restaurantId: "0823", menu: "" };

    // Fills the restaurant infos here
    // Juvenes restaurants
    var Newton = {name: "Newton", restaurantId: "6", menu: "60" };
    //var TAYravintola = {name: "Yliopiston Ravintola", restaurantId: "13", menu: "6" };
    //var TAYravintolaVEGE = {name: "Yliopiston Ravintola / VegeBar", restaurantId: "13", menu: "5" };
    var TAYCafeCampus = {name: "Café Campus", restaurantId: "130019", menu: "23" };
    var CafePinni = {name: "Café Pinni", restaurantId: "130016", menu: "60"};
    var Arvo = {name: 'Arvo', restaurantId: "5", menu: "60"};
    var CafeLeaFusion = {name: "Café Lea (Fusion Kitchen)", restaurantId: "50026", menu: "3"};
    //var CafeLeaSalad = {name: "Café Lea (My Salad)", restaurantId: "50026", menu: "76"};
    var KonehuoneSaas = {name: "Café Konehuone / Såås bar", restaurantId: "60038", menu: "77" };
    //var KonehuoneFusion = {name: "Café Konehuone / Fusion", restaurantId: "60038", menu: "3" };
    var Ziberia = {name: "Ziberia", restaurantId: "11", menu: "60" };
    var Frenckell = {name: "Frenckell", restaurantId: "33", menu: "60"};
    //var FrenckellSaas = {name: "Frenckell / Såås Bar", restaurantId: "33", menu: "77" };

    // Sodexo restaurants
    var Hertsi = {name: "Hertsi", restaurantId: "12812", menu: "" };
    var Linna = {name: "Linna", restaurantId: "92", menu: "" };
    var Erkkeri = {name: "Erkkeri", restaurantId: "100", menu: "" };


    return [{
        companyName: "Amica",
        restaurants: [Reaktori, Minerva, Pirteria]
    }, {
        companyName: "Juvenes",
        restaurants: [Newton, /*TAYravintola, /*TAYravintolaVEGE,*/ TAYCafeCampus, CafePinni, Arvo,
            CafeLeaFusion, /*CafeLeaSalad, KonehuoneFusion,*/
            KonehuoneSaas, Ziberia, Frenckell/*, FrenckellSaas*/]
    }, {
        companyName: "Sodexo",
        restaurants: [Hertsi, Linna, Erkkeri]
    }];
}


// ********************************************************************************************************************
// Getting menus from one restaurant by id
// ********************************************************************************************************************

// Returns Juvenes menu by kitchen and day
// startDay in format: 2014-06-23
function getJuvenesMenu(restaurantId, date) {

    return new Promise( function(fulfill, reject) {

        var day = moment(date).locale("fi");
        var companies = getRestaurants();
        var menuTypeId;

        for (var i = 0; i < companies.length; ++i) {
            if(companies[i].companyName === "Juvenes") {
                for (var j = 0; j < companies[i].restaurants.length; ++j) {
                    if (restaurantId === companies[i].restaurants[j].restaurantId) {
                        menuTypeId = companies[i].restaurants[j].menu;
                        break;
                    }
                }
            }
        }

        var dayInt = day.isoWeekday();

        var options = {
            host: 'www.juvenes.fi',
            path: "/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?KitchenId=" +
            restaurantId + "&MenuTypeId=" + menuTypeId + "&Week=" + day.week()
            + "&Weekday=" + dayInt +"&lang=%27fi%27&format=json",
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
function getAmicaMenu(restaurantId, date ) {
    return new Promise( function(fulfill, reject) {

        var options = {
            host: 'www.amica.fi',
            path: '/modules/json/json/Index?costNumber=' + restaurantId + '&firstDay=' + date + '&lastDay=' + date + '&language=fi',
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
function getSodexoMenu(restaurantId, date) {
    return new Promise( function(fulfill, reject) {

        var day = moment(date);

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
// Getting all menus from companies
// ********************************************************************************************************************

// Get all menus from Sodexo restaurants
function getAllSodexoMenus(date, menus) {
    return new Promise( function(fulfill, reject) {
        var SodexoRestaurants = companiesGlobal[2].restaurants;
        var day = moment(date);

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
                    menus.Sodexo.push(sodexoMenuToGlobalFormat(JSON.parse(str)));
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

// Get all menus from Juvenes restaurants
function getAllJuvenesMenus(date, menus) {
    return new Promise( function(fulfill, reject) {
        var JuvenesRestaurants = companiesGlobal[1].restaurants;
        var day = moment(date);

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
                    menus.Juvenes.push(juvenesMenuToGlobalFormat(JSON.parse(str.slice(1, str.length).slice(0, str.length-3))));
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

// get all menus from Amica restaurants
function getAllAmicaMenus(date, menus) {
    return new Promise( function(fulfill, reject) {
        var AmicaRestaurants = companiesGlobal[0].restaurants;

        for( var i = 0; i < AmicaRestaurants.length; ++i) {

            var options = {
                host: 'www.amica.fi',
                path: '/modules/json/json/Index?costNumber=' + AmicaRestaurants[i].restaurantId + '&firstDay=' + date + '&lastDay=' + date + '&language=fi',
                method: 'GET'
            };

            var req = http.request(options, function (response) {
                var str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    menus.Amica.push(amicaMenuToGlobalFormat(JSON.parse(str)));
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

var empty_format_menu = {
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

// Change Amica menu to wanted format
function amicaMenuToGlobalFormat(menu) {

    var new_format_menu = {
        restaurant: menu.RestaurantName || "",
        link: menu.RestaurantUrl || "",
        open_hours: "",
        set_menus: []
    };
    if(menu.MenusForDays && menu.MenusForDays.length > 0) {
        new_format_menu.open_hours = menu.MenusForDays[0].LunchTime

        for(var i = 0; i < menu.MenusForDays[0].SetMenus.length; ++i) {
            var setMenu = {};
            var value = menu.MenusForDays[0].SetMenus[i];
            setMenu.name = value.Name;
            setMenu.price = value.Price;
            setMenu.components = value.Components;
            setMenu.diets = "";
            new_format_menu.set_menus.push(setMenu);
        }
    }

    return new_format_menu;
}

// Change Sodexo menu to wanted format
function sodexoMenuToGlobalFormat(menu) {

    var new_format_menu = {
        restaurant: menu['meta']['ref_title'] || "",
        link: menu['meta']['ref_url']  || "",
        open_hours: "",
        set_menus: []
    };

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

// Change Juvenes menu to wanted format
function juvenesMenuToGlobalFormat(menu) {

    if(menu.d) {
        parsed_menu = JSON.parse(menu['d']);

        var new_format_menu = {
            restaurant: parsed_menu.KitchenName || "",
            link: "",
            open_hours: "",
            set_menus: []
        };

        for (var i = 0; i < parsed_menu.MealOptions.length; ++i) {
            var setMenu = {};
            var value = parsed_menu.MealOptions[i];
            setMenu.name = value.Name;
            setMenu.price = value.Price;
            setMenu.components = [];
            for (var j = 0; j < value.MenuItems.length; ++j) {
                var menuItem = value.MenuItems[j];
                setMenu.components.push(menuItem.Name + ", (" + menuItem.Diets + ")");
            }
            setMenu.diets = "";
            new_format_menu.set_menus.push(setMenu);
        }
        return new_format_menu;
    } else {
        return {};
    }

}

// ********************************************************************************************************************
// Location methods. Uses Google APIS
// ********************************************************************************************************************

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


module.exports = router;
