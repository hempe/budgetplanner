
/// <reference path='../_all.ts' />

module app.services {
    'use strict';
    export interface IBusinessService {
        file(): components.IFile;
        open(file: { name: string, data: string }): void;
        openChromeFile(): void;
        saveChromeFile(): void;
        openChromePdf(pdf): void;
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

        public openChromePdf(pdf) {
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
            this.storageService.read("file").then(file=> {
                if (file == undefined || file == "") {
                    console.info("No file in local Storage");
                    return;
                }
                this.open({ name: "", data: angular.toJson(file) });
            });
        };

        private writeToLocalStorage() {
            this.storageService.write("file", this.file());
        }

        public static $inject = [
            '$rootScope',
            '$route',
            '$translate',
            'app.services.IStorageService',
            'simple-history',
            'chrome-sandbox'
        ];
        constructor(
            private $rootScope: any,
            private $route: any,
            private $translate: ng.translate.ITranslateService,
            private storageService: app.services.IStorageService,
            private history: simpleHistory.ISimpleHistory,
            private chrome: chromesandbox.IChrome) {

            $rootScope.file = components.Files.CreateNew();
            this._initalize();

            $rootScope.$watch('file.language', () => {
                console.log("setting language %o", $rootScope.file.language);
                $translate.use($rootScope.file.language);
            });

            history.maxLength = 100;
            history.watch($rootScope, 'file.development', 1000);
            history.watch($rootScope, 'file.budgets');
            history.watch($rootScope, 'file.assets')
            history.watch($rootScope, 'file.revenue')
            history.watch($rootScope, 'file.client', 1000);
            history.watch($rootScope, 'file.language');

            history.addOnAdjustFunction(() => {
                console.log("I hate you");
                this.writeToLocalStorage();
            });

            history.addOnUndoFunction(() => {
            });
        }
    }
    Application.service('app.services.IBusinessService', BusinessService);
}

