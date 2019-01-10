CKEDITOR.plugins.add( 'quickimageuploader', {
	icons: 'quickimageuploader',
	init: function(editor) {

		editor.addCommand('quickimageuploader', {
			exec: function (editor) {
				if(editor.config.isQuickImageUploaderBusy != null && editor.config.isQuickImageUploaderBusy()){
					return;
				}
				var onError = editor.config.onQuickImageUploaderError;
				if(onError == null){
					onError = function(code, msg){alert(msg);};
				}
				if(editor.config.quickImageUploadURL == null){
					onError(0, 'Config::quickImageUploadURL required.');
					return;
				}
				if(typeof (new XMLHttpRequest()).upload == 'undefined'){
					onError(1, 'You Are Using An Unsupported Browser.');
					return;
				}
				var accept = editor.config.quickImageUploaderAccept == null ? ['.jpg','.jpeg','.png','.gif'] : editor.config.quickImageUploaderAccept,
					input = CKEDITOR.dom.element.createFromHtml('<input type="file" accept="' + accept.toString() + '" />');
				input.once('change', function(evt){

					var targetElement = evt.data.getTarget();
					if (targetElement.$.files.length != 1) {
						return;
					}
					var file = targetElement.$.files[0],
						maxSize = editor.config.quickImageUploaderMaxSize == null ? 5 : editor.config.quickImageUploaderMaxSize;
					if(accept.indexOf('.' + file.type.split('/')[1]) === -1){
						onError(2, 'The uploaded image format is not of acceptible format! Please upload an image with the following formats: ' + accept.toString());
						return;
					}
					if(file.size > maxSize * 1024 * 1024){
						onError(3, 'Image size exceeded! Please upload image of less than ' +  maxSize + 'MB.');
						return;
					}
					if(editor.config.onQuickImageUploadStart != null){
						editor.config.onQuickImageUploadStart(editor);
					}
					var xhr = new XMLHttpRequest();
					xhr.upload.addEventListener('progress', function(evt){
						if(evt.lengthComputable && editor.config.onQuickImageUploading != null){
							editor.config.onQuickImageUploading(evt.loaded, evt.total);
						}
					}, false);
					xhr.upload.addEventListener('error', function(){
						onError(4, 'Image upload failed! Please try again!');
					}, false);
					xhr.upload.addEventListener('abort', function(){
						onError(5, 'Image upload aborted! Please try again!');
					}, false);
					xhr.onreadystatechange = function(){
						if(xhr.readyState == 4 && xhr.status == 200 && editor.config.onQuickImageUploaded != null){
							var html = editor.config.onQuickImageUploaded(xhr.responseText);
							if(html != null){
								editor.insertElement(CKEDITOR.dom.element.createFromHtml(html));
							}
						}
					};
					var params = '';
					if(editor.config.quickImageUploadGetParams != null){
						var data = editor.config.quickImageUploadGetParams();
						params = '?';
						for(var k in data) {
							params = params + k + '=' + data[k] + '&';
						}
					}
					xhr.open('POST', editor.config.quickImageUploadURL + params, true);
					xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.fileName != null ? file.fileName : file.name));
					xhr.setRequestHeader('Content-Type', 'application/octet-stream');
					xhr.send(file);
				});
				input.$.click();
			}
		});

		editor.ui.addButton('quickimageuploader', {label: 'Insert Image', command: 'quickimageuploader', toolbar: 'insert, 1'});
	}
});