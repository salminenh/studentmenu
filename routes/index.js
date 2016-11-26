var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/exampleapp', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET all the restaurants. */
router.get('/restaurants', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET restaurant info of one restaurant. */
router.get('/restaurantinfo/:restaurantid', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET get menu from one restaurant in certain dates. */
router.get('/menu/:restaurantid/:startday/:endday', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET get all the menus of all restaurants in certain dates. */
router.get('/all/menus/:startday/:endday', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET API documentation */
router.get('/api_documentation', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// Returns Juvenes API url
function getJuvenesUrl(kitchenId, menuTypeId, week, weekday) {
    return "http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?KitchenId=" +
        kitchenId + "&MenuTypeId=" + menuTypeId + "&Week=" + week + "&Weekday=" + weekday +"&lang=%27fi%27&format=json";
}


function getRestaurants() {

    // Amica restaurants
    var Reaktori = {name: "Reaktori", restaurantId: "0812"};
    var Minerva = {name: "Minerva", restaurantId: "0815"};
    var Pirteria = {name: "Pirteria", restaurantId: "0823"};


    // Fills the restaurant infos here
    // Juvenes restaurants
    var Newton = {name: "Newton", restaurantId: "xx"};

    // Sodexo restaurants
    var Hertsi = {name: "Hertsi", restaurantId: "yy"};


    return [{
        companyName: "Amica",
        restaurants: [Reaktori, Minerva, Pirteria]
    }, {
        companyName: "Juvenes",
        restaurants: [Newton]
    }, {
        companyName: "Sodexo",
        restaurants: [Hertsi]
    }];

}

function getAPIinformation(restaurant) {

}


module.exports = router;
