/// <reference path='_all.ts' />

module app {
    'use strict';
    
    Application.config(function($routeProvider: ng.route.IRouteProvider) {
        console.log("Setup Routes");
        $routeProvider
            .when('/client', {
                templateUrl : 'app/routes/client/View.html',
                controller  : routes.client.Controller,
            })
            .when('/budget/:id', {
                templateUrl : 'app/routes/budget/View.html',
                controller  : routes.budget.Controller,
            })
            .when('/assets/:type', {
                templateUrl : 'app/routes/assets/View.html',
                controller  : routes.assets.Controller,
            })
            .when('/development', {
                templateUrl : 'app/routes/development/View.html',
                controller  : routes.development.Controller,
            })
            .when('/pdf', {
                templateUrl : 'app/routes/pdf/View.html',
                controller  : routes.pdf.Controller,
            })
            .otherwise({
                templateUrl : 'app/routes/home/View.html',
                controller  : routes.home.Controller,
            });
    });   
    
}