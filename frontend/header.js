app.controller('headerCtrl', function ($scope, $rootScope, $window, $http, API_URL) {
 
	$scope.getUser = function() { 
		return $rootScope.user;
	}
	
	$scope.logout = function () {

		var url = API_URL + 'logout';	
		var token = $window.localStorage['token'];

		$http({
			method: 'POST',
			url: url,
			timeout: 30000, 
			cache: false,
			headers:{'Api-Token': token}
		}).then(function (response) {
			// Success
			if (response.status == 200) {
				$rootScope.user = null;
				$window.localStorage['token'] = null;
				$window.location.href = '#!login';		
			}
			else {
				$window.location.href = '#!';		
			}
		}, function (response) {
		// Failure
		$scope.response = "Could not log out";
		
		$window.location.href = '#!';		
		});

	}

  });