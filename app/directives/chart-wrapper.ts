/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  export class ChartData {
    public labels: string[] = [];
    public series: string[] = [];
    public data: [number[]] = <any>[];
  }

  function CreateCustomTooltip(element, tooltip) {
	 
    //angular.element('#chartjs-tooltip');

    if (!tooltip) {
      element.css({
        opacity: 0
      });
      return;
    }

    element.removeClass('above below');
    element.addClass(tooltip.yAlign);

    console.log(tooltip);
    
    var innerHtml = "";
    if(tooltip.title != undefined)
      innerHtml += '<span class="tooltip-title">' + tooltip.title + '</span></br></br>';
    innerHtml += '<table>';
    if (tooltip.labels != undefined) {
      tooltip.labels.forEach(function(l, i) {
        var parts = l.split(":")
        innerHtml += '<tr>';
        innerHtml += '<td class="tooltip-label">' + parts[0].trim() + ': </td>';
        innerHtml += '<td class="tooltip-value" style="color:'
        + tooltip.legendColors[i].fill + '" >'
        + Number(parts[1].trim()).formatMoney() + '</td>';
        innerHtml += '</tr>';
      });
    }else if(tooltip.text != undefined){
      var parts = tooltip.text.split(":")
        innerHtml += '<tr>';
        innerHtml += '<td class="tooltip-label">' + parts[0].trim() + ': </td>';
        innerHtml += '<td class="tooltip-value">' + Number(parts[1].trim()).formatMoney() + '</td>';
        innerHtml += '</tr>';
    }
    innerHtml += '</table>';
    element.html(innerHtml);

    // Direkt dort wo die maus ist?
    element.css({
      opacity: 1,
      left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
      top: tooltip.chart.canvas.offsetTop + tooltip.y + 'px',
      fontFamily: tooltip.fontFamily,
      fontSize: tooltip.fontSize,
      fontStyle: tooltip.fontStyle,
    });
  }
  function ChartWrapperDirective($window): ng.IDirective {
    return <ng.IDirective>{
      scope: {
        chartType: "@",
        createData: "=",
        watch: "=",
        colors: "=",
        options: "=",
        legend: "@"
      },
      template:
      '<div>'
      + '<canvas class="chart-base" chart-type="chartType" chart-data="data" chart-labels="labels" chart-series="series" '
      + 'chart-legend="{{legend}}" chart-click="onClick"'
      + 'chart-options="options" chart-colours="colors" ></canvas>'
      + '<div class="chartjs-tooltip"></div>'
      + '</div>',
      link: ($scope: any, element, attr) => {
        $scope.$watch('watch', () => {
          console.warn("watchabel changed...");
          var data: ChartData = $scope.createData();
          $scope.labels = data.labels;
          $scope.series = data.series;
          $scope.data = data.data;
          console.log(data);
        }, true);
        $scope.onClick = function(points, evt) {
          console.log(points, evt);
        };

        $scope.$watch('options', ()=>{
          console.log("options %o",$scope.options);
        });
        var ele = angular.element(element[0].querySelector('.chartjs-tooltip'));
        var tooltipFunction = (tooltip) => CreateCustomTooltip(ele, tooltip);
          
        //element[0].querySelector('chartjs-tooltip')
          
        if ($scope.options == undefined) {
          $scope.options = {
            animation: true,
            scaleBeginAtZero: false,
            responsive: true,
            scaleGridLineColor: "rgba(0,0,0,0.1)",
            scaleLineColor: "rgba(255,255,255,0.8)",
            scaleFontColor: "rgba(255,255,255,0.8)",
            customTooltips: tooltipFunction,
          }
        }
        else {
          $scope.options.customTooltips = tooltipFunction;
        }
        if ($scope.colors == undefined)
          $scope.colors = [
            {
              fillColor: "rgba(255,255,255,0.5)",
              strokeColor: "rgba(255,255,255,0)",
              pointColor: "rgba(220,220,0,1)",
              pointStrokeColor: "#f00",
              pointHighlightFill: "#00f",
              pointHighlightStroke: "rgba(220,220,220,1)",
            },
            {
              fillColor: "rgba(0,0,0,0.5)",
              strokeColor: "rgba(0,0,0,0)",
              pointColor: "rgba(220,220,0,1)",
              pointStrokeColor: "#f00",
              pointHighlightFill: "#00f",
              pointHighlightStroke: "rgba(220,220,220,1)",
            }
          ];
      }
    }
  }
  Application.directive('bpChartWrapper', ChartWrapperDirective);
}

 