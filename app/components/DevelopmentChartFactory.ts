/// <reference path='../_all.ts' />
module app.components {
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
						if (this.file.development.elements[i].budget >= this.file.budgets.length) {
							this.file.development.elements[i].budget = this.file.budgets.length - 1;
						}

						budget = this.budgetTotalArr[this.file.development.elements[i].budget];
						budgetIndex = this.file.development.elements[i].budget;
					}
				}

				chartData.labels.push(year.toString() + " (" + this.file.budgets[budgetIndex].name + ")");

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
}