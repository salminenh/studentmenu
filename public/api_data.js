define({ "api": [
  {
    "type": "get",
    "url": "/api_documentation",
    "title": "Get API documentation",
    "name": "GetAPIDocumentation",
    "group": "Documentation",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "HTML",
            "optional": false,
            "field": "API",
            "description": "<p>documentation as HTML file.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Documentation"
  },
  {
    "type": "get",
    "url": "/all/menus/:date",
    "title": "Get all menus for certain date",
    "name": "GetAllMenus",
    "group": "Menus",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date when the menu is wanted. Format must be YYYY-MM-DD</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "menus",
            "description": "<p>Array of company objecs</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "menus.Juvenes",
            "description": "<p>Menus from Juvenes</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "menus.Amica",
            "description": "<p>Menus of Amica</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "menus.Sodexo",
            "description": "<p>Menus of Sodexo</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.restaurant",
            "description": "<p>Name of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.link",
            "description": "<p>Link to the website of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.open_hours",
            "description": "<p>Opening hours of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "menus.Sodexo.set_menus",
            "description": "<p>Array of menu objects</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.set_menus.name",
            "description": "<p>Name of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.set_menus.price",
            "description": "<p>Price of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "menus.Sodexo.set_menus.components",
            "description": "<p>Array of components of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "menus.Sodexo.set_menus.diets",
            "description": "<p>Diets of the menu.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Menus"
  },
  {
    "type": "get",
    "url": "/menu/:restaurantid/:date",
    "title": "Get menu of one restaurant for certain date",
    "name": "GetRestaurantMenu",
    "group": "Menus",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "restaurantid",
            "description": "<p>Restaurants unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date when the menu is wanted. Format must be YYYY-MM-DD</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "restaurant",
            "description": "<p>Name of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "link",
            "description": "<p>Link to the website of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "open_hours",
            "description": "<p>Opening hours of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "set_menus",
            "description": "<p>Array of menu objects</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "set_menus.name",
            "description": "<p>Name of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "set_menus.price",
            "description": "<p>Price of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "set_menus.components",
            "description": "<p>Array of components of the menu.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "set_menus.diets",
            "description": "<p>Diets of the menu.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "RestaurantNotFound",
            "description": "<p>Restaurant not found.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Menus"
  },
  {
    "type": "get",
    "url": "/restaurantinfo/:restaurantid",
    "title": "Get information of one restaurant",
    "name": "GetRestaurantInfo",
    "group": "Restaurants",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "restaurantid",
            "description": "<p>Restaurants unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "restaurantId",
            "description": "<p>Id of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "menu",
            "description": "<p>Menu type id of the restaurant. Only with Juvenes restaurants.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "location",
            "description": "<p>Location of the restaurant, basically university where it is.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "RestaurantNotFound",
            "description": "<p>Restaurant not found.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Restaurants"
  },
  {
    "type": "get",
    "url": "/restaurants",
    "title": "Request restaurants and their information",
    "name": "GetRestaurants",
    "group": "Restaurants",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "companies",
            "description": "<p>Array of companies</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "companies.companyName",
            "description": "<p>Name of the company</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "companies.restaurants",
            "description": "<p>Restaurants of the company in Tampere</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "companies.restaurants.name",
            "description": "<p>Name of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "companies.restaurants.restaurantId",
            "description": "<p>Id of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "companies.restaurants.menu",
            "description": "<p>menu of the restaurant (Only Juvenes)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "companies.restaurants.location",
            "description": "<p>location of the restaurant</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Restaurants"
  },
  {
    "type": "get",
    "url": "/restaurants/byuniversity/:university",
    "title": "Request restaurants and their information",
    "name": "GetRestaurantsByUniversity",
    "group": "Restaurants",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "companies",
            "description": "<p>Array of restaurants from the university campus</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "restaurants",
            "description": "<p>Restaurants of the company in Tampere</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "restaurants.name",
            "description": "<p>Name of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "restaurants.restaurantId",
            "description": "<p>Id of the restaurant</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "restaurants.menu",
            "description": "<p>menu of the restaurant (Only Juvenes)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "restaurants.location",
            "description": "<p>location of the restaurant</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Restaurants"
  }
] });
