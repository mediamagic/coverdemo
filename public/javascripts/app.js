'use strict';
angular.module('coverdemo', ['ngResource']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', { templateUrl:'/views/main.html', controller:MainCtrl}).
		otherwise({ redirectTo:'/main'});
}]);