/// <reference path='../_all.ts' />
module app.services {
	'use strict';
		
	export interface IDemoService {
		currentCount:()=>string;	
	}
	
	class DemoService implements	IDemoService{
		
		constructor(){
			console.log("Create Demo Service");	
		}
		
		private _count = 0;
		
		public currentCount = () =>{
			this._count++;
			return this._count+"[<---]";	
		}	
	}
	
	Application.service('app.services.IDemoService', DemoService)
}
