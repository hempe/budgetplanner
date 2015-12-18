

"use strict";
/// <reference path='../../_all.ts' />
module simpleHistory {

  export interface IAdjustFunction { (): void; }

  export interface IUndoFunction { (): void; }

  export interface IRedoFunction { (): void; }

  export interface ISimpleHistory {
    //Adds a function that will be called whenever a new archive entry is created
    addOnAdjustFunction(fn: IAdjustFunction): void;
    //Removes a function that will is called whenever a new archive entry is created
    removeOnAdjustFunction(fn: IAdjustFunction): void;
    //Adds a function that will be called whenever an undo happens
    addOnUndoFunction(fn: IUndoFunction): void;
    //Removes a function that is called whenever an undo happens
    removeOnUndoFunction(fn: IUndoFunction): void;
    //Adds a function that will be called whenever an redo happens
    addOnRedoFunction(fn: IRedoFunction): void;
    //Removes a function that is called whenever an undo happens
    removeOnRedoFunction(fn: IRedoFunction): void;
    //Performs the entire undo on the Watch object
    //Returns: true if successful undo, false otherwise
    undo(): boolean;
    //Performs the entire redo on the Watch object
    //Returns: true if successful undo, false otherwise
    redo(): boolean;
    //Returns true if a redo can be performed, false otherwise
    canRedo(): boolean;
    //Returns true if an undo can be performed, false otherwise
    canUndo(): boolean;

    watch(scope: ng.IScope | ng.IRootScopeService, watchExpr: string, merge?: number);
    cancel(scope: ng.IScope | ng.IRootScopeService, watchExpr: string);
    remove(scope: ng.IScope | ng.IRootScopeService, watchExpr: string);

    maxLength: number;
  }

  export enum ChangeType {
    added,
    removed,
    changed,
    popped,
    pushed,
    unknown,
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

  function equalResult(equal, o1?, o2?, change?): [IObjectDiff] {
    if (equal) return <any>[];
    
    return [{ uve: '', o: angular.copy(o1), n: angular.copy(o2), c: change }];
  }

  interface IObjectDiff {
    uve: string;
    o?: any;
    n?: any;
    c?: ChangeType;
  }

  function addEqResults(returnEq, eq, key) {
    for (var i = 0; i < eq.length; i++) {
      eq[i].uve = '|' + String(key) + eq[i].uve;
      returnEq.push(eq[i]);
    }
  }

  function diff(oldValue, newValue): [IObjectDiff] {

    if (oldValue === newValue) return equalResult(true);
    if (oldValue !== oldValue && newValue !== newValue) return equalResult(true);
    if (oldValue === undefined) return equalResult(false, oldValue, newValue, ChangeType.added);
    if (newValue === undefined) return equalResult(false, oldValue, newValue, ChangeType.removed);
    if (oldValue === null || newValue === null) return equalResult(false, oldValue, newValue, ChangeType.unknown);

    var typeOfOldValue = typeof oldValue, typeOfNewValue = typeof newValue, key, keySet, eq;
    var returnEq: [IObjectDiff] = <any>[];
    if (typeOfOldValue == typeOfNewValue) {
      if (typeOfOldValue == 'string') {
        if (oldValue != newValue) {
          return equalResult(false, oldValue, newValue, ChangeType.changed);
        }
      }
      if (typeOfOldValue == 'object') {
        if (angular.isArray(oldValue)) {
          if (!angular.isArray(newValue)) return equalResult(false, oldValue, newValue, ChangeType.changed);
          var minLength = Math.min(oldValue.length, newValue.length);
          var maxLength = Math.max(oldValue.length, newValue.length);

          key = 0;
          for (key; key < minLength; key++) {
            eq = diff(oldValue[key], newValue[key]);
            addEqResults(returnEq, eq, key);
          }

          if (oldValue.length > newValue.length) {
            for (key; key < maxLength; key++) {
              eq = equalResult(false, oldValue[key], undefined, ChangeType.popped);
              addEqResults(returnEq, eq, key);
            }
          }
          else if (oldValue.length < newValue.length) {
            for (key; key < maxLength; key++) {
              eq = equalResult(false, undefined, newValue[key], ChangeType.pushed);
              addEqResults(returnEq, eq, key);
            }
          }
          return returnEq;

        } else if (angular.isDate(oldValue)) {
          return equalResult(angular.isDate(newValue) && oldValue.getTime() == newValue.getTime(), oldValue, ChangeType.changed);
        } else if (isRegExp(oldValue) && isRegExp(newValue)) {
          return equalResult(oldValue.toString() == newValue.toString(), oldValue, ChangeType.changed);
        } else {
          if (isScope(oldValue) || isScope(newValue) || isWindow(oldValue) || isWindow(newValue) || angular.isArray(newValue)) {
            return equalResult(false, oldValue, newValue, ChangeType.unknown);
          }

          keySet = {};
          for (key in oldValue) {
            if (key.charAt(0) === '$' || angular.isFunction(oldValue[key])) continue;
            eq = diff(oldValue[key], newValue[key]);
            addEqResults(returnEq, eq, key);

            keySet[key] = true;
          }
          for (key in newValue) {
            if (!keySet.hasOwnProperty(key) &&
              key.charAt(0) !== '$' &&
              newValue[key] !== undefined &&
              !angular.isFunction(newValue[key])) {

              eq = diff(oldValue[key], newValue[key]);
              addEqResults(returnEq, eq, key);
            }
          }
          return returnEq;
        }
      }
    }
    return equalResult(false, oldValue, newValue, ChangeType.changed);
  }

  function checkScope(scope) {
    if (angular.isUndefined(scope)) {
      throw new Error("Undefined scope passed to simple-history.");
    }
    if (!isScope(scope)) {
      throw new Error("Object passed to simple-history is not a Scope.");
    }
  }

  interface IArchiveEntry {
    scope: number;
    value: [IObjectDiff];
    timestamp: number,
  }

  class SimpleHistory implements ISimpleHistory {

    public maxLength: number;

    private archive: [IArchiveEntry] = <any>[];
    private onAdjustFunctions = [];
    private onRedoFunctions = [];
    private onUndoFunctions = [];
    private currArchivePos = null;
    private restoring = false;
    private cancelWatch: [[any]] = <any>{};
    private scopes: [any] = <any>{};

    constructor(
      private $parse: ng.IParseService
    ) { };

    private newEntry(scopeid, merge, changedObject: [IObjectDiff]) {
      while (this.archive.length > this.currArchivePos) this.archive.pop();
      if (this.maxLength > 0) while (this.archive.length >= this.maxLength) this.archive.shift();

      if (this.archive.length > 0 && Date.now() - this.archive[this.archive.length - 1].timestamp < merge) {
        var archiveData = this.archive[this.archive.length - 1];
        for (var i = 0; i < changedObject.length; i++) {
          var added = false;
          for (var j = 0; j < archiveData.value.length; j++) {
            if (changedObject[i].uve == archiveData.value[j].uve) {
              archiveData.value[j].n = changedObject[i].n;
              if (archiveData.value[j].n == archiveData.value[j].o) {
                archiveData.value.splice(j, 1);
              }
              added = true;
              break;
            }
          }
          if (!added) archiveData.value.push(changedObject[i]);
        }
        if (archiveData.value.length == 0) {
          this.archive.pop();
        }
      }
      else {
        this.archive.push({ scope: scopeid, value: changedObject, timestamp: Date.now() });
      }
      this.currArchivePos = this.archive.length;

      for (var i = 0; i < this.onAdjustFunctions.length; i++)  this.onAdjustFunctions[i]();

      console.log("archive %o", this.archive);
    }

    public watch(scope: ng.IScope, watchVar: string, merge?: number) {
      checkScope(scope);

      if (this.cancelWatch[scope.$id] == undefined)
        this.cancelWatch[scope.$id] = <any>{};
      this.scopes[scope.$id] = scope;

      var self = this;
      this.cancelWatch[scope.$id][watchVar] = scope.$watch(watchVar, function(newValue, oldValue) {
        self.addToArchive.apply(self, [scope.$id, watchVar, merge, newValue, oldValue]);
      }, true);

      scope.$on("destroy", () => {
        this.remove(scope, watchVar);
      });
    };

    //TODO: has to be tested
    public cancel(scope: ng.IScope, wv) {
      this.cancelWatch[scope.$id][wv]();
    }

    //TODO: has to be tested
    public remove(scope: ng.IScope, wv) {
      var i = this.archive.length;
      while (i--) {
        if (this.archive[i].scope == scope.$id) {
          this.archive.splice(i, 1);
          this.scopes[scope.$id] = undefined;
          this.cancelWatch[scope.$id] = undefined;
        }
      }
    }

    public addOnAdjustFunction(fn) {
      if (!angular.isFunction(fn)) throw new Error("Function added to run on adjustment is not a function");
      this.onAdjustFunctions.push(fn);
    };

    public removeOnAdjustFunction(fn) {
      this.onAdjustFunctions.splice(this.onAdjustFunctions.indexOf(fn), 1);
    };


    public addOnUndoFunction(fn) {
      if (!angular.isFunction(fn)) throw new Error("Function added to run on undo is not a function");
      this.onUndoFunctions.push(fn);
    };

    public removeOnUndoFunction(fn) {
      this.onUndoFunctions.splice(this.onUndoFunctions.indexOf(fn), 1);
    };

    public addOnRedoFunction(fn) {
      if (!angular.isFunction(fn)) throw new Error("Function added to run on redo is not a function");
      this.onRedoFunctions.push(fn);
    };

    public removeOnRedoFunction(fn) {
      this.onRedoFunctions.splice(this.onRedoFunctions.indexOf(fn), 1);
    };

    public undo() {
      if (!this.canUndo()) return false;

      this.revert(this.currArchivePos - 1);
      for (var i = 0; i < this.onUndoFunctions.length; i++)  this.onUndoFunctions[i]();
      return true;
    };

    public redo() {
      if (!this.canRedo()) return false;

      this.revert(this.currArchivePos + 1);
      for (var i = 0; i < this.onRedoFunctions.length; i++)  this.onRedoFunctions[i]();
      return true;
    };

    public revert(revertToPos) {
      var property, i, j, out, properties;

      while (this.currArchivePos > revertToPos && this.currArchivePos > 0) {
        var archiveData = this.archive[this.currArchivePos - 1];
        properties = archiveData.value;
        var split =  this.splitProperties(properties);
        this.revertStep(split.removed, archiveData.scope,"o");
        this.revertStep(split.popped, archiveData.scope,"o");
        this.revertStep(split.changed, archiveData.scope,"o");
        this.revertStep(split.added, archiveData.scope,"o");
        this.revertStep(split.pushed, archiveData.scope,"o");
        
        this.currArchivePos--;
      }

      while (this.currArchivePos < revertToPos && this.currArchivePos < this.archive.length) {
        var archiveData = this.archive[this.currArchivePos];
        properties = archiveData.value;

        var split =  this.splitProperties(properties);
        this.revertStep(split.added, archiveData.scope,"n");
        this.revertStep(split.pushed, archiveData.scope,"n");
        this.revertStep(split.changed, archiveData.scope,"n");
        this.revertStep(split.removed, archiveData.scope,"n");
        this.revertStep(split.popped, archiveData.scope,"n");
        
        this.currArchivePos++;
      }

      this.restoring = true;
    };

    private splitProperties(properties: [IObjectDiff]) {
      var out = {
        changed: <[IObjectDiff]>[],
        removed: <[IObjectDiff]>[],
        added: <[IObjectDiff]>[],
        pushed: <[IObjectDiff]>[],
        popped: <[IObjectDiff]>[],
      }
      for (var i = 0; i < properties.length; i++) {
        if (properties[i].c == ChangeType.changed) out.changed.push(properties[i]);
        if (properties[i].c == ChangeType.removed) out.removed.push(properties[i]);
        if (properties[i].c == ChangeType.added) out.added.push(properties[i]);
        if (properties[i].c == ChangeType.pushed) out.pushed.push(properties[i]);
        if (properties[i].c == ChangeType.popped) out.popped.push(properties[i]);
      }
      return out;
    }

    private revertStep(properties, scope, action) {
      var out;
      for (var i = 0; i < properties.length; i++) {
        var property = properties[i].uve.split("|");
        out = this.$parse(property[0])(this.scopes[scope]);
        for (var j = 1; j < property.length - 1; j++) out = out[property[j]];
        out[property[j]] = properties[i][action];
      }
    }

    public canRedo() {
      return (this.currArchivePos < this.archive.length);
    };

    public canUndo() {
      return (this.currArchivePos > 0);
    };

    public addToArchive(scopeid, watchVar, merge, newValue, oldValue, world) {
      if (this.restoring) return this.restoring = false;
      var eq = diff(oldValue, newValue);
      if (eq.length == 0) return;
      for (var i = 0; i < eq.length; i++) eq[i].uve = watchVar + eq[i].uve;
      this.newEntry(scopeid, merge, eq);
    };
  };

  angular.module('simple-history', []).service('simple-history', ['$parse',
    function($parse) {
      return new SimpleHistory($parse);
    }]);
}