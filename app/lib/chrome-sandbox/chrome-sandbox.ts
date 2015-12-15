
"use strict";
/// <reference path='../../_all.ts' />
module chromesandbox {

  export interface IChrome {
    storage: IStorage;
    fileSystem: IFileSystem
    pdf:IPdf;
    available:boolean;
    onInit(callback:()=>void);
  }

  export interface IPdf{
    show(arg):ng.IPromise<any>;
  }
  export interface IStorage {
    local: IStorageProvider;
    sync: IStorageProvider;
  }

  export interface IStorageProvider {
    get(key: string | string[] | any): ng.IPromise<any>;
    set(items:any): ng.IPromise<any>;
  }

  export interface IFileSystem{
    chooseEntry: IChooseEntry;
  }
  
  export interface IChooseEntry{
    readAsText(any):ng.IPromise<any>;
    write(any):ng.IPromise<any>;
  }

  var _id = 0;
  var nextID = () => { _id = (_id + 1) % 1000; return _id; }

  interface IWrapper {
    send(arg:any,type:string):ng.IPromise<any>;
    onInit(callback:()=>void);
  }

  interface ICommand {
    type: string;
    id?: number;
    data?: any
  }

  class Wrapper implements IWrapper {

    private _event: any;
    private _callbacks: any = {};
    private _initCallbacks = [];

    constructor(private $q: ng.IQService) {
      window.addEventListener('message', (e) => this.messageHandler(e));
    }
    sendCommand(command: ICommand, callback?: (any) => any) {
      if (!this._event) throw "chrome-sandbox not initialized";
      command.id = nextID();
      console.log("send command, %o",command);
      this._event.source.postMessage(command, this._event.origin);
      this._callbacks[command.id] = callback;
    }
    
    onInit(callback) {
      if (this._event) callback();
      this._initCallbacks.push(callback);
    }
    
    messageHandler(event) {
      console.log("chrome-sandbox received!! %o", event.data);

      if (!event || !event.data) return;
      if (!this._event) {
        console.info("chrome-sandbox initialized");
        this._event = event;
        this.sendCommand({ type: "init" });
        this._initCallbacks.forEach(c=> c());
        this._initCallbacks = [];
      } else {
        if (this._callbacks[event.data.id])
          this._callbacks[event.data.id](event.data);
        this._callbacks[event.data.id] = undefined;
      }
    }
    
    send(arg:any, type:string):ng.IPromise<any>{
      
       var deferred = this.$q.defer();
      this.onInit(() =>
        this.sendCommand(
          { type: type, data: arg },
          (event) => {
            if (event.result == "success")
              deferred.resolve(event.data);
            else
              deferred.reject(event.data);
          })
      )
      return deferred.promise;
    }
    
  }

  
  class SyncStorage implements IStorageProvider {
    constructor(private wrapper: IWrapper) { }
    get(arg) {
      return this.wrapper.send(arg, "chrome.storage.sync.get");
    }
    set(arg) {
      return this.wrapper.send(arg, "chrome.storage.sync.set");
    }
  }
  
  class LocalStorage implements IStorageProvider {
    constructor(private wrapper: IWrapper) { }
    get(arg) {
      return this.wrapper.send(arg, "chrome.storage.local.get");
    }
    set(arg) {
      return this.wrapper.send(arg, "chrome.storage.local.set");
    }
  }
  
  class FileSystem implements IFileSystem{
    chooseEntry: IChooseEntry;
    constructor(private wrapper: IWrapper) { 
      this.chooseEntry = new ChooseEntry(wrapper);
    }
  }
  class ChooseEntry implements IChooseEntry{
    constructor(private wrapper: IWrapper) { }
    readAsText(arg):ng.IPromise<any>{
      return this.wrapper.send(arg, "chrome.fileSystem.chooseEntry.readAsText");
    };
    write(arg):ng.IPromise<any>{
      return this.wrapper.send(arg, "chrome.fileSystem.chooseEntry.write");
    }
  }
  
  class Pdf implements IPdf{
    constructor(private wrapper: IWrapper) { }
    show(arg):ng.IPromise<any>{
      return this.wrapper.send(arg,"chrome.pdf.show");
    }
  }
  
  class Chrome implements IChrome{
    storage: IStorage;
    fileSystem: IFileSystem
    pdf:IPdf;
    available:boolean;
    onInit(callback:()=>void){
      this.wrapper.onInit(callback);
    }
    
    constructor(private wrapper: IWrapper) { 
      this.available = false;
      this.storage = {
        local: new LocalStorage(wrapper),
        sync: new SyncStorage(wrapper)
      }
      this.fileSystem = new FileSystem(wrapper);
      this.pdf = new Pdf(wrapper);
      wrapper.onInit(()=>{
        this.available = true;
      });
    }
  }
  angular.module('chrome-sandbox', []).service('chrome-sandbox', ['$rootScope', '$parse', '$q',
    function($rootScope, $parse, $q) {
      return new Chrome(new Wrapper($q));
    }]);
}