app.controller('loginCtrl', function($scope, $rootScope, $http, $window, API_URL) {
	$scope.email = 'test@test.com';
	$scope.password = '';

	$scope.response = '';

	$scope.login = function () {

		var url = API_URL + 'authenticate';
		var data = JSON.stringify({email: $scope.email, password: $scope.password});

		$http.post(url, data).then(function (response) {
			// Success
			if (response.data.status == "success") {
				$rootScope.user = response.data.user;
				$scope.response = "Login success";

				$window.localStorage['token'] = response.data.token.token_value;

				$window.location.href = '#!notes';
			}
			else {
				$scope.response = "Login error";
			}
			
		}, function (response) {
		// Failure
		$scope.response = "Login failure";
		});

	}

	// If user already logged in, take them straight to the notes page
	$scope.init = function() {
		var token = $window.localStorage['token'];

		if (!token) {
			return;
		}

		var url = API_URL + 'me';
	
		$http({
			method: 'GET',
			url: url,
			timeout: 30000, 
			cache: false,
			headers:{'Api-Token': token}
		}).then(function (response) {
			// Success
			if (response.status == 200) {
				$rootScope.user = response.data;
				$window.location.href = '#!notes';		
			}
		}, function (response) {
		// Failure
			return;
		});
	}

	$scope.init();
	
});