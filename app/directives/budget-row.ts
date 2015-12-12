
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  interface BudgetRowDirectiveScope extends ng.IScope {
    frequencies:[{name:string,value:number}];
     element: app.components.IBudget;
  }

  function BudgetRowDirective($route:any,$routeParams:any): ng.IDirective {
    return <ng.IDirective>{
      scope:{
        element:"="
      },
      link: (scope: BudgetRowDirectiveScope, element, attr) => {
        scope.frequencies = app.components.frequencies;        
      },
      replace: true,
      restrict: 'E',
      templateUrl: './app/directives/budget-row.html'
    };
  }
  Application.directive('bpBudgetRow', ['$route','$routeParams', BudgetRowDirective]);
}
