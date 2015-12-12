/// <reference path='../../_all.ts' />


module app.routes.pdf {
	'use strict';

	declare var Chart;
	
	export interface Scope extends ng.IScope {
		render(): void;
	}

	export class Controller {
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope',
			'$location',
			'$translate',
			'$timeout',
			'app.services.IBusinessService',
			'app.services.IHeaderService',
			'app.services.IPDFService'
		];

		private file: components.IFile;

		constructor(
			private $scope: any,
			private $location: ng.ILocationService,
			private $translate: ng.translate.ITranslateService,
			private $timeout: ng.ITimeoutService,
			businessService: app.services.IBusinessService,
			headerService: app.services.IHeaderService,
			pdfService: app.services.IPDFService) {

			document.getElementById("content-wrapper").style.display = "none";
            document.getElementById("loader-wrapper").style.display = "block";
			
			$timeout(()=>{
			headerService.title = "PDF";
			this.file = businessService.file();
			

			var doc = pdfService.createPDF(this.file);
			
			var ele = angular.element(document.getElementById("preview"));
			var data = doc.output('bloburl');
			
			console.log(data);
			ele.attr('src', data);
			
			document.getElementById("content-wrapper").style.display = "block";
            document.getElementById("loader-wrapper").style.display = "none";
			},0);
		}
	}
}