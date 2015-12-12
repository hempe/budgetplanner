/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';
  interface BudgetSwitcherScope extends ng.IScope {
    budgets: components.IExtendedList<components.Group<components.IBudget>>;
    current: components.Group<components.IBudget>;
    index:number;
    goto($index):void;
    sort($indexFrom,$indexTo):void;
  }


  function BudgetSwitcherDirective($route:any,$routeParams:any, businessService:app.services.IBusinessService): ng.IDirective {
    return <ng.IDirective>{
      replace: true,
      restrict: 'E',
      templateUrl: './app/directives/budget-switcher.html',
      link: (scope: BudgetSwitcherScope, element, attr) => {
        scope.index = $routeParams["id"];
        scope.goto = ($index) => {
          $routeParams["id"]= $index;
          $route.updateParams($routeParams)
        };
        scope.budgets = businessService.file().budgets;
        scope.current = businessService.file().budgets[$routeParams["id"]];
      }
    };
  }

  Application.directive('bpBudgetSwitcher', ['$route','$routeParams','app.services.IBusinessService', BudgetSwitcherDirective]);
}