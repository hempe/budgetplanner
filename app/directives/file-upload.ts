/*
/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';
  
  function fileUpload():ng.IDirective  {
    return {
      restrict: 'A',
      //require: 'ngModel',
      scope: {
        accept: "&",
        //fileChange: '&'
      },
      link: (scope: any, element, attr) => {
        console.log("stuff");
      },
    }
  }
  Application.directive('fileUpload', fileUpload);
}

*/


/// <reference path="../_all.ts"/>

module app.directives {
  'use strict';

  function FileUpload(): ng.IDirective {
    return <ng.IDirective>{
      scope: {
        bpUploaded: "="
        //accept: "="
      },
      link: (scope: any, element, attr) => {
        var elem = angular.element(element);
        var input = angular.element(element).children().children()[0];
        scope.accept = attr.accept;

        elem.on('change', (e: any) => {
          var file = e.target.files[0];
          if (!file) return;

          var reader = new FileReader();
          reader.onload = function(e: any) {
            var data = e.target.result;
            scope.bpUploaded({name:file.name, data:data})
          }
          reader.readAsText(file)
        });

        scope.$on('$destroy', () => {
          angular.element(element).off('change');
          element.remove();
        });

        scope.open = () => { input.click(); }
      },
      transclude: true,
      //replace:true,
      template: '<div><input accept="{{accept}}" style="display:none" type="file" name="file" id="file"><div ng-click="open()" ng-transclude></div></div>'
      //template: '<input type="file" name="file" id="file" ng-change="changed()" ng-model="stuff">'
    };
  }
  Application.directive('fileUpload', FileUpload);
}
