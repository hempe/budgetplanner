/// <reference path='../_all.ts' />
module app.components {
    'use strict';
    
    export class Group<T extends HasTotal>{
        public name: string;
        public positiv: IHasTotalList<Unit<T>>;
        public negativ: IHasTotalList<Unit<T>>;
        constructor(ctor: T) {
            this.name = "";
            this.positiv = new HasTotalList<Unit<T>>(new Unit<T>(ctor));
            this.negativ = new HasTotalList<Unit<T>>(new Unit<T>(ctor));
        }
    }
    
}