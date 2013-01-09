var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope, $resource, $location, $window, $routeParams){
	$scope.resource = $resource;
	$scope.location = $location;
	$scope.window = $window;	
}];

var MainCtrl = ['$scope', function($scope){
	$scope.templates = [
							{ id:1, url:'/images/templates/temp1.png', thumb:'/images/templates/thumb_temp1.png'},
							{ id:2, url:'/images/templates/temp2.png', thumb:'/images/templates/thumb_temp2.png'},
							{ id:3, url:'/images/templates/temp3.png', thumb:'/images/templates/thumb_temp3.png'},
							{ id:4, url:'/images/templates/temp4.png', thumb:'/images/templates/thumb_temp4.png'},
							{ id:5, url:'/images/templates/temp5.png', thumb:'/images/templates/thumb_temp5.png'}
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
