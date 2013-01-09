var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope, $resource, $location, $window, $routeParams){
	$scope.resource = $resource;
	$scope.location = $location;
	$scope.window = $window;	
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
	$scope.templates = [
							{ id:1, url:'/images/templates/temp1.png', thumb:'/images/templates/thumb_temp1.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:2, url:'/images/templates/temp2.png', thumb:'/images/templates/thumb_temp2.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:3, url:'/images/templates/temp3.png', thumb:'/images/templates/thumb_temp3.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:4, url:'/images/templates/temp4.png', thumb:'/images/templates/thumb_temp4.png', mask:{ posX:0, posY:0, width:150, height:150 } },
							{ id:5, url:'/images/templates/temp5.png', thumb:'/images/templates/thumb_temp5.png', mask:{ posX:0, posY:0, width:150, height:150 } }
					   ];
	$scope.currentTemplate = $scope.templates[0];
	$scope.selectTemplate = function(index){
		$scope.currentTemplate = $scope.templates[index];
	}

	$scope.$on('updateUserImage', function(a,b) {
		$scope.$apply(function($scope){			
			$scope.userImage = b.result;
		});
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