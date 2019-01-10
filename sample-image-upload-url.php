<?php
  //0. You can get $_POST['param'] here, see quickImageUploadGetParams js function in How to use file
  //1. save the uploaded file to a temp file:
  $tmp_file = fopen('tmp_file_name', 'w');
  $input = fopen('php://input', 'r');
  $size = stream_copy_to_stream($input, $tmp_file);
  fclose($input);
  fclose($tmp_file);
  
  //2. a sample image check, you should create your own code for production.
  $img = getimagesize('tmp_file_name');
  if($img === FALSE || ($img[2] != IMG_GIF && $img[2] != IMG_JPG && $img[2] != 3)){
		unlink('tmp_file_name');
		header('Content-type: application/json');
		echo '{"err":1}';//Invalid File Format, err code for onQuickImageUploaded js function, see How to use file
		exit;
  }
  if($img[2] === IMG_GIF){
		if($size > 2097152){
			unlink('tmp_file_name');
      header('Content-type: application/json');
		  echo '{"err":1}';//Gif file to large
			exit;
		}
    $ext = '.gif';
	} else if($img[2] === IMG_JPG){
		$ext = '.jpg';
	} else if($img[2] === 3 ){
		$ext = '.png';
	} else {
		unlink('tmp_file_name');
    header('Content-type: application/json');
		echo '{"err":1}';//Invalid File Format
		exit;		
	}
  rename('tmp_file_name', 'tmp_file_name' . $ext);
  header('Content-type: application/json');
  echo '{"url":"tmp_file_name' . $ext . '","w":' . $img[0] . ',"h":' . $img[1] . '}';
