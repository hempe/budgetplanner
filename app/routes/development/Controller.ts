/// <reference path='../../_all.ts' />

module app.routes.development {
	'use strict';

	export class DevelopmentChartFactory {

		private budgetTotalArr = [];
		private revenueTotalArr = [];
		private assets: number;

		constructor(private file: components.IFile) {
			file.budgets.forEach((b) => {
				this.budgetTotalArr.push(b.positiv.Total() - b.negativ.Total());
			});

			file.revenue.positiv.forEach(p=> {
				p.elements.forEach(e=> {
					if (this.revenueTotalArr[e.year] == undefined)
						this.revenueTotalArr[e.year] = 0;
					this.revenueTotalArr[e.year] += e.value;
				});
			});

			file.revenue.negativ.forEach(p=> {
				p.elements.forEach(e=> {
					if (this.revenueTotalArr[e.year] == undefined)
						this.revenueTotalArr[e.year] = 0;
					this.revenueTotalArr[e.year] -= e.value;
				});
			});
			this.assets = file.assets.positiv.Total() - file.assets.negativ.Total();
		}

		public budgetTotals() {
			var chartData = new app.directives.ChartData();
			chartData.series.push("Budget");
			chartData.series.push("Revenue");
			chartData.series.push("Assets");
			
			chartData.data.push([]);
			chartData.data.push([]);
			chartData.data.push([]);

			var currentAsset = this.assets;

			this.revenueTotalArr.forEach((value, year) => {
				if (year < this.file.development.from)
					currentAsset += value;
			});
			
			for (var year = this.file.development.from; year < this.file.development.to; year++) {
				

				var budget = this.budgetTotalArr[0];
				var budgetIndex = 0;
				for (var i = 0; i < this.file.development.elements.length; i++) {
					if (this.file.development.elements[i].year <= year) {
						budget = this.budgetTotalArr[this.file.development.elements[i].budget];
						budgetIndex = i;
					}
				}
				
				chartData.labels.push(year.toString()+" ("+this.file.budgets[budgetIndex].name+")");
				
				chartData.data[0].push(budget);
				if (this.revenueTotalArr[year] !== undefined)
					chartData.data[1].push(this.revenueTotalArr[year]);
				else
					chartData.data[1].push(0);
					
				currentAsset += budget;
				chartData.data[2].push(currentAsset);
			}

			return chartData;
		};
	}
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

			var chartDate = new DevelopmentChartFactory(file);
			$scope.budgetTotals = () => { return chartDate.budgetTotals() };


			$scope.options = {
				animation: true,
				scaleBeginAtZero: false,
				responsive: true,
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



		}
	}
}