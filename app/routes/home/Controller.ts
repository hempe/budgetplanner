/// <reference path='../../_all.ts' />

module app.routes.home {
	'use strict';

	interface Scope extends ng.IScope {
		file: components.IFile;
		options: any;
		budgetColors: any;
		assetColors: any;
		developmentColors: any;
		createDataBudget():any;
		createDataAsset(): any;
		createDataRevenue(): any;
		createDataDevelopment(): any;
		goto(link: string): void;
		windowWidth: number;
		developmentOptions:any;
	}

	export class Controller {

		public static $inject = [
			'$scope',
			'$location',
			'$timeout',
			'$translate',
			'app.services.IBusinessService',
			'app.services.IPDFService',
			'app.services.IHeaderService'
		];
		constructor(
			private $scope: Scope,
			private $location: ng.ILocationService,
			private $timeout: any,
			private $translate: ng.translate.ITranslateService,
			private businessService: app.services.IBusinessService,
			private pdfService: app.services.IPDFService,
			private headerService: app.services.IHeaderService
		) {
			
			var developmentChart = new development.DevelopmentChartFactory(businessService.file());
			
			$scope.options = {
				animation: true,
				scaleBeginAtZero: true,
				responsive: true,
				scaleGridLineColor: "rgba(225,225,225,1)",
				scaleLineColor: "rgba(225,225,225,1)",
				//barDatasetSpacing: 50,
				//barValueSpacing: 50,
				scaleShowLabels : false,
				legendShowLabels : false,
			}
			
			$scope.developmentOptions = angular.copy($scope.options);
			$scope.developmentOptions.scaleBeginAtZero = false;
			//$scope.developmentOptions.barDatasetSpacing = 5;
			//$scope.developmentOptions.barValueSpacing = 1;

			$scope.budgetColors = [
				{
					fillColor: "#6abd20",
					strokeColor: "rgba(0,0,0,0)",
				},
				{
					fillColor: "#e55126",
					strokeColor: "rgba(0,0,0,0)",
				}
			];

			$scope.assetColors = [
				{
					fillColor: "#0c73b8",
					strokeColor: "rgba(0,0,0,0)",
				},
				{
					fillColor: "#e5a228",
					strokeColor: "rgba(0,0,0,0)",
				}
			];
			$scope.developmentColors = [
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


			$scope.file.revenue

			headerService.title = "Home";
			$scope.file = businessService.file();

			$scope.createDataBudget  = () => {
				var chartData = new directives.ChartData();
				chartData.series.push($translate.instant('INCOME'));
				chartData.data.push([]);
				chartData.series.push($translate.instant('EXPENSES'));
				chartData.data.push([]);
					
				$scope.file.budgets.forEach((budget) => {
					chartData.labels.push(budget.name);
					chartData.data[0].push(budget.positiv.Total());	
					chartData.data[1].push(budget.negativ.Total());
				});
				return chartData;
			}
			
			$scope.createDataAsset = () => {
				var chartData = new directives.ChartData();
				chartData.series.push($translate.instant('ASSETS_D2'));
				chartData.data.push([]);
				chartData.data[0].push($scope.file.assets.positiv.Total());

				chartData.series.push($translate.instant('DEBTS'));
				chartData.data.push([]);
				chartData.data[1].push($scope.file.assets.negativ.Total());
				return chartData;
			}

			$scope.createDataRevenue = () => {
				var chartData = new directives.ChartData();
				chartData.series.push($translate.instant('REVENUE'));
				chartData.data.push([]);
				chartData.data[0].push($scope.file.revenue.positiv.Total());

				chartData.series.push($translate.instant('EXPENDITURE'));
				chartData.data.push([]);
				chartData.data[1].push($scope.file.revenue.negativ.Total());
				return chartData;
			}

			$scope.createDataDevelopment = () => developmentChart.budgetTotals();

			$scope.goto = (link) => {
				console.log("redirect to..." + link);
				if (link == "pdf" && window != window.top) {
					var doc = pdfService.createPDF(this.businessService.file());
					var data = doc.output('arraybuffer');
					this.businessService.openChromePdf(data);
				}
				else {
					$location.path("/" + link + "/");
				}
			};

		}
	}
}
