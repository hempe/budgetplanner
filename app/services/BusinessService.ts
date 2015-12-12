
/// <reference path='../_all.ts' />

module app.services {
    'use strict';
    export interface IBusinessService {
        file(): components.IFile;
        open(file: { name: string, data: string }): void;
        openChromeFile(): void;
        saveChromeFile(): void;
        openChromePdf(pdf):void;
    }

    class BusinessService implements IBusinessService {

        public file = (): components.IFile => this.$rootScope.file;
        private _file: components.IFile;

        public undo: () => void;
        public redo: () => void;

        public open(file: { name: string, data: string }) {
            this.$rootScope.file = components.Files.OpenFile(file);
            this.$route.reload();
        };
        
        public openChromePdf(pdf){
            this.chrome.pdf.show(pdf);
        }

        public openChromeFile() {
            this.chrome.fileSystem.chooseEntry.readAsText(
                {
                    description: "Budget File (*.bpj)",
                    extensions: ["bpj"]
                }).then(file => {
                    this.open(file);
                });
        };

        public saveChromeFile() {
            this.chrome.fileSystem.chooseEntry.write(
                {
                    data: angular.toJson(this.file()),
                    description: "Budget File (*.bpj)",
                    extensions: ["bpj"],
                    name: this.file().name + ".bpj"
                }).then(() => console.log("saved"));
        };

        private _initalize() {
            var key = "file";
            try {
                if (typeof (Storage) === "undefined") {
                    console.warn("Sorry! No Web Storage support.");
                    return;
                }
                var localFileString = localStorage.getItem(key);
                if (localFileString == undefined || localFileString == "") {
                    console.info("No file in local Storage");
                    return;
                }
                this.open({ name: "", data: localFileString });

            } catch (e) {
                this.chrome.storage.local.get(key).then(d=> {
                    this.open({ name: "", data: d[key] });
                });
            }
        };

        private writeToLocalStorage() {
            var key = "file";
            var data = angular.toJson(this.file());
            try {
                localStorage.setItem(key, data);
            } catch (e) {
                this.chrome.storage.local.set({ file: data });
            }
        }

        public static $inject = [
            '$rootScope',
            '$route',
            'Chronicle',
            'chrome-sandbox'
        ];
        constructor(
            private $rootScope: any,
            private $route: any,
            private Chronicle: angular.chronicle.IChronicle,
            private chrome: chromesandbox.IChrome) {

            $rootScope.file = components.Files.CreateNew();
            this._initalize();
            

            //TODO: wie höre ich auf?
            $rootScope.chronicle = Chronicle.record(['file'], $rootScope);
            $rootScope.chronicle.addOnAdjustFunction(() => {
                this.writeToLocalStorage();
            });

            $rootScope.chronicle.addOnUndoFunction(() => {
            });
        }
    }
    Application.service('app.services.IBusinessService', BusinessService);
}

