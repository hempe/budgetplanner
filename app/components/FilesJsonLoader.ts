module app.components {
	'use strict';

	declare var X2JS;
	var x2js = new X2JS();

	export function LoadJsonFile(doc: { data: string }, file: IFile) {
		var dto = <IFile>angular.fromJson(doc.data);
		file.name = dto.name;
		_Group(dto.assets, file.assets);
		_Group(dto.revenue, file.revenue);
		
		for (var i = 0; i < dto.budgets.length; i++) {
			_Group(dto.budgets[i], file.budgets.add());
		};
		_Development(dto.development, file.development);
		_Element(dto.client, file.client);
	}

	function _Development(dto:IDevelopmentGroup, obj:IDevelopmentGroup){
		obj.from = dto.from;
		obj.to = dto.to;
		obj.name = dto.name;
		for (var i = 0; i < dto.elements.length; i++) {
			_Element(dto.elements[i], obj.elements.add());
		}
	}
	
	function _Element(dto: any, obj: any) {
		for (var property in dto) {
			if (dto.hasOwnProperty(property)) {
				obj[property] = dto[property];
			}
		}
	}

	function _Unit(dto: Unit<any>, obj: Unit<any>) {
		obj.name = dto.name;
		for (var k = 0; k < dto.elements.length; k++) {
			_Element(dto.elements[k], obj.elements.add());
		}
	}
	
	function _Group(dto:Group<any>, obj:Group<any>){
		_List(dto.negativ, obj.negativ);
		_List(dto.positiv, obj.positiv);
		obj.name = dto.name;
	}
	
	function _List(dto: IHasTotalList<Unit<any>>, obj: IHasTotalList<Unit<any>>) {
		for (var j = 0; j < dto.length; j++) {
			_Unit(dto[j],obj.add())
		}
	}
}