
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

interface ElementMenuScope extends ng.IScope {
    unit:components.Unit<components.IBudget>;
    removeElement(element: components.IBudget): void;
    moveElementUp(element: components.IBudget): void;
    moveElementDown(element: components.IBudget): void;
}

  function ElementMenuDirective(): ng.IDirective {
    return <ng.IDirective>{
      scope: {
        unit: '=',
        element: '=',
      },
      link: (scope: ElementMenuScope, element, attr) => {
        scope.removeElement = (element) =>{
          scope.unit.elements.remove(element);
        }
        scope.moveElementUp = (element) =>{
          scope.unit.elements.up(element);
        }
        scope.moveElementDown = (element) =>{
          scope.unit.elements.down(element);
        }
      },
      templateUrl: './app/directives/element-menu.html'

    };
  }
  Application.directive('bpElementMenu', ElementMenuDirective);
}