
/// <reference path='../_all.ts' />

module app.services {
    'use strict';
    
    export interface IStorageService {
        write(key: string, object: any): ng.IPromise<void>;
        read(key: string): ng.IPromise<any>;
    }

    export class StorageService implements IStorageService {
        public static $inject = [
            '$q',
            'chrome-sandbox'
        ];
        constructor(private $q: ng.IQService, private chrome: chromesandbox.IChrome) { }
        public write(key: string, object: any): ng.IPromise<void> {
            console.log("write: key: %o, val:%o",key,object);
            if (!this.checkIfLocalStorageAvailabe()) return this.rejectedPromise<void>();

            var data = angular.copy(object);
            if (typeof data != "string") data = angular.toJson(data);

            try {
                localStorage.setItem(key, data);
                return this.resolvedPromise<void>({});
            } catch (e) {
                return this.chrome.storage.local.set({[key]: data});
            }
        }

        public read(key: string): ng.IPromise<any> {
            console.log("read: key: %o", key);
            if (!this.checkIfLocalStorageAvailabe()) return this.rejectedPromise<void>();

            try {
                var d = localStorage.getItem(key);
                d = this.parseAsObject(d);
                return this.resolvedPromise<any>(d);
            } catch (e) {
                return this.chrome.storage.local.get(key).then(d=> {
                    return this.parseAsObject(d[key]);
                });
            }
        }

        private parseAsObject(inp: any) {
            if(inp == undefined) return inp;
            try { return angular.fromJson(inp); }
            catch (e) { return inp; }
        }

        private resolvedPromise<T>(obj: any): ng.IPromise<T> {
            var deferred = this.$q.defer();
            deferred.resolve(obj);
            return deferred.promise
        }

        private rejectedPromise<T>(): ng.IPromise<T> {
            var d = this.$q.defer();
            d.reject();
            return d.promise
        }

        private checkIfLocalStorageAvailabe() {
            if (typeof (Storage) === "undefined") {
                console.warn("Sorry! No Web Storage support.");
                return false;
            }
            return true;
        }
    }
    Application.service('app.services.IStorageService', StorageService);
}
