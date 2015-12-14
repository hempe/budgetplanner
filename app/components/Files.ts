
/// <reference path='../_all.ts' />
module app.components {
    'use strict';

    export interface IFile {
        budgets: components.IExtendedList<components.Group<IBudget>>;
        assets: components.Group<IAsset>;
        revenue: components.Group<IRevenue>;
        development: IDevelopmentGroup;
        client: IClient;
        name: string;
        language: string;
    }

    export interface IBudget extends components.HasTotal {
        name: string;
        frequency: number;
        value: number
    }

    export interface IAsset extends components.HasTotal {
        name: string;
        value: number;
    }

    export interface IRevenue extends IAsset {
        year: number;
    }

    export interface IDevelopment {
        budget: number;
        year: number;
    }

    export interface IDevelopmentGroup {
        elements: IExtendedList<IDevelopment>;
        name: string;
        from: number;
        to: number;
    }

    export interface IClient {
        city: String;
        comment: string;
        company: string;
        eMail: string;
        mobilNumber: string;
        name: string;
        prename: string;
        street: string;
        telNumber: string;
        zipCode: string;
    }

    export module Files {

        export function CreateNew(): IFile {
            return new File();
        }


        export function OpenFile(doc: { name: string, data: string }): IFile {
            var file = new File();
            var name = doc.name;
            if (name.toLowerCase().substr(name.length - 4, name.length) == ".xbp") {
                LoadXmlFile(doc, file);
            }
            else {
                LoadJsonFile(doc, file);
            }
            var extensionPosition = name.lastIndexOf(".");

            if(name == "") return file;
            
            if (extensionPosition > 0)
                file.name = name.substr(0, extensionPosition);
            else
                file.name = name;
            return file;
        }

        class File implements IFile {
            public budgets: components.IExtendedList<components.Group<IBudget>>;
            public assets: components.Group<IAsset>;
            public revenue: components.Group<IRevenue>;
            public development: IDevelopmentGroup;
            public client: Client;
            public name: string;
            public language: string;
            
            constructor() {
                this.budgets = new components.ExtendedList<components.Group<Budget>>(new components.Group<Budget>(new Budget()));
                this.assets = new components.Group<IAsset>(new Asset());
                this.revenue = new components.Group<IRevenue>(new Revenue());
                this.development = new DevelopmentGroup();
                this.client = new Client();
            }
        }

        class Budget implements IBudget {
            public name: string;
            public frequency: number;
            public value: number

            constructor() {
                this.name = "";
                this.frequency = 0;
                this.value = 0;
            }

            public Total() {
                return this.frequency * this.value;
            }
        }

        class Asset implements components.HasTotal {

            public name: string;
            public year: number;
            public value: number;

            constructor() {
                this.name = "";
                this.year = 0;
                this.value = 0;
            }

            public Total() {
                return this.value;
            }
        }

        class Revenue extends Asset {
            public year: number;
            constructor() {
                super();
                this.year = 0;
            }
            public Total() {
                return this.value;
            }
        }

        class Development implements IDevelopment {
            public budget: number;
            public year: number;
            constructor() {
                this.budget = 0;
                this.year = 0;
            }
        }

        export class DevelopmentGroup implements IDevelopmentGroup {
            public elements: IExtendedList<IDevelopment>;
            public name: string;
            public from: number;
            public to: number;
            constructor() {
                this.name = "";
                this.from = 0;
                this.to = 0;
                this.elements = new components.ExtendedList<IDevelopment>(new Development());
            }
        }

        class Client implements IClient {
            public city: String;
            public comment: string;
            public company: string;
            public eMail: string;
            public mobilNumber: string;
            public name: string;
            public prename: string;
            public street: string;
            public telNumber: string;
            public zipCode: string;
        }
    }
}