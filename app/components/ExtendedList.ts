
/// <reference path='../_all.ts' />
module app.components {
    'use strict';
    
    export interface IExtendedList<T> extends Array<T> {
        add(element?: T): T;
        remove(element: T): T;
        up(element: T): void;
        down(element: T): void;
        [index: number]: T;
    }

    export class ExtendedList<T> extends Array<T> implements IExtendedList<T>{
        private _ctor;

        constructor(ctor: T) {
            super();
            this._ctor = ctor;
        }

        
        public add(element?: T): T {
            this.push(angular.copy(element === undefined ? this._ctor : element));
            return this[this.length - 1];
        }

        public remove(element: T): T {
            var index = this.indexOf(element);
            if (index > -1) {
                return this.splice(index, 1)[0];
            }
            return null;
        }

        public up(element: T): void {
            var old_index = this.indexOf(element);
            var new_index = old_index - 1;
            if (new_index >= 0)
                this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        }

        public down(element: T): void {
            
            var old_index = this.indexOf(element);
            var new_index = old_index + 1;
            if (new_index < this.length)
                this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        }
    }
}