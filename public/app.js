const app = angular.module("meetups", ["ngRoute"]);

/**
* Handle $rootScope for the application.
*/
app.run(['$rootScope', function($rootScope) {
    // the name of the event (will show up throughout the app)
    $rootScope.eventName = "hackUMBC";

    // user defaults as not logged in
    $rootScope.user = undefined;

    // display the title based on whatever route it's on
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

/**
 * Handle application routing so that it is all in one page.
 */
app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    // get rid of ! that usually shows up before #
    $locationProvider.hashPrefix('');

    $routeProvider
        .when("/", {
            title: "Meetups",
            templateUrl: "templates/home.html",
            controller: 'HomeCtrl'
        })
        .when("/create", {
            title: "Meetups - Create",
            templateUrl: "templates/create.html",
            controller: 'CreateCtrl'
        })
        .when("/login", {
            title: "Meetups - Login",
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl'
        })
        .otherwise({
            redirectTo: "/"
        });
}]);

/**
 * Handle the Homepage logic.
 */
app.controller("HomeCtrl", function($scope, $rootScope, $location, $http) {
    // get meetups from the database and pass to frontend
    $http.get("/meetups")
    .then(data => {
        $scope.meetups = data.data;
    });

    /**
     * Power the signup button.
     */
    $scope.signup = (index) => {
        // if user is logged in
        if ($rootScope.user) {
            $scope.meetups[index].attendees.push($rootScope.user.profile.name);

            $http.post("/add-attendee", {
                id: $scope.meetups[index]._id,
                name: $rootScope.user.profile.name
            })
            .then(data => {
                console.log(data);
            });
        }
        // if user is NOT logged in
        else {
            // ask user if they want to go to login page or not
            const loginRedirect = confirm("You must be logged in first to sign up for a meetup! Do you wish to go to the login page now?");

            // if yes, redirect to login page
            if (loginRedirect)
                $location.path("/login");
        }
    };
});

/**
 * Handle the Meetup Creation page logic.
 */
app.controller("CreateCtrl", function($scope, $rootScope, $location, $http) {
    // get time right now
    let currentTime = new Date();
    currentTime -= (currentTime.getTime() % (60 * 1000));

    // add an hour to that time
    let futureTime = currentTime + (60 * 60 * 1000);

    // set time inputs
    $scope.startTime = new Date(currentTime);
    $scope.endTime = new Date(futureTime);

    /**
     * Power the create form.
     */
    $scope.create = () => {
        $http.post("/create", {
            title: $scope.meetupTitle,
            location: $scope.location,
            description: $scope.description,
            startTime: $scope.startTime,
            endTime: $scope.endTime
        })
        .then(data => {
            // if object has id, means its a meetup object and creation has succeeded
            if (data._id) 
                $location.path("/");
        });
    }
});

app.controller("LoginCtrl", function($scope, $rootScope, $location, $http) {
    // error message that can be shown to the user for clarification
    $scope.error = "";

    /**
     * Power the login form.
     */
    $scope.login = () => {
        // POST the login information to the /login endpoint
        $http.post("/login", {
            email: $scope.email,
            password: $scope.password
        })
        .then(data => {
            let user = data.data;

            // if login is succcessful
            if (user) {
                // set rootScope user to allow for other controllers to access user data
                $rootScope.user = user;

                // go back to home page after logging in
                $location.path("/");
            }
            // if login is NOT succcessful
            else {
                $scope.error = "Email or password incorrect.";
            }
        });
    };
});