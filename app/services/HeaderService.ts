/// <reference path='../_all.ts' />
module app.services {
	'use strict';

	export interface IHeaderService {
		title: string;
	}

	class HeaderService implements IHeaderService {
		constructor() {
		}
		public title: string;
	}
	
	Application.service('app.services.IHeaderService', HeaderService)
     
}
