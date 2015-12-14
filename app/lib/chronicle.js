(function () {
  "use strict";

  var
    isUndefined = angular.isUndefined,
    isFunction = angular.isFunction,
    isArray = angular.isArray,
    isObject = angular.isObject,
    isDate = angular.isDate,
    bind = angular.bind;

  var changeType = {
    elementAdded: "ADDED",
    elementRemoved: "REMOVED",
    elementChanged: "CHANGED",
    arrayElementRemoved: 'ARRAY_ELEMENT_REMOVED',
    arrayElementAdded: 'ARRAY_ELEMENT_ADDED',
    unknown: 'UNKNOWN',
  }
  //These 3 functions are stolen from AngularJS to be able to use the modified angular.equals
  function isRegExp(value) {
    return value instanceof RegExp;
  }
  function isWindow(obj) {
    return obj && obj.window === obj;
  }
  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }

  function equalResult(equal, o1, o2, change) {
    if (equal) return [];
    return [{ uve: '', o: o1, n: o2, c: change }];
  }

  function addEqResults(returnEq, eq, key) {
    for (var i = 0; i < eq.length; i++) {
      eq[i].uve = '|' + String(key) + eq[i].uve;
      returnEq.push(eq[i]);
    }
  }

  function diff(oldValue, newValue) {

    if (oldValue === newValue) return equalResult(true);
    if (oldValue !== oldValue && newValue !== newValue) return equalResult(true);
    if (oldValue === undefined) return equalResult(false, oldValue, newValue, changeType.elementAdded);
    if (newValue === undefined) return equalResult(false, oldValue, newValue, changeType.elementRemoved);
    if (oldValue === null || newValue === null) return equalResult(false, oldValue, newValue, changeType.unknown);

    var typeOfOldValue = typeof oldValue, typeOfNewValue = typeof newValue, key, keySet, eq;
    var returnEq = [];
    if (typeOfOldValue == typeOfNewValue) {
      if (typeOfOldValue == 'string') {
        if (oldValue != newValue) {
          return equalResult(false, oldValue, newValue, changeType.elementChanged);
        }
      }
      if (typeOfOldValue == 'object') {
        if (isArray(oldValue)) {
          if (!isArray(newValue)) return equalResult(false, oldValue, newValue, changeType.elementChanged);
          var minLength = Math.min(oldValue.length, newValue.length);
          var maxLength = Math.max(oldValue.length, newValue.length);

          key = 0;
          for (key; key < minLength; key++) {
            eq = diff(oldValue[key], newValue[key]);
            addEqResults(returnEq, eq, key);
          }

          if (oldValue.length > newValue.length) {
            for (key; key < maxLength; key++) {
              eq = equalResult(false, oldValue[key], undefined, changeType.arrayElementRemoved);
              addEqResults(returnEq, eq, key);
            }
          }
          else if (oldValue.length < newValue.length) {
            for (key; key < maxLength; key++) {
              eq = equalResult(false, undefined, newValue[key], changeType.arrayElementAdded);
              addEqResults(returnEq, eq, key);
            }
          }
          return returnEq;

        } else if (isDate(oldValue)) {
          return equalResult(isDate(newValue) && oldValue.getTime() == newValue.getTime(), oldValue, changeType.elementChanged);
        } else if (isRegExp(oldValue) && isRegExp(newValue)) {
          return equalResult(oldValue.toString() == newValue.toString(), oldValue, changeType.elementChanged);
        } else {
          if (isScope(oldValue) || isScope(newValue) || isWindow(oldValue) || isWindow(newValue) || isArray(newValue)) {
            return equalResult(false, oldValue, newValue, changeType.unknown);
          }

          keySet = {};
          for (key in oldValue) {
            if (key.charAt(0) === '$' || isFunction(oldValue[key])) continue;
            eq = diff(oldValue[key], newValue[key]);
            addEqResults(returnEq, eq, key);

            keySet[key] = true;
          }
          for (key in newValue) {
            if (!keySet.hasOwnProperty(key) &&
              key.charAt(0) !== '$' &&
              newValue[key] !== undefined &&
              !isFunction(newValue[key])) {

              eq = diff(oldValue[key], newValue[key]);
              addEqResults(returnEq, eq, key);
            }
          }
          return returnEq;
        }
      }
    }
    return equalResult(false, oldValue, newValue, changeType.elementChanged);
  }

  angular.module('Chronicle', []).service('Chronicle', ['$rootScope', '$parse',
    function ($rootScope, $parse) {

      //This is called to create the Watch
      this.record = function record(scope) {
        var newWatch = new Watch(scope);
        return newWatch;
      };

      //Initializing Watch
      var Watch = function Watch(scope) {
        
        //scope
        if (isUndefined(scope)) {
          throw new Error("Undefined scope passed to Chronicle.");
        }
        else {
          if (isScope(scope)) {
            this.isScope = true;
          }
          else if (isObject(scope)) {
            this.isScope = false;
          }
          else {
            throw new Error("Incorrect scope type passed to Chronicle.");
          }
          this.scope = scope;
        }

        //Other variables on watch that need initializtion
        this.archive = [];
        this.onAdjustFunctions = [];
        this.onRedoFunctions = [];
        this.onUndoFunctions = [];
        this.currArchivePos = null;
        this.scope = scope;
        this.restoring = false;
        this.cancelWatch = {};
      };


      Watch.prototype.watch = function watch(wv) {
        var _this = this;
        if (_this.isScope) {
          //this is assuming the scope given variable is the angular '$scope'
          _this.cancelWatch[wv] = _this.scope.$watch(wv, function (newValue, oldValue) {
            _this.addToArchive.apply(_this, [wv, newValue, oldValue]);
          }, true);
        }
        else {
          //This is assuming the scope variable given is using the controller as syntax
          //this is a funkier way of doing the above because $scope obscures a lot of the magic needed to $watch a variable
          _this.cancelWatch[wv] = $rootScope.$watch(
            bind(_this, function () { return _this.$parse(wv)(_this.scope); }),
            function (newValue, oldValue) { _this.addToArchive.apply(_this, [wv, newValue, oldValue]); },
            true
            );
        }
        return _this;
      };

      Watch.prototype.addOnAdjustFunction = function addOnAdjustFunction(fn) {
        if (!isFunction(fn)) throw new Error("Function added to run on adjustment is not a function");
        this.onAdjustFunctions.push(fn);
      };

      Watch.prototype.removeOnAdjustFunction = function removeOnAdjustFunction(fn) {
        this.onAdjustFunctions.splice(this.onAdjustFunctions.indexOf(fn), 1);
      };


      Watch.prototype.addOnUndoFunction = function addOnUndoFunction(fn) {
        if (!isFunction(fn)) throw new Error("Function added to run on undo is not a function");
        this.onUndoFunctions.push(fn);
      };

      Watch.prototype.removeOnUndoFunction = function removeOnUndoFunction(fn) {
        this.onUndoFunctions.splice(this.onUndoFunctions.indexOf(fn), 1);
      };

      Watch.prototype.addOnRedoFunction = function addOnRedoFunction(fn) {
        if (!isFunction(fn)) throw new Error("Function added to run on redo is not a function");
        this.onRedoFunctions.push(fn);
      };

      Watch.prototype.removeOnRedoFunction = function removeOnRedoFunction(fn) {
        this.onRedoFunctions.splice(this.onRedoFunctions.indexOf(fn), 1);
      };

      Watch.prototype.undo = function undo() {
        if (!this.canUndo()) return false;

        this.revert(this.currArchivePos - 1);
        for (var i = 0; i < this.onUndoFunctions.length; i++)  this.onUndoFunctions[i]();
        return true;
      };

      Watch.prototype.redo = function redo() {
        if (!this.canRedo()) return false;

        this.revert(this.currArchivePos + 1);
        for (var i = 0; i < this.onRedoFunctions.length; i++)  this.onRedoFunctions[i]();
        return true;
      };

      Watch.prototype.revert = function revert(revertToPos) {
        var property, i, j, out, properties;

        while (this.currArchivePos > revertToPos && this.currArchivePos > 0) {
          properties = this.archive[this.currArchivePos - 1];
          for (i = 0; i < properties.length; i++) {
            property = properties[i].uve.split("|");
            out = $parse(property[0])(this.scope);
            for (j = 1; j < property.length - 1; j++) out = out[property[j]];
            out[property[j]] = properties[i].o;

          }
          this.currArchivePos--;
        }

        while (this.currArchivePos < revertToPos && this.currArchivePos < this.archive.length) {
          properties = this.archive[this.currArchivePos];
          for (i = 0; i < properties.length; i++) {
            property = properties[i].uve.split("|");
            out = $parse(property[0])(this.scope);;
            for (j = 1; j < property.length - 1; j++) out = out[property[j]];
            out[property[j]] = properties[i].n;
          }
          this.currArchivePos++;
        }

        this.restoring = true;
      };

      Watch.prototype.canRedo = function canRedo() {
        return (this.currArchivePos < this.archive.length);
      };

      Watch.prototype.canUndo = function canUndo() {
        return (this.currArchivePos > 0);
      };

      Watch.prototype.addToArchive = function addToArchive(watchVar, newValue, oldValue, world) {
        if (this.restoring) return this.restoring = false;
        var eq = diff(oldValue, newValue);
        if (eq.length == 0) return;
        for (var i = 0; i < eq.length; i++) eq[i].uve = watchVar + eq[i].uve;
        this.newEntry(eq);
      };

      Watch.prototype.newEntry = function newEntry(changedObject) {
        while (this.archive.length > this.currArchivePos) this.archive.pop();
        this.archive.push(changedObject);
        this.currArchivePos = this.archive.length;
        for (var i = 0; i < this.onAdjustFunctions.length; i++)  this.onAdjustFunctions[i]();
      }

    }]);
})();
