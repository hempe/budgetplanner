
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  interface UnitCardDirectiveScope extends ng.IScope {
    outerColor: string;
    innerColor: string;
    frequencies:[{name:string,value:number}];
    createData: () => ChartData;
    color:string;
    name:string
    units:components.HasTotalList<components.Unit<any>>;
    unitName:string;
    addUnit:()=>void;
    removeUnit:(unit:components.Unit<any>)=>void;
    addElement:(unit:components.Unit<any>)=>void;
    unitType:string;
  }

  function  UnitCardDirective($route:any,$routeParams:any, businessService:app.services.IBusinessService): ng.IDirective {
    return <ng.IDirective>{
      scope: {
        unitName: '@',
        unitType: '@',
        name: '=',
        color: "@"
      },
      link: (scope:  UnitCardDirectiveScope, element, attr) => {
        if($routeParams.hasOwnProperty("id")){
          scope.units = businessService.file()[scope.unitType][$routeParams["id"]][scope.unitName];
        }
        else{
          scope.units = businessService.file()[scope.unitType][scope.unitName];
        }
        scope.frequencies = app.components.frequencies;
        scope.outerColor = "budget-card-outer-"+scope.color;
        scope.innerColor = "budget-card-inner-"+scope.color;
        scope.createData = () => {
          var chartData = new ChartData();
          chartData.data.push([]);
          chartData.series.push("");
          
          scope.units.forEach((unit) => {
            chartData.labels.push(unit.name);
            chartData.data[0].push(unit.Total());  
          });
          return chartData;
        };
        
        scope.addUnit = () => scope.units.add().elements.add();
        scope.addElement = (unit) => unit.elements.add();
        scope.removeUnit = (unit) => scope.units.remove(unit);
        
      },
      replace: true,
      restrict: 'E',
      templateUrl: './app/directives/unit-card.html'

    };
  }
  Application.directive('bpUnitCard', ['$route','$routeParams','app.services.IBusinessService',  UnitCardDirective]);
}
