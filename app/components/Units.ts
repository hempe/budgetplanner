/// <reference path='../_all.ts' />
module app.components {
    'use strict';

    export class Unit<T extends HasTotal>{
        public name: string;
        public elements: IHasTotalList<T>;

        constructor(ctor: T) {
            this.name = "";
            this.elements = new HasTotalList<T>(ctor);
        }

        public Total() {
            return this.elements.Total();
        }
    }
}