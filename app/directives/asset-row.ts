
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  interface AssetRowDirectiveScope extends ng.IScope {
     element: app.components.IAsset;
  }

  function AssetRowDirective($route:any,$routeParams:any): ng.IDirective {
    return <ng.IDirective>{
      scope:{
        element:"="
      },
      replace: true,
      restrict: 'E',
      templateUrl: './app/directives/asset-row.html'
    };
  }
  Application.directive('bpAssetRow', ['$route','$routeParams', AssetRowDirective]);
}
