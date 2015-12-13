
/// <reference path='../_all.ts' />

declare var jsPDF;
declare var Chart;


module app.services {
    'use strict';
    export interface IPDFService {
        createPDF(file: components.IFile): any;
    }

	class PDFService implements IPDFService {

		private fontHeight: number = 12;
		private labels: string[] = <any>{};
		private rowHeight: number = 20;
		private marginTop: number = 40;
		private marginLeft: number = 40;
		private totalPagesExp = "{total_pages_count_string}";
		private pagecount: number = 0;


		private options = {
			animation: false,
			scaleBeginAtZero: false,
			responsive: false,
			legendShowLabels: true,
			scaleGridLineColor: "rgba(66,66,66,0.1)",
			scaleLineColor: "rgba(66,66,66,0.8)",
			scaleFontColor: "rgba(66,66,66,0.8)",
			//barDatasetSpacing: 50,
			//barValueSpacing: 50,
			scaleLabel: (valuePayload) => Number(valuePayload.value).formatMoney(0),
		};
		
		private optionsDevelopment = {
			animation: false,
			scaleBeginAtZero: false,
			responsive: false,
			legendShowLabels: true,
			scaleGridLineColor: "rgba(66,66,66,0.1)",
			scaleLineColor: "rgba(66,66,66,0.8)",
			scaleFontColor: "rgba(66,66,66,0.8)",
			scaleLabel: (valuePayload) => Number(valuePayload.value).formatMoney(0),
		};
		
		

		private colors = [
			{
				fillColor: "rgba(33,66,99,.5)",
				strokeColor: "rgba(0,0,0,0)",
			},
			{
				fillColor: "rgba(99,66,33,.5)",
				strokeColor: "rgba(0,0,0,0)",
			},
			{
				fillColor: "rgba(33,99,66,.5)",
				strokeColor: "rgba(0,0,0,0)",
			},
		];

		constructor(private $translate: ng.translate.ITranslateService) {

		}

		public createPDF(file: components.IFile): any {
			this.pagecount = 0;
			var doc = new jsPDF('portrait', 'pt', 'a4')
			//doc.setFont('Raleway');
			var pageHeight = doc.internal.pageSize.height;
			
			this.client(doc,file.client, file.name);
			
			doc.addPage();

			this.tableGroup(doc, file.assets,
				this.$translate.instant('ASSETS'),
				[this.$translate.instant('ASSETS_D2'), file.assets.positiv.Total().formatMoney()],
				this.$translate.instant('ASSETS'),
				[this.$translate.instant('DEBTS'), file.assets.negativ.Total().formatMoney()],
				(element: components.IAsset) => [element.name, element.value.formatMoney()]
			)
			
						this.tableGroup(doc, file.revenue,
							this.$translate.instant('ONE_TIME_REVENUE_AND_EXPENDITURE').replace("&amp;","&"),
							[this.$translate.instant('REVENUE'), "", file.revenue.positiv.Total().formatMoney()],
							this.$translate.instant('ONE_TIME_REVENUE_AND_EXPENDITURE').replace("&amp;","&"),
							[this.$translate.instant('EXPENDITURE'), "", file.revenue.negativ.Total().formatMoney()],
							(element: components.IRevenue) => [element.name, element.year, element.value.formatMoney()]
						)
						var translate = this.$translate(app.components.frequencies[0].name);
						
						file.budgets.forEach(budget=> {
							this.tableGroup(doc, budget,
								budget.name,
								[this.$translate.instant('INCOME'), "", "", budget.positiv.Total().formatMoney()],
								budget.name,
								[this.$translate.instant('EXPENSES'), "", "", budget.negativ.Total().formatMoney()],
								(element: components.IBudget) => [
									element.name,
									this.$translate.instant(app.components.frequencies[element.frequency].name),
									element.value.formatMoney(),
									element.Total().formatMoney()
								]);
						});
			


			this.development(doc, file);

			this.putTotalPages(doc);
			
			return doc;
		}


		private toDataset(chartData: any) {
			var cd: any = {};
			cd.labels = chartData.labels;
			cd.datasets = [];
			chartData.series.forEach((s, i) => {
				cd.datasets.push(
					{
						label: s,
						data: chartData.data[i],
						fillColor: this.colors[i].fillColor,
						strokeColor: this.colors[i].strokeColor,
					}
				);
			});
			return cd;
		}
		private client(doc, client: components.IClient, title:string) {

			var i = 1;

			this.header(doc, title);
			
			doc.setTextColor(44, 77, 170);
			
			if (client.company) {
				doc.setFontSize(this.fontHeight * 1.2);
				this.clientRow(doc, client.company, i++);
			}

			doc.setFontSize(this.fontHeight * 1.5);
			this.clientRow(doc, (client.name + " " + client.prename).trim(), i++);

			doc.setTextColor(0);
			doc.setFontSize(this.fontHeight * 1.2);
			i++;

			if (client.street) this.clientRow(doc, client.street, i++);
			this.clientRow(doc, (client.zipCode + " " + client.city).trim(), i++);

			i++;
			if (client.eMail) this.clientRow(doc, client.eMail, i++);
			if (client.telNumber) this.clientRow(doc, client.telNumber, i++);
			if (client.mobilNumber) this.clientRow(doc, client.mobilNumber, i++);

			i++;

			if (client.comment) this.clientRow(doc, client.comment, i++);
			
			this.footer(doc,this.marginLeft);
		}

		private development(doc, file): void {

			var dv = new routes.development.DevelopmentChartFactory(file);

			var d = dv.budgetTotals();
			console.log(d);
			var headerText = this.$translate.instant('ASSETDEVELOPMENT_LINK');

			var self = this;
			var rows = [];
			var columns = [this.$translate.instant('YEAR_BUDGET'), "", "", this.$translate.instant('RESIDUAL_ASSETS')];

			var index = 0;

			d.labels.forEach((l, i) => {
				rows.push([
					l,
					d.data[0][i].formatMoney(),
					d.data[1][i] == 0 ? "" : d.data[1][i].formatMoney(),
					d.data[2][i].formatMoney(),
				]);
			})

			var last = 0;


			var imgData = new Chart((<any>document.getElementById('canvas')).getContext('2d')).Bar(this.toDataset(dv.budgetTotals()), this.optionsDevelopment).toBase64Image();
			doc.addImage(imgData, 'PNG',
				this.marginLeft,
				this.marginTop + this.rowHeight * 2,
				doc.internal.pageSize.width - this.marginLeft * 2,
				(doc.internal.pageSize.width - this.marginLeft * 2) / 2);

			doc.autoTable(columns, rows,

				{
					startY: (doc.internal.pageSize.width - this.marginLeft * 2) / 2 + this.marginTop + this.rowHeight * 2.5,
					rowHeight: this.rowHeight,
					margin: { top: this.marginTop + this.rowHeight * 2, left: this.marginLeft, right: this.marginLeft, bottom: this.marginTop + this.rowHeight * 3 },
					createdHeaderCell: function(cell, data) {
						cell.styles.halign = 'right';
					},
					drawHeaderCell: function(cell, data) {
						if (data.column.dataKey == 0)
							cell.textPos.x = cell.x + cell.contentWidth - 5;
					},
					beforePageContent: (d) => {
						this.header(doc, headerText);
					},
					afterPageContent: (d) => this.footer(doc, d.settings.margin.left),

					styles: {
						fillStyle: 'DF',
						lineColor: 88,
						lineWidth: 0
					},
					headerStyles: {
						fillColor: 255,
						textColor: [44, 77, 170],
						fontSize: this.fontHeight * 1.4,
						rowHeight: this.rowHeight * 1.4,
						margin: 0,
						fontStyle: 'normal',
						lineColor: 255,
					},
					bodyStyles: {
						textColor: 0
					},
					alternateRowStyles: {
						fillColor: [240, 240, 240]
					},
					columnStyles: {
					},
					createdCell: function(cell, data) {
						if (data.column.dataKey > 0) {
							cell.styles.halign = 'right';
						}
					}
				}
			);
		}

		private clientRow(doc, value, row) {
			doc.text(value, this.marginLeft, this.marginTop * 2 + this.rowHeight * (row + 1) * 1.4);
		}

		private putTotalPages(doc) {
			if (typeof doc.putTotalPages === 'function')
				doc.putTotalPages(this.totalPagesExp);
		}

		private header(doc, text): void {
			doc.setTextColor(33, 66, 99);
			doc.setFontSize(this.fontHeight * 1.4);
			doc.text(text, this.marginLeft, this.marginTop + this.rowHeight);
		}

		private footer(doc, left): void {
			this.pagecount++;
			doc.setTextColor(0);
			doc.setFontSize(this.fontHeight * 0.8);
			var str = this.$translate.instant('PAGE') + " " + this.pagecount;
			if (typeof doc.putTotalPages === 'function') {
				str = str + " " + this.$translate.instant('PAGE_OFF') + " " + this.totalPagesExp;
			}
			doc.text(str, left, doc.internal.pageSize.height - this.marginTop);
		}

		private subLabel(doc, row, data): void {
			doc.setFontSize(this.fontHeight * 1.1);
			if (this.labels[row.index]) {
						
				//Das wäre für rect rund herum...
				//doc.rect(data.settings.margin.left, row.y, data.table.width, 20, 'S');
				doc.autoTableText(this.labels[row.index],
					data.settings.margin.left + 5,
					row.y + row.height / 2, {
						halign: 'left',
						valign: 'top'
					});
				data.cursor.y += this.rowHeight * 1.8;
			}
		}

		private table(doc, unit, headerText, columns, elementfunc): void {
			var oldpage = this.pagecount;

			var self = this;
			var rows = [];
			var index = 0;
			unit.forEach((group) => {
				self.labels[index] = group.name;
				group.elements.forEach((element, i) => {
					index++;
					rows.push(elementfunc(element));
				})
			})

			var chartData = new directives.ChartData();
			chartData.data.push([]);
			chartData.series.push("");

			unit.forEach((u) => {
				chartData.labels.push(u.name);
				chartData.data[0].push(u.Total());
			});


			var imgData = new Chart((<any>document.getElementById('canvas')).getContext('2d')).Bar(this.toDataset(chartData), this.options).toBase64Image();
			doc.addImage(imgData, 'PNG',
				this.marginLeft,
				this.marginTop + this.rowHeight * 2,
				doc.internal.pageSize.width - this.marginLeft * 2,
				(doc.internal.pageSize.width - this.marginLeft * 2) / 2);

			var last = 0;
			doc.autoTable(columns, rows,
				{
					startY: (doc.internal.pageSize.width - this.marginLeft * 2) / 2 + this.marginTop + this.rowHeight * 2.5,
					rowHeight: this.rowHeight,
					margin: { top: this.marginTop + this.rowHeight * 2, left: this.marginLeft, right: this.marginLeft, bottom: this.marginTop + this.rowHeight * 3 },
					drawRow: function(row, data) {
						self.subLabel(doc, row, data);
					},
					createdHeaderCell: function(cell, data) {
						cell.styles.halign = 'right';
					},
					drawHeaderCell: function(cell, data) {
						if (data.column.dataKey == 0)
							cell.textPos.x = cell.x + cell.contentWidth - 5;
					},
					beforePageContent: (d) => { this.header(doc, headerText); },
					afterPageContent: (d) => this.footer(doc, d.settings.margin.left),

					styles: {
						fillStyle: 'DF',
						lineColor: 88,
						lineWidth: 0
					},
					headerStyles: {
						fillColor: 255,
						textColor: [44, 77, 170],
						fontSize: this.fontHeight * 1.4,
						rowHeight: this.rowHeight * 1.4,
						margin: 0,
						fontStyle: 'normal',
						lineColor: 255,
					},
					bodyStyles: {
						textColor: 0
					},
					alternateRowStyles: {
						fillColor: [240, 240, 240]
					},
					columnStyles: {
					},
					createdCell: function(cell, data) {
						if (data.column.dataKey > 0) {
							cell.styles.halign = 'right';
						}
					}
				}
			);

			doc.addPage();
		}
		private tableGroup(doc,
			group: components.Group<any>,
			positiv: string,
			headerpositiv: string[],
			negativ: string,
			headernegativ: string[],
			elementfunc: any) {
			this.table(
				doc,
				group.positiv,
				positiv,
				headerpositiv,
				elementfunc
			);
			this.table(
				doc,
				group.negativ,
				negativ,
				headernegativ,
				elementfunc
			);
		}
	}
	Application.service('app.services.IPDFService', PDFService);
}