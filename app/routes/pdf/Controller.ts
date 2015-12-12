/// <reference path='../../_all.ts' />


module app.routes.pdf {
	'use strict';

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
			'app.services.IBusinessService',
			'app.services.IHeaderService',
			'app.services.IPDFService'
		];

		
		private file: components.IFile;
		
		constructor(
			private $scope: Scope,
			private $location: ng.ILocationService,
			private $translate: ng.translate.ITranslateService,
			businessService: app.services.IBusinessService,
			headerService: app.services.IHeaderService,
			pdfService: app.services.IPDFService) {
			
			headerService.title = "PDF";
			this.file = businessService.file();
			var doc = pdfService.createPDF(this.file);
			var ele = angular.element(document.getElementById("preview"));
			var data = doc.output('datauristring');
			ele.attr('src', data);	
		}
	}
}