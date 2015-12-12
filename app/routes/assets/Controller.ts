
/// <reference path='../../_all.ts' />
module app.routes.assets {
	'use strict';

	interface Scope extends ng.IScope {
		type: string;
		assets: boolean;
		oneTime: boolean;
		goto: (t: string) => void;
		current: any;
		index:number;
	}

	export class Controller {
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope',
			'$route',
			'$routeParams',
			'app.services.IBusinessService',
			'app.services.IHeaderService',
		];

		constructor(
			$scope: Scope,
			$route: any,
			$routeParams: ng.route.IRouteParamsService,
			businessService:app.services.IBusinessService,
			headerService: app.services.IHeaderService
		) {
			
			$scope.type = $routeParams["type"];
			$scope.index =  ($scope.type == 'assets') ? 0 : 1;
			$scope.current = businessService.file()[$scope.type]; 
			console.log($scope.current);
			headerService.title = "Assets";
			$scope.oneTime = $scope.type == "revenue";
			$scope.assets = $scope.type == "assets";
			$scope.goto = (t) => {
				$routeParams["type"] = t;
				$route.updateParams($routeParams)
			}
		}
	}
}