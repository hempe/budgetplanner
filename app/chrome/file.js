var file = {
	
   read: function(arg, success, error){
	   try{
		chrome.fileSystem.chooseEntry( {
				type: 'openFile',
				accepts: [ { description: arg.description,
							extensions: arg.extensions} ],
				acceptsAllTypes: false
			}, function(fileEntry){
			try{
				if(!fileEntry) return error("Aborted");
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onload = function(e) {
						success({name:fileEntry.name, data:  e.target.result});
					};
					reader.onerror = error;
					reader.readAsText(file);
				});
			}catch(e){ error(e);}
		});
		}catch(e){error(e);}
	},
   
   write: function(arg, success, error) {
	   try{
	  chrome.fileSystem.chooseEntry( {
			type: 'saveFile',
			suggestedName: arg.name,
			accepts: [ { description: arg.description,
						extensions: arg.extensions} ],
			acceptsAllTypes: true
		}, function(fileEntry){ 
		try{	
			if(!fileEntry) return error("Aborted");
			fileEntry.createWriter(function(fileWriter) {
				var truncated = false;
				var blob = new Blob([arg.data]);
				fileWriter.onwriteend = function(e) {
					if (!truncated) {
						truncated = true;
						this.truncate(blob.size);
						return;
					}
					success(fileEntry);
				};
				fileWriter.onerror = error;
				fileWriter.write(blob);
		});
		}catch(e){error(e);}
	});
	}catch(e){error(e);}
	}
}