var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope, $resource, $location, $window, $routeParams){
	$scope.resource = $resource;
	$scope.location = $location;
	$scope.window = $window;	

	$scope.test = 'sahar';
}];

var MainCtrl = ['$scope', function($scope){
	$scope.test = 'benny';
}];