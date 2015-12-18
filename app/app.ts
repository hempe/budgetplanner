/// <reference path='_all.ts' />

module app {
    'use strict';

    export function setLoader(loaderShowing: boolean) {
        if (loaderShowing) {
            document.getElementById("content-wrapper").style.display = "none";
            document.getElementById("loader-wrapper").style.display = "block";
        }
        else {
            document.getElementById("content-wrapper").style.display = "block";
            document.getElementById("loader-wrapper").style.display = "none";
        }
    }

    export var Application = angular.module('app',
        [
            'ngRoute',
            'ngMdIcons',
            'ngMaterial',
            'pascalprecht.translate',
            'angular-sortable-view',
            'simple-history',
            'chart.js',
            'chrome-sandbox'
        ], ($provide) => {
            $provide.decorator('$window', function($delegate) {
                //$delegate.history = null;
                return $delegate;
            });
        }
    )
        .config(($mdThemingProvider: ng.material.IThemingProvider) => {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('grey');
            $mdThemingProvider.theme('group')
                .primaryPalette('teal')
                .accentPalette('pink');
            setLoader(false);
        });
}




function watchers() {

    var root = angular.element(document.getElementById('content-wrapper'));

    var watchers = [];

    var f = function(element) {
        angular.forEach(['$scope', '$isolateScope'], function(scopeProperty) {
            if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
                    watchers.push(watcher);
                });
            }
        });

        angular.forEach(element.children(), function(childElement) {
            f(angular.element(childElement));
        });
    };

    f(root);

    // Remove duplicate watchers
    var watchersWithoutDuplicates = [];
    angular.forEach(watchers, function(item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
            watchersWithoutDuplicates.push(item);
        }
    });

    console.log(watchersWithoutDuplicates.length);

};
