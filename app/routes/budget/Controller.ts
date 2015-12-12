
/// <reference path='../../_all.ts' />
module app.routes.budget {
	'use strict';

	interface Scope extends ng.IScope{
		otherMessage:string;
		current: components.Group<components.IBudget>;
		copy:(budget: components.Group<components.IBudget>) => void;
		undo:()=>void;
		redo:()=>void;
	}
	
	export class Controller {
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope',
			'$location',
			'$routeParams',
			'app.services.IHeaderService',
			'app.services.IBusinessService',
		];

		constructor(
			private $scope: Scope, 
			private $location: ng.ILocationService, 
			private $routeParams: ng.route.IRouteParamsService,
			private headerService: app.services.IHeaderService,
			private businessService: app.services.IBusinessService
			) {	
				
				console.log("Do I get here?")
				$scope.current =  businessService.file().budgets[$routeParams["id"]];
				
				$scope.copy = (b: components.Group<components.IBudget>) => businessService.file().budgets.add(b);
				headerService.title = "Budget";
				
				$scope.otherMessage = "This is from the Controller (Budget Message)";
		}
	}
}