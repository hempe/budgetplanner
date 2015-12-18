/// <reference path='../../_all.ts' />

module app.routes.development {
	'use strict';

	interface Scope extends ng.IScope {
		development: app.components.IDevelopmentGroup;
		budgets: components.IExtendedList<components.Group<components.IBudget>>;
		assetTotals: () => any;
		budgetTotals: () => any;
		revenueTotals: () => any;
		budgetTotalArr: number[];
		revenueTotalArr: number[];
		assets: number;
		options: any;
		colors: any[];
		remove(e);
	}
	
	export class Controller {
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope',
			'$location',
			'app.services.IBusinessService',
			'app.services.IHeaderService'
		];

		constructor(
			private $scope: Scope, private $location: ng.ILocationService,
			private businessService: app.services.IBusinessService,
			headerService: app.services.IHeaderService) {

			headerService.title = "Development";
			var file = businessService.file();

			$scope.development = file.development;
			$scope.budgets = file.budgets;

			var chartDate = new components.DevelopmentChartFactory(file);
			$scope.budgetTotals = () => { return chartDate.budgetTotals() };

			$scope.remove = (e) => {
				if($scope.development.elements.length > 1) $scope.development.elements.remove(e)
			}
			
			$scope.options = {
				animation: false,
				scaleBeginAtZero: false,
				responsive: true,
				legendShowLabels: window.innerWidth > 960,
				scaleGridLineColor: "rgba(66,66,66,0.1)",
				scaleLineColor: "rgba(66,66,66,0.8)",
				scaleFontColor: "rgba(66,66,66,0.8)",
				scaleLabel: (valuePayload) => Number(valuePayload.value).formatMoney(0),
			}

			$scope.colors = [
				{
					fillColor: "rgba(51,102,204,1)",
					strokeColor: "rgba(0,0,0,0)",
				},
				{
					fillColor: "rgba(255,153,0,1)",
					strokeColor: "rgba(0,0,0,0)",
				},
				{
					fillColor: "rgba(16,153,24,1)",
					strokeColor: "rgba(0,0,0,0)",
				},
			];

			window.onresize = ()=>{
				var legendShowLabels = window.innerWidth > 960;
				if($scope.options.legendShowLabels != legendShowLabels){
					$scope.$apply(()=>{
						$scope.options.legendShowLabels = legendShowLabels;
					});
				} 
			};
			
			$scope.$watch('development', () => {
				if ($scope.development.elements[0].year != $scope.development.from) {
					$scope.development.elements[0].year = $scope.development.from;
				}
				for (var i = 1; i < $scope.development.elements.length; i++) {
					if ($scope.development.elements[i].year <= $scope.development.elements[i - 1].year) {
						$scope.development.elements[i].year = $scope.development.elements[i - 1].year + 1;
					}
				}
			}, true);


		}
	}
}