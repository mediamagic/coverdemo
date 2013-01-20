var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope, $resource, $location, $window, $routeParams){
	$scope.resource = $resource;
	$scope.location = $location;
	$scope.window = $window;
	$scope.Templates = $scope.resource('/resources/templates');

	$scope.Templates.query({}, function(res) {
		$scope.templates = res;	
		$scope.currentTemplate = $scope.templates[0];
	});	
	
	$scope.Covers = $scope.resource('/resources/covers/:action/:id');

	// TEMP - this should be dynamic from DB
	$scope.fbPermissions = {email:1,publish_stream:1,user_photos:1};
	$scope.settings.thumbsWidth = 200;
	$scope.settings.thumbsHeight = 74;
	//

	$scope.handleFbLogin = function(cb){		
		FB.getLoginStatus(function(res) {
			if(res.status != undefined) {
				var status = res.status;	
				$scope.fbLogin(function(res){
					cb();
				});
			}
		});
	}

	$scope.checkPermissions = function(cb, user) {
		FB.api('/me/permissions', function(response) {		
			var valid = true;
			for(var per in $scope.fbPermissions) {
				if(!response.data[0][per])
					valid = false;									
			}
			(!valid) ? $scope.fbLogin(cb) :	cb(user);
		});	
	}

	$scope.fbLogin = function(cb){
		var pers = [];
		for(var per in $scope.fbPermissions)
			pers.push(per);
		FB.login(function(res) {			
			if(res.status === 'connected')
			$scope.checkPermissions(cb, res.authResponse);
		},{scope:pers.join(',')});		
	}
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
}];

var FbCtrl = ['$scope', function($scope) {
	$scope.pictures = [];
	$scope.selectPicture = function(index){
		$scope.$emit('updateUserImage', {result: '/resources/image/?picture='+encodeURIComponent($scope.pictures[index].picture), apply: false});
	};

	$scope.retrievePictures = function(){
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
			streaming = true;
		}
	}, false);
}];

var UploadCtrl = ['$scope', function($scope) {
	$scope.handlePcUpload = function(element){
		
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

var formCtrl = ['$scope', function($scope){
	$scope.handleSave = function(){
		$scope.handleFbLogin(function() {
			$scope.prepareImage($scope.sendForm)
		});
	}
	$scope.prepareImage = function(cb) {
		var image = new Image
		, template = new Image
		, can = document.querySelector('#finalImage')
		,  ctx = can.getContext('2d');

		image.onload = function(){
			ctx.save();
			var width = $scope.currentTemplate.mask.width;
			var height = $scope.currentTemplate.mask.height;
			ctx.translate($scope.currentTemplate.mask.posX, $scope.currentTemplate.mask.posY);
			ctx.translate($scope.currentTemplate.mask.width/2, $scope.currentTemplate.mask.height/2);
			ctx.rotate((Math.PI / 180) * $scope.rotateStep)
			ctx.drawImage(image, -($scope.currentTemplate.mask.width/2)+2, -($scope.currentTemplate.mask.height/2)+2, width, height);
			ctx.restore();
			template.src = $scope.currentTemplate.url;
		}
		image.src = $scope.userImage;

		template.onload = function() {
			ctx.save();
			ctx.drawImage(template, 0, 0, 851, 315);
			ctx.restore();
			
			$scope.finalImage = can.toDataURL();

			var thumb = new Image;
			thumb.onload = function() {				
				$scope.thumbnail = getBase64Image(thumb, $scope.settings.thumbsWidth, $scope.settings.thumbsHeight);
				cb();
			}
			thumb.src = $scope.finalImage;

			return;
		}
	}

	$scope.sendForm = function(){
		FB.api('/me', function(res) {			
			$scope.Covers.save({}, { src:$scope.finalImage, thumbnail:$scope.thumbnail, user:res }, function(resp){
				console.log(resp);
			});
		});
	}
}];

function getBase64Image(img, width, height) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}