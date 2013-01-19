var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope, $resource, $location, $window, $routeParams){
	$scope.resource = $resource;
	$scope.location = $location;
	$scope.window = $window;	

	$scope.templates = [
							{ id:1, url:'/images/templates/temp1.png', thumb:'/images/templates/thumb_temp1.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:2, url:'/images/templates/temp2.png', thumb:'/images/templates/thumb_temp2.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:3, url:'/images/templates/temp3.png', thumb:'/images/templates/thumb_temp3.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:4, url:'/images/templates/temp4.png', thumb:'/images/templates/thumb_temp4.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:5, url:'/images/templates/temp5.png', thumb:'/images/templates/thumb_temp5.png', mask:{ posX:0, posY:0, width:150, height:150 } }
					   ];
	$scope.currentTemplate = $scope.templates[0];
	$scope.Covers = $scope.resource('/resources/covers');
}];

var MainCtrl = ['$scope', function($scope){

	$('#dragBoxUserImage').draggable({ 
		containment:'parent',
		drag: function(evt, ui) {
			$scope.$apply(function() {
				$scope.currentTemplate.mask.posX = ui.position.left;
				$scope.currentTemplate.mask.posY = ui.position.top;				
			});
		}
	});
	
	
	$scope.selectTemplate = function(index){
		$scope.currentTemplate = $scope.templates[index];
	}

	$scope.$on('updateUserImage', function(a,b) {
		if (b.apply === false){
			$scope.userImage = b.result;
		} else {
			$scope.$apply(function($scope){			
				$scope.userImage = b.result;
			});
		}
	});
		
	$scope.zoomStep = 0;
	$scope.zoomAmount = 0;
	$scope.zoom = function(dir)	{
		var zoom = 0;

		if(dir == 'in' && $scope.zoomStep < 10){			
			$scope.zoomStep++;			
		} else if (dir == 'out' && $scope.zoomStep > -10){			
			$scope.zoomStep--;			
		}
		else
			return
		
		zoom = 10 * $scope.zoomStep;
		$scope.currentTemplate.mask.width = $scope.currentTemplate.mask.width - $scope.zoomAmount + zoom;
		$scope.currentTemplate.mask.height = $scope.currentTemplate.mask.height - $scope.zoomAmount + zoom;		
		$scope.zoomAmount = zoom;
	}

	$scope.rotateStep = 0;	
	$scope.rotate = function(dir) {
		if(dir == 'right') {
			$scope.rotateStep = $scope.rotateStep + 5;				
		} else {
			$scope.rotateStep = $scope.rotateStep - 5;
		}
	}

	$scope.sendForm = function(){
		$scope.sendObject = { src:$scope.userImage, rotation:$scope.rotateStep, zoom:$scope.zoomAmount, posX:$scope.currentTemplate.mask.posX, posY:$scope.currentTemplate.mask.posY, user:{} };
		$scope.Covers.save({}, $scope.sendObject, function(resp){
			console.log(resp);
		})
		//console.log($scope.sendObject);
	}
}];

var UploadCtrl = ['$scope', function($scope) {
	$scope.handlePcUpload = function(element){
		//console.log(document.getElementById('uploadPC').files[0]);
		//console.log(element);
		$scope.$apply(function($scope){
			for (var i = 0; i < element.files.length; i++) {
				var imageType = /image.*/;
				var _file = element.files[i];
				if(!_file.type.match(imageType))
					return alert('only image type allowed!');
				var reader = new FileReader();
				reader.onload = (function(file) {					
					return function(env){						
						$scope.$emit('updateUserImage', {result: env.target.result});
					};
				}(_file))
				reader.readAsDataURL(_file);
			}
		});
	};
}];

var FbCtrl = ['$scope', function($scope) {
	$scope.pictures = [];
	var checkPermissions = function(cb, user){
		FB.api('/me/permissions', function(response) {			
			if(!response.data[0].publish_stream || !response.data[0].user_photos || !response.data[0].email)
				fbLogin(cb);
			else
				cb(user);
		});	
	}
	
	var fbLogin = function(cb){
		FB.login(function(res) {			
			if(res.status === 'connected')
				checkPermissions(cb, res.authResponse);			
		},{scope:'email,publish_stream,user_photos'});
	}

	$scope.selectPicture = function(index){
		$scope.$emit('updateUserImage', {result: $scope.pictures[index].picture, apply: false});
	};

	var retrievePictures = function(){
		FB.api('/me/albums?fields=id,type', function(res) {
			var album = 0;
			for(var i = 0; i < res.data.length; i++){
				if(res.data[i].type === 'profile')					
					album = res.data[i].id;
			}

			if(album > 0)
				FB.api('/' + album + '/photos?fields=picture', function(res) {
					if(res.data.length > 0) {
						$scope.$apply(function(){
							$scope.pictures = res.data;
							$scope.showModal = true;	
						});						
					}
				});
		});
	}

	$scope.handleFbLogin = function(){		
		FB.getLoginStatus(function(res) {
			if(res.status != undefined) {
				var status = res.status;	
				if(status === 'connected') {					
					fbLogin(function(res){
						retrievePictures();
					});
				} else {										
					fbLogin(function(res){
						retrievePictures();
					});
				} 
			}
		});
	}
}];

var webcamCtrl = ['$scope', function($scope){

	$scope.showWebcam = false;
	var video = document.querySelector("#vid");
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;
    var width = 320;
    var height = 0;
    var streaming = false;

    var onCameraFail = function (e) {
        console.log('Camera did not work.', e);
    };
   
   	$scope.toggleVideo = function(){
   		console.log('loading video');
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia({video:true}, function (stream) {
			console.log('getting user media');
			$scope.$apply(function() {
				$scope.showWebcam = true;
			});
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
		}, onCameraFail);
   	}

	$scope.snapshot = function(){
        if (localMediaStream) {
        	var x = (0 - (width - 150)) / 2;
        	var y = (0 - (height - 150)) / 2;
            ctx.drawImage(video, x, y, width, height);
  			$scope.$emit('updateUserImage', {result: canvas.toDataURL(), apply:false});  			
        }
	}

	video.addEventListener('canplay', function(ev){
		if (!streaming) {
			height = video.videoHeight / (video.videoWidth/width);
			video.setAttribute('width', width);
			video.setAttribute('height', height);
			// canvas.setAttribute('width', width);
			// canvas.setAttribute('height', height);
			streaming = true;
		}
	}, false);
}]