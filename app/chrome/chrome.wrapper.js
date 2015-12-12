// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

document.addEventListener('DOMContentLoaded', function () {

  var init = setInterval(function () {
    document.getElementById('app').contentWindow.postMessage({ type: "init", result: "success" }, '*');
  }, 100);

  function success(command) {
    return function (result) {
      command.data = result;
      command.result = "success";
      respond(command);
    };
  }

  function error(command) {
    return function (e) {
      console.error("Chrome.wrapper Exception %o", e);
      command.result = "error";
      command.data = e;
      respond(command);
    }
  }

  function respond(response) {
    document.getElementById('app').contentWindow.postMessage(response, '*');
  }

  function setWebView(data, success, error) {
    chrome.app.window.create('chrome/webview.html',
      {
        id: "webview",
      }, function (container) {
        console.log("data? %o",data);
         
        var blob = new Blob( [ data ], { type: "application/pdf" } );
        var urlCreator = window.URL || window.webkitURL;
        var uri = urlCreator.createObjectURL( blob );
        debugger;
 
        container.contentWindow.loaded = function (view) {
          view.setAttribute('src', uri);
          success();
        }
      });
  }

  window.addEventListener('message', function (event) {
    //Test für pdf...
     
    console.log("chrome.wrapper %o", event.data);

    var command = event.data;

    if (command.type == "init") {
      console.log("wrapper.chrome initialization complete");
      clearInterval(init);
      return;
    }
    try {
      if (command.type == "chrome.storage.local.get")
        return chrome.storage.local.get(command.data, success(command));
      if (command.type == "chrome.storage.local.set")
        return chrome.storage.local.set(command.data, success(command));
      if (command.type == "chrome.storage.sync.get")
        return chrome.storage.sync.get(command.data, success(command));
      if (command.type == "chrome.storage.sync.set")
        return chrome.storage.sync.set(command.data, success(command));
      if (command.type == "chrome.fileSystem.chooseEntry.readAsText")
        return file.read(command.data, success(command), error(command));
      if (command.type == "chrome.fileSystem.chooseEntry.write")
        return file.write(command.data, success(command), error(command));
      if (command.type == "chrome.pdf.show")
        return setWebView(command.data, success(command), error(command));

    } catch (e) {
      error(command)(e);
      return;
    }
    error(command)("Unknown Command");
  });
});
