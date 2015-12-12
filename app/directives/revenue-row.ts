/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  interface RevenueRowDirectiveScope extends ng.IScope {
     element: app.components.IRevenue;
  }

  function RevenueRowDirective($route:any,$routeParams:any): ng.IDirective {
    return <ng.IDirective>{
      scope:{
        element:"="
      },
      replace: true,
      restrict: 'E',
      templateUrl: './app/directives/revenue-row.html'
    };
  }
  Application.directive('bpRevenueRow', ['$route','$routeParams', RevenueRowDirective]);
}
