/// <reference path='_all.ts' />

module app {
    'use strict';

	declare var download: any;
	declare var chrome: any;

	interface AppScope extends ng.IScope {
		menus: [{ name: string, icon: string, link: string }];
		message: string;
		goto(link: { link: string }): void;
		toggleSideNav(): void;
		title(): string;
		setLanguage(language:string): void;

		uploaded(file): void;
		download(): void;

		openChromeFile(): void;
		saveChromeFile(): void;

		undo(): void;
		redo(): void;
		canUndo(): void;
		canRedo(): void;
		isChromeApp: boolean;
	}

    export class AppController {
		public static $inject = [
			'$scope',
			'$rootScope',
			'$location',
			'$mdSidenav',
			'$translate',
			'app.services.IHeaderService',
			'app.services.IBusinessService',
			'app.services.IPDFService',

		];
		constructor(
			private $scope: AppScope,
			private $rootScope: any,
			private $location: ng.ILocationService,
			private $mdSidenav: any,
			private $translate: ng.translate.ITranslateProvider,
			private headerService: app.services.IHeaderService,
			private businessService: app.services.IBusinessService,
			private pdfService: app.services.IPDFService
		) {
			var chronicle = <angular.chronicle.IWatch>($rootScope.chronicle);
			$scope.undo = () => {
				console.log("undoo");
				chronicle.undo();
			}
			$scope.redo = () => chronicle.redo();
			$scope.canRedo = () => chronicle.canRedo();
			$scope.canUndo = () => chronicle.canUndo();
			$scope.isChromeApp = window != window.top;
			
			//wrapper.chrome.onInit(() => $scope.$apply(() => $scope.isChromeApp = true));
			$scope.message = "Hello"
			$scope.menus = [
				{
					name: "HOME_LINK",
					icon: "dashboard",
					link: ""
				},
				{
					name: "CLIENT_LINK",
					icon: "account_circle",
					link: "client"
				},
				{
					name: "BUDGET_LINK",
					icon: "account_balance_wallet",
					link: "budget/0"
				},
				{
					name: "ASSETS_LINK",
					icon: "account_balance",
					link: "assets/assets"
				},
				{
					name: "ASSETDEVELOPMENT_LINK",
					icon: "equalizer",
					link: "development"
				},
				{
					name: "PDF",
					icon: "print",
					link: "pdf"
				},
			]

			$scope.goto = (menu) => {
				console.log("redirect to..." + menu.link);
				if (menu.link == "pdf" && window != window.top) {
					this.openPDF();
				}
				else {
					$location.path("/" + menu.link+"/");
					$mdSidenav('left').close();
				}
			};

			$scope.toggleSideNav = () => {
				$mdSidenav('left').open();
            };

			$scope.setLanguage = (language) => this.businessService.file().language = language;
			

			$scope.title = () => headerService.title;
			$scope.uploaded = (file) => { businessService.open(file); }
			$scope.download = () => { download(angular.toJson(businessService.file()), businessService.file().name + ".bpj", "text/json"); }
			$scope.openChromeFile = () => { businessService.openChromeFile() };
			$scope.saveChromeFile = () => { businessService.saveChromeFile() };
		}

		private openPDF() {
			var doc = this.pdfService.createPDF(this.businessService.file());
			var data = doc.output('arraybuffer');
			this.businessService.openChromePdf(data);
		}
	}
    Application.controller('AppController', app.AppController);
}
