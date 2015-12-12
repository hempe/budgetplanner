
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  function MoneyInputDirective(): ng.IDirective {
    return <ng.IDirective>{
      scope: {
        bpModel:"="
      },
      link: (scope: any, element, attr) => {
        scope.model = Number(scope.bpModel).formatMoney();
        scope.$watch('bpModel',(newValue, oldValue)=>{
          scope.model = Number(newValue).formatMoney();
        });
        scope.blur = ()=>{
          var num = Number(scope.model.replace("'",""));
          scope.bpModel = num;
        }
      },
      replace:true,
      template: '<input ng-blur="blur()" ng-model="model"/>'
    };
  }
  Application.directive('bpMoneyInput', MoneyInputDirective);
}
