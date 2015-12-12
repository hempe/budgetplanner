/// <reference path='../_all.ts' />
module app.components {
    'use strict';

    export interface HasTotal {
        Total(): number;
    }
   
    export interface IHasTotalList<T extends HasTotal> extends Array<T>, IExtendedList<T>, HasTotal {
    }
    
    export class HasTotalList<T extends HasTotal> extends ExtendedList<T> implements IHasTotalList<T>  {

        constructor(ctor: T) {
            super(ctor);
        }

        public Total() {
            var total: number = 0;
            this.forEach(e=> total += e.Total());
            return total;
        }
    }
}