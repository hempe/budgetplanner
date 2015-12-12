
/// <reference path='../../_all.ts' />
module app.routes.client {
	export interface Scope extends ng.IScope{
		client:components.IClient; 
	}

	'use strict';

	export class Controller {
		public static $inject = [
			'$scope',
			'$location',
			'app.services.IBusinessService',
			'app.services.IHeaderService'
		];
		constructor(
			private $scope: Scope,
			private $location: ng.ILocationService,
			private businessService: app.services.IBusinessService,
			headerService: app.services.IHeaderService
			){
			headerService.title = "Client";
			$scope.client = businessService.file().client;
		}
	}
}