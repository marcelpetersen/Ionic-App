angular
    .module('fittus.tutorial')
    .controller('TutorialController', TutorialController);

function TutorialController($scope, $state, $ionicSlideBoxDelegate, Auth, User) {
    if(Auth.getAuth()) {
        $state.go('home.feed');
    }

    $scope.goNext = function() {
        $ionicSlideBoxDelegate.next();
    }

    $scope.loginFacebook = function() {
        // login with Facebook
        Auth.instance().$authWithOAuthPopup("facebook").then(function(authData) {
            console.log(authData);
            whenLoggedIn(authData);
        }).catch(function(error) {
            console.log("Authentication failed:", error);
        });
    }

    $scope.loginGoogle = function() {
        // login with google
        Auth.instance().$authWithOAuthPopup("google").then(function(authData) {
            console.log(authData);
            whenLoggedIn(authData);
        }).catch(function(error) {
            console.log("Authentication failed:", error);
        });
    }

    function whenLoggedIn(authData) {
        User.add(authData, function (userExits) {
                if(userExits) {
                    $state.go('home.feed');
                }else{
                    $state.go('gym');
                }
            });
    }
}
