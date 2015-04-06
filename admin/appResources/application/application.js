"use strict";
define(["services", "../require/route-config"], function (app, routeConfig) {
    return app.config(function ($routeProvider, $httpProvider) {

        $routeProvider
            .when('/login',
            routeConfig.config(
                'views/login/login.html',
                '../../appResources/controller/login/loginController'
            ))
            .when('/dashboard',
            routeConfig.config(
                'views/dashboard/dashboard.html',
                '../../appResources/controller/dashboard/dashboardController'
            ))

            .when('/restaurants',
            routeConfig.config(
                'views/restaurants/restaurantList.html',
                '../../appResources/controller/restaurants/restaurantController'
            ))

            .when('/newRestaurant',
            routeConfig.config(
                'views/restaurants/newRestaurant.html',
                '../../appResources/controller/restaurants/newRestaurantController'
            ))

            .otherwise({
                redirectTo: '/login'
            });
        //Will use it later.
        //Will know how. 
        $httpProvider.interceptors.push("authInterceptor");

        return app;
    });
});