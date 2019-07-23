app.controller('notesCtrl', function($scope, $rootScope, $http, $window, API_URL) {
	$scope.notes = [];
	
	$scope.notesPerPage = 0; // unlimited
	$scope.noteIndex = 0; // start from the top

	$scope.editingID = null; //note_id of the note we are currently editing

	$scope.error = '';
	$scope.status = '';

	// Fetches the currently logged in user. On failure return to login screen
	$scope.fetchMe = function()
	{
		var token = $window.localStorage['token'];

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
			}
			else if (response.status == 401 || response.status == 403) {
				$window.location.href = '#!login';		
			}
		}, function (response) {
		// Failure
		$scope.response = "Could not fetch current user";
		
		$window.location.href = '#!login';
		});
	}

	// Get user's notes, which will be displayed on screen
	$scope.fetchMyNotes = function (skip, take) {
		$scope.status = '';
		$scope.error = '';

		var token = $window.localStorage['token'];

		var url = API_URL + 'notes?skip=' + skip + '&take=' + take;

		$http({
			method: 'GET',
			url: url,
			timeout: 30000, 
			cache: false,
			headers:{'Api-Token': token}
		}).then(function (response) {
			// Success
			if (response.status == 200) {
				$scope.notes = response.data;
			}
			else {
				$window.location.href = '#!login';		
			}
		}, function (response) {
		// Failure
		$scope.response = "Fetch failure";

		
		$window.location.href = '#!login';
		});

	}

	// Create new blank note and show in the view
	$scope.newNote = function() {
		$scope.status = '';
		$scope.error = '';

		var newNote = {note_id: 0,
					title: '',
					content: ''};

		$scope.notes.unshift(newNote);

		$scope.editingID = 0;
	}
	
	// Save new note (or update existing note)
	$scope.saveNote = function(note) {
		$scope.status = '';
		$scope.error = '';

		var token = $window.localStorage['token'];
		
		var url = API_URL + 'notes';
		if (note.note_id == 0) {
			// New note
			$http({
				method: 'POST',
				url: url,
				timeout: 30000, 
				data: note,
				cache: false,
				headers:{'Api-Token': token}
			}).then(function (response) {
				// Success
				$scope.editingID = 0;
				$scope.fetchMyNotes($scope.noteIndex, $scope.notesPerPage);
				$scope.status = 'Note saved successfully';
			}, function (response) {
				// Failure	
				if (response.status == 401 || response.status == 403) {	 
					$window.location.href = '#!login';
				}
				else {
					$scope.error = 'Note could not be saved. Error ' . $response.status;
				}
			});
		}
		else {
			// Update existing note
			$http({
				method: 'PUT',
				url: url + '/' + note.note_id,
				timeout: 30000, 
				data: note,
				cache: false,
				headers:{'Api-Token': token}
			}).then(function (response) {
				// Success
				$scope.editingID = 0;
				$scope.fetchMyNotes($scope.noteIndex, $scope.notesPerPage);
				$scope.status = 'Note updated successfully';
			}, function (response) {
				// Failure		 
				if (response.status == 401 || response.status == 403) {	 
					$window.location.href = '#!login';
				}
				else {
					$scope.error = 'Note could not be saved. Error ' . $response.status;
				}
			});
		}
	}
	
	$scope.cancelSave = function(note) {
		$scope.editingID = null;
		$scope.fetchMyNotes(0, $scope.notesPerPage);
	}
	
	$scope.deleteNote = function(note) {
		$scope.error = '';
		$scope.status = '';

		var url = API_URL + 'notes';
		var token = $window.localStorage['token'];

		if (confirm('This will delete the note titled "' + note.title + "'")) {
			$http({
				method: 'DELETE',
				url: url + '/' + note.note_id,
				timeout: 30000, 
				data: note,
				cache: false,
				headers:{'Api-Token': token}
			}).then(function (response) {
				// Success
				
				$scope.fetchMyNotes($scope.noteIndex, $scope.notesPerPage);
				$scope.status = 'Note deleted successfully';
			}, function (response) {
				// Failure		 
				if (response.status == 401 || response.status == 403) {	 
					$window.location.href = '#!login';
				}
				else {
					$scope.error = 'Note could not be deleted. Error ' . $response.status;
				}
			});
		} else {
			// Do nothing!
		}
		
	}

	$scope.editNote = function(note) {
		$scope.editingID = note.note_id;

	}

	$scope.fetchMe();
	$scope.fetchMyNotes(0, $scope.notesPerPage);

	// Load additional notes - can be triggered by button push or infinite scroll, etc.
	$scope.fetchMoreNotes = function () {
		$scope.notesPerPage += $scope.notesPerPage;
		$scope.fetchMyNotes($scope.noteIndex, $scope.notesPerPage);
	}
	

  });