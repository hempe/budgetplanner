/// <reference path='../_all.ts' />
declare module "angular-chronicle" {
    var _: string;
    export = _;
}

declare module angular.chronicle {
    
    interface IChronicle {
        /**
        * @param 'watchVars' is an array of stringified variable name you want to be able to undo.
        * @param scope is the variable that contains your watch variable and your unwatched variables.
        */
        record(watchVars: string[], scope: ng.IScope | ng.IRootScopeService): IWatch;
    }

    interface IAdjustFunction { (): void; }

    interface IUndoFunction { (): void; }

    interface IRedoFunction { (): void; }

    interface IWatch {
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
    }
}