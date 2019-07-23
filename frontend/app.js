var app = angular.module('noteApp', ['ngRoute']);

// Root URL of the API
app.constant('API_URL', 'http://localhost:8000/api/');

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
	  templateUrl : "login.html",
	  controller : "loginCtrl"
    })
    .when("/login", {
      templateUrl : "login.html",
      controller : "loginCtrl"
    })
    .when("/notes", {
      templateUrl : "notes.html",
      controller : "notesCtrl"
    });
  });

