/// <reference path='_all.ts' />

module app {
    'use strict';
	Application.config(['$translateProvider', function($translateProvider: ng.translate.ITranslateProvider) {
		$translateProvider.translations('de',
			<ng.translate.ITranslationTable>{
				'INCOME': 'Einnahmen',
				'EXPENSES': 'Ausgaben',
				'ASSETS': "Vermögenswerte",
				'ASSETS_D2': "Vermögen",
				'DEBTS': 'Schulden',
				'ASSETS_AND_DEBTS': 'Vermögen & Schulden',
				'ONE_TIME_REVENUE_AND_EXPENDITURE': 'Einmahlige Einnahmen & Ausgaben',
				'REVENUE':'Einnahmen',
				'EXPENDITURE':'Ausgaben',
				'ADD_NEW_GROUP': 'Neue Gruppe hinzufügen',
				"HOME_LINK": 'Home',
				"CLIENT_LINK": 'Klient',
				"BUDGET_LINK": 'Budget',
				"ASSETS_LINK": 'Vermögen',
				"ASSETDEVELOPMENT_LINK": 'Vermögensentwicklung',
				"RESIDUAL_ASSETS":"Restvermögen",
				"YEAR_BUDGET":'Jahr (Budget)',
				"LOGOUT_LINK": 'Logout',
				'FREQUENCY_NEVER': 'Nie',
				'FREQUENCY_DAILY': 'Täglich',
				'FREQUENCY_WEEKLY': 'Wöchentlich',
				'FREQUENCY_MONTHLY': 'Monatlich',
				'FREQUENCY_YEARLY': 'Yährlich',
				'PAGE': "Seite",
				'PAGE_OFF': "von",
				'DELETE': "Löschen",
				'MOVE_UP': "Nach oben",
				'MOVE_DOWN': "Nach unten",
				'ADD_ELEMENT': "Neues Element hinzufügen",
			}
		);
		$translateProvider.translations('en',
			<ng.translate.ITranslationTable>{
				'INCOME': 'Income',
				'EXPENSES': 'Expenses',
				'ASSETS': "Assets",
				'ASSETS_D2': "Assets",
				'DEBTS': 'Debts',
				'ASSETS_AND_DEBTS': 'Assets & Debpts',
				'ONE_TIME_REVENUE_AND_EXPENDITURE': 'One-Time revenue & expenditure',
				'REVENUE':'Revenue',
				'EXPENDITURE':'Expenditure',
				'ADD_NEW_GROUP': 'Add new group',
				"HOME_LINK": 'Home',
				"CLIENT_LINK": 'Client',
				"BUDGET_LINK": 'Budget',
				"ASSETS_LINK": 'Assets',
				"ASSETDEVELOPMENT_LINK": 'Asset development',
				"RESIDUAL_ASSETS":"Residual assets",
				"YEAR_BUDGET":'Year (Budget)',
				"LOGOUT_LINK": 'Logout',
				'FREQUENCY_NEVER': 'Never',
				'FREQUENCY_DAILY': 'Daily',
				'FREQUENCY_WEEKLY': 'Weekly',
				'FREQUENCY_MONTHLY': 'Monthly',
				'FREQUENCY_YEARLY': 'Yearly',
				'PAGE': "Page",
				'PAGE_OFF': "of",
				'DELETE': "Delete",
				'MOVE_UP': "Move up",
				'MOVE_DOWN': "Move down",
				'ADD_ELEMENT': "Add new element",
			}
		);
		$translateProvider.useSanitizeValueStrategy('escape');

		//$translateProvider.determinePreferredLanguage();
		console.log("preferred %o", $translateProvider.preferredLanguage());
		$translateProvider.fallbackLanguage('de');
		$translateProvider.use('en');
	}]);
}


