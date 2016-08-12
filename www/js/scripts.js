;(function() {
"use strict";

angular.module('fittus', [
    'ionic',
    'ionic-timepicker',
    'firebase',
    'fittus.auth',
    'fittus.tutorial',
    'fittus.gym',
    'fittus.goal',
    'fittus.invite',
    'fittus.home',
    'fittus.workout',
    'ngCordova',
    'flexcalendar',
    'flexcalendar.defaultTranslation',
])

.constant('FIREBASE_DATABASE_URL', 'https://radiant-heat-3387.firebaseio.com')

.run(["$ionicPlatform", function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
}])

.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {});
}])

.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('tutorial', {
        url: '/tutorial',
        templateUrl: 'module/tutorial/tutorial.template.html',
        controller: 'TutorialController'
    })

    .state('privacy', {
        url: '/privacy',
        templateUrl: 'module/privacy/privacy.template.html',
    })

    .state('gym', {
        url: '/gym',
        templateUrl: 'module/gym/gym.template.html',
        controller: 'GymController',
        controllerAs: 'vm',
        resolve: {
            user: ["User", function(User) {
                return User.getAuthUser();
            }]
        }
    })

    .state('goal', {
        url: '/goal',
        templateUrl: 'module/goal/goal.template.html',
        controller: 'GoalController'
    })

    .state('invite', {
        url: '/invite',
        templateUrl: 'module/invite/invite.template.html',
        controller: 'InviteController'
    })

    .state('home', {
        url: '/home',
        abstract: true,
        templateUrl: 'module/home/home.template.html',
        resolve: {
            user: ["User", function(User) {
                return User.getAuthUser();
            }]
        }
    })

    .state('home.calendar', {
        url: '/calendar',
        params: {
            newevent: null
        },
        resolve: {
            events: ["user", "Calendar", function(user, Calendar) {
                return Calendar.getEvents(user.uid);
            }]
        },
        views: {
            'home-calendar': {
                templateUrl: 'module/home/calendar/calendar.template.html',
                controller: 'CalendarController',
            }
        }
    })

    .state('home.feed', {
        url: '/feed',
        views: {
            'home-feed': {
                templateUrl: 'module/home/feed/feed.template.html',
                controller: 'FeedController',
                controllerAs: 'vm'
            }
        }
    })

    .state('home.profile', {
        url: '/profile',
        views: {
            'home-profile': {
                templateUrl: 'module/home/profile/profile.template.html',
                controller: 'ProfileController',
                controllerAs: 'vm'
            }
        }
    })

    .state('workout-schedule', {
        url: '/workout-schedule',
        templateUrl: 'module/workout/schedule.template.html',
        controller: 'WorkoutScheduleController',
        controllerAs: 'vm'
    })

    .state('workout-invite', {
        url: '/workout-invite',
        templateUrl: 'module/workout/invite.template.html',
        controller: 'WorkoutInviteController',
        controllerAs: 'vm',
        params: {
            workout: null
        },
        resolve: {
            user: ["User", function(User) {
                return User.getAuthUser();
            }]
        }
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tutorial');

}])

.directive('resolveLoader', ["$rootScope", "$timeout", "$ionicLoading", function($rootScope, $timeout, $ionicLoading) {

    return {
        restrict: 'E',
        replace: true,
        link: function(scope, element) {

            $rootScope.$on('$stateChangeStart', function(event, currentRoute, previousRoute) {
                $ionicLoading.show();
            });

            $rootScope.$on('$stateChangeSuccess', function() {
                $ionicLoading.hide();
            });
        }
    };
}]);
}());

;(function() {
"use strict";

angular
        .module('fittus.goal', []);
}());

;(function() {
"use strict";

GoalController.$inject = ["$scope", "$state", "User"];
angular
    .module('fittus.goal')
    .controller('GoalController', GoalController);

function GoalController($scope, $state, User) {

    $scope.selectTab = [];
    var goals = ['general_wellness','event','lose_weight','building_muscle','fun','training'];

    $scope.changeGoal = function (index) {
        var goalFindIndex = $scope.selectTab.indexOf(index);
        if(goalFindIndex == -1) {
            $scope.selectTab.push(index);
        }else{
            $scope.selectTab.splice(goalFindIndex, 1);
        }
    }

    $scope.goNext = function() {
        var choosedGoals = [];
        angular.forEach($scope.selectTab, function (index) {
            choosedGoals.push(goals[index - 1]);
        });
        User.set('goals', choosedGoals);
        $state.go('invite');
    }

}
}());

;(function() {
"use strict";

angular.module('fittus.goal')
    .service('Goal', Goal);

function Goal() {
    var service = {
    	get: get
    };
    var goals = {
        'general_wellness': {
            name: 'General Wellness',
            icon: 'img/goal/plus.svg'
        },
        'event': {
        	name: 'Event',
            icon: 'img/goal/calendar.svg'
        },
        'lose_weight': {
        	name: 'Lose weight',
            icon: 'img/goal/fire.svg'
        },
        'building_muscle': {
        	name: 'Building Muscle',
            icon: 'img/goal/dumbbell.svg'
        },
        'fun': {
        	name: 'Fun',
            icon: 'img/goal/heart.svg'
        },
        'training': {
        	name: 'Training',
            icon: 'img/goal/run.svg'
        }
    };

    return service;

    ///////

    function get(goalId) {
    	return goals[goalId];
    }

    function all() {
    	return goals;
    }
}
}());

;(function() {
"use strict";

angular
    .module('fittus.auth', []);
}());

;(function() {
"use strict";

angular
    .module('fittus.auth')
    .service("Auth", ["$firebaseAuth", "FIREBASE_DATABASE_URL", function($firebaseAuth, FIREBASE_DATABASE_URL) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);

        return {
            instance: instance,
            getAuth: getAuth,
            logout: logout
        };

        //////////

        function getAuth() {
        	return ref.getAuth();
        }

        function instance() {
            return $firebaseAuth(ref);
        }

        function logout() {
            ref.unauth();
        }
    }]);
}());

;(function() {
"use strict";

angular
    .module('fittus.auth')
    .service("User", ["$q", "FIREBASE_DATABASE_URL", "Auth", function($q, FIREBASE_DATABASE_URL, Auth) {
        var usersRef = new Firebase(FIREBASE_DATABASE_URL + "/users");

        var service = {
            add: add,
            set: set,
            get: get,
            getFriends: getFriends,
            search: search,
            getAuthUser: getAuthUser,
            usersRef: usersRef
        };

        return service;

        /////

        function getFriends(user) {
            var friends = [];
            // Get friends list info
            angular.forEach(user.friends, function(friendId) {
                usersRef.child(friendId).on('value', function(linkedUserSnap) {
                    var linkedUser = linkedUserSnap.val();
                    linkedUser.uid = linkedUserSnap.key();
                    friends.push(linkedUser);
                });
            });

            return friends;
        }

        function search(keyword) {
            var d = $q.defer();
            usersRef.orderByChild('name').startAt(keyword).on('value', function(usersSnap) {
                var users = [];
                usersSnap.forEach(function(userSnap) {
                    var user = userSnap.val();
                    user.uid = userSnap.key();
                    users.push(user);
                });
                d.resolve(users);
            }, function() {
                d.reject();
            });

            return d.promise;
        }

        function add(authData, callback) {
            var newUser = {
                provider: authData.provider,
                name: _getName(authData),
                avatar: _getProfileImage(authData),
                linked_account: _getLinkedAccount(authData)
            };

            usersRef.child(authData.uid).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                if (exists) { // exists
                    if (callback) callback(true);
                } else { // non exists
                    usersRef.child(authData.uid).set(newUser);
                    if (callback) callback(false);
                }
            });
        }

        function set(attr, data) {
            var authUser = Auth.getAuth();
            usersRef.child(authUser.uid).child(attr).set(angular.fromJson(angular.toJson(data)));
        }

        function get(uid) {
            var d = $q.defer();
            usersRef.child(uid).on("value", function(snap) {
                var user = snap.val();
                user.uid = snap.key();
                d.resolve(user);
            }, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
                d.reject();
            });

            return d.promise;
        }

        function getAuthUser() {
            var d = $q.defer();
            var authData = Auth.getAuth();

            usersRef.child(authData.uid).on("value", function(snap) {
                var user = snap.val();
                user.uid = snap.key();
                d.resolve(user);
            }, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
                d.reject();
            });

            return d.promise;
        }

        function _getLinkedAccount(authData) {
            switch (authData.provider) {
                case 'google':
                    return "https://plus.google.com/" + authData.google.id;
                    break;
                case 'facebook':
                    return 'https://www.facebook.com/' + authData['facebook'].id;
                    break;
            }
        }

        function _getProfileImage(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.profileImageURL;
                    break;
                case 'facebook':
                    return authData.facebook.profileImageURL;
                    break;
            }
        }

        // find a suitable name based on the meta info given by each provider
        function _getName(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.displayName;
                    break;
                case 'facebook':
                    return authData.facebook.displayName;
                    break;
            }
        }
    }])
}());

;(function() {
"use strict";

angular
    .module('fittus.gym', []);
}());

;(function() {
"use strict";

GymController.$inject = ["$scope", "$state", "$timeout", "$ionicLoading", "user", "User", "Gym"];
angular
    .module('fittus.gym')
    .controller('GymController', GymController);

function GymController($scope, $state, $timeout, $ionicLoading, user, User, Gym) {
    // variables
    var vm = this;
    vm.authUser = user;
    vm.zipcode = null;
    vm.gyms = [];
    vm.selectedGym = null;

    // functions
    vm.search = search;
    vm.goNext = goNext;

    ///////

    var changeTimeoutPromise = false;

    function search(zipcode) {
        if (changeTimeoutPromise) $timeout.cancel(changeTimeoutPromise);
        changeTimeoutPromise = $timeout(function() {
            $ionicLoading.show();
            Gym.search(vm.zipcode).then(function(gyms) {
                vm.gyms = gyms;
            }).finally(function() {
                $ionicLoading.hide();
            });
        }, 1000);
    }

    function goNext() {
        User.set('gym', vm.selectedGym);
        $state.go('goal');
    }
}
}());

;(function() {
"use strict";

angular
    .module('fittus.gym')
    .service("Gym", ["$http", "$q", function($http, $q) {
        var gyms = [{
            id: 1,
            name: 'All time Fitness',
            street: '1010 Treemont Street',
            area: 'Chicago MA',
            zipcode: '02151'
        }, {
            id: 2,
            name: 'Planet Fitness #2152',
            street: '1010 Treemont Street',
            area: 'Boston MA',
            zipcode: '02151'
        }, {
            id: 3,
            name: 'Great fitness #2152',
            street: '1010 Treemont Street',
            area: 'New York',
            zipcode: '10007'
        }];

        var service = {
            search: search
        };

        return service;

        /////

        // function search(zipcode) {
        //     return gyms.filter(function (gym) {
        //         return (zipcode == gym.zipcode);
        //     });
        // }

        function search(zipcode) {
            var d = $q.defer();

            var clientID = 'DOK4YLYQILB5L5L0Y24ZNTUISHGCR3YNVTHEMF2E0DPQO53Y',
                clientSecret = 'TLV3HAQLDY3MKNSQQKCPQ40BQAHD4TKDYAGTVPHRWGNSL3G1';
            $http.get(
                "https://api.foursquare.com/v2/venues/explore/?near=" +
                zipcode +
                "&venuePhotos=1&categoryId=4bf58dd8d48988d175941735" +
                "&client_id=" + clientID +
                "&client_secret=" + clientSecret +
                " &v=20131124"
            ).then(function(result, status) {
                var items = result.data.response.groups[0].items;

                var help = [];
                for (var el in items) {
                    var place = parseVenue(items[el]);
                    help.push(place);
                }

                d.resolve(help);
            }, function(data, status) {
                console.log(data, status);
                d.reject();
            });

            return d.promise;
        }

        function parseVenue(data) {
            var venue = data.venue;
            var price = '$';

            if (venue.price) {
                var value = venue.price.tier;
                while (value > 1) {
                    price += '$';
                    value--;
                }
            } else {
                price = '';
            }

            var rating = Math.round(venue.rating) / 2.0;
            var plus = [];
            var minus = [];
            for (var i in [0, 1, 2, 3, 4]) {
                if (rating > 0.5) {
                    rating--;
                    plus.push(i);
                } else {
                    minus.push(i);
                }
            }

            var picture_url = '';
            try {
                picture_url = venue.photos.groups[0].items[0].prefix + '100x100' + venue.photos.groups[0].items[0].suffix;
            } catch (e) {
                console.log(e);
            }

            return {
                name: venue.name,
                plus: plus,
                minus: minus,
                venueID: venue.id,
                picture_url: picture_url,
                reviews: venue.ratingSignals + ' reviews',
                price: price,
                place: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
                category: venue.categories[0].name
            };
        };
    }]);
}());

;(function() {
"use strict";

angular
        .module('fittus.invite', []);
}());

;(function() {
"use strict";

InviteController.$inject = ["$scope", "$state", "$cordovaContacts", "$cordovaSms", "$ionicLoading"];
angular
    .module('fittus.invite')
    .controller('InviteController', InviteController);

function InviteController($scope, $state, $cordovaContacts, $cordovaSms, $ionicLoading) {
    var sc = $scope;

    try {
        $ionicLoading.show();
        $cordovaContacts.find({ filter: '', multiple: true }).then(function(allContacts) { //omitting parameter to .find() causes all contacts to be returned
            $ionicLoading.hide();
            sc.members = allContacts;
            init();
        });
    } catch (e) {
        $ionicLoading.hide();
        console.log(e, 'codorvaContact is required');
    }

    sc.selection = {
        member: []
    };

    sc.doInvite = function() {
        var smsContent = 'Come work out with me on Fittus!';
        var inviteNumbers = [];

        angular.forEach(sc.selection.member, function(isSelected, index) {
            if (isSelected) {
                var mem = sc.members[index];
                if (mem.phoneNumbers.length) {
                    console.log(mem.phoneNumbers[0].value);
                    inviteNumbers.push(mem.phoneNumbers[0].value);
                }
            }
        });

        try {
            console.log(inviteNumbers.join(','));
            $cordovaSms
                .send(inviteNumbers.join(','), smsContent)
                .then(function() {
                    // Success! SMS was sent
                    console.log('Success! SMS was sent');
                }, function(error) {
                    // An error occurred
                    console.log('ERROR! SMS can not sent');
                }).finally(function() {
                    $state.go('home.feed');
                });
        } catch (e) {
            console.log(e);
        }

    }

    sc.skip = function() {
        $state.go('home.feed');
    }

    function init() {

        for (var i = 0; i < sc.members.length; i++) {
            sc.selection.member.push(false);
        }
    }

}
}());

;(function() {
"use strict";

angular
    .module('fittus.home', []);
}());

;(function() {
"use strict";

angular
        .module('fittus.workout', []);
}());

;(function() {
"use strict";

WorkoutInviteController.$inject = ["$scope", "$state", "FIREBASE_DATABASE_URL", "$ionicHistory", "$stateParams", "user", "User"];
angular
    .module('fittus.workout')
    .controller('WorkoutInviteController', WorkoutInviteController);

function WorkoutInviteController($scope, $state, FIREBASE_DATABASE_URL, $ionicHistory, $stateParams, user, User) {
    var vm = this,
        ref = new Firebase(FIREBASE_DATABASE_URL),
        userRef = ref.child('users');
    vm.user = user;
    vm.selection = [];
    vm.friends = [];
    vm.workout = $stateParams.workout;
    vm.invitees = [];
    // Get friends list info
    angular.forEach(vm.user.friends, function(friendId) {
        userRef.child(friendId).on('value', function(linkedUserSnap) {
            var linkedUser = linkedUserSnap.val();
            linkedUser.uid = linkedUserSnap.key();
            vm.friends.push(linkedUser);
        });
    });

    vm.chooseFriend = chooseFriend;

    ////////

    function chooseFriend(uid) {
        var index = vm.invitees.indexOf(uid);
        if(index == -1) {
            vm.invitees.push(uid);
        }else{
            vm.invitees.splice(index, 1);
        }
    }

    vm.goBack = function() {
        $ionicHistory.goBack();
    }

    vm.doSkip = function() {
        vm.invitees = [];
        ref.child('scheduled_workouts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.workout)));
        $state.go('home.calendar',{newevent: vm.workout});
    }

    vm.doInvite = function() {
        // save workout to firebase
        var scheduledWorkoutRef = ref.child('scheduled_workouts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.workout)));
        angular.forEach(vm.invitees, function (uid) {
            ref.child('users').child(uid).child('invites').push({
                invitor_id: vm.user.uid,
                event_id: scheduledWorkoutRef.key()
            });
        });
        $state.go('home.calendar',{newevent: vm.workout});
    }

}
}());

;(function() {
"use strict";

WorkoutScheduleController.$inject = ["$scope", "$state", "$ionicHistory"];
angular
    .module('fittus.workout')
    .controller('WorkoutScheduleController', WorkoutScheduleController);

function WorkoutScheduleController($scope, $state, $ionicHistory) {
	var vm = this;
	vm.newWorkout = {};
    vm.newWorkout.date = new Date();
	vm.weekdays = ['S','M','T','W','Th','F','Sa'];
	vm.selectedWeekdays = [];

	vm.selectRepeatDays = selectRepeatDays;
    vm.goBack = goBack;
    vm.goNext = goNext;

    /////////

    function selectRepeatDays(day) {
    	var index = vm.selectedWeekdays.indexOf(day);
    	if(index == -1) {
    		vm.selectedWeekdays.push(day);
    	}else{
    		vm.selectedWeekdays.splice(index, 1);
    	}
    	vm.newWorkout.weekdays = vm.selectRepeatDays;
    }

    function goBack() {
        $state.go('home.calendar');
    }

	function goNext() {
        $state.go('workout-invite', {workout: vm.newWorkout});
    }
}
}());

;(function() {
"use strict";

angular
    .module('fittus.tutorial', []);
}());

;(function() {
"use strict";

TutorialController.$inject = ["$scope", "$state", "$ionicSlideBoxDelegate", "Auth", "User"];
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
}());

;(function() {
"use strict";

    CalendarController.$inject = ["$scope", "$stateParams", "$state", "$window", "$ionicModal", "$ionicPopover", "FIREBASE_DATABASE_URL", "user", "events"];
angular
        .module('fittus.home')
        .controller('CalendarController', CalendarController);

    function CalendarController($scope, $stateParams, $state, $window, $ionicModal, $ionicPopover, FIREBASE_DATABASE_URL, user, events) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);
        $scope.dayEvents = [];
        $scope.events = events;
        $scope.invites = [];

        // Get invites
        ref.child('users').child(user.uid).child('invites').on('value', function(inviteSnap) {
            inviteSnap.forEach(function(childSnap) {
                var invite = childSnap.val();
                // get scheduled workout info
                if (invite) {
                    ref.child('scheduled_workouts').child(invite.invitor_id).child(invite.event_id).once('value', function(workoutSnap) {
                        ref.child('users').child(invite.invitor_id).once('value', function(userSnap) {
                            $scope.invites.push({
                                workout: workoutSnap.val(),
                                invitor: userSnap.val()
                            });
                        });
                    });
                }
            });
        });

        // Get events for today
        angular.forEach(events, function(ev) {
            //Create date from input value
            var inputDate = new Date(ev.date);
            inputDate = inputDate.toDateString();

            //Get today's date
            var todaysDate = new Date();
            todaysDate = todaysDate.toDateString();

            //call setHours to take the time out of the comparison
            if (inputDate === todaysDate) {
                $scope.dayEvents.push(ev);
            }
        });

        // Options for flex calendar
        $scope.options = {
            defaultDate: new Date(),
            minDate: "2016-01-01",
            dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
            mondayIsFirstDay: false, //set monday as first day of week. Default is false
            dateClick: function(date) { // called every time a day is clicked
                $scope.dayEvents = date.event;
            }
        };

        // Init invites modal
        $ionicModal.fromTemplateUrl('module/home/calendar/view_invites.template.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.viewInviteModal = modal;
        });

        $ionicPopover.fromTemplateUrl('module/workout/detail.template.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.workoutDetailPopover = popover;
        });

        $scope.addWorkout = function() {
            $state.go('workout-schedule');
        }
        $scope.openViewInviteModal = function() {
            $scope.viewInviteModal.show();
        }

        $scope.openWorkoutDetail = function (workout) {
            $scope.currentworkout = workout;
            $scope.workoutDetailPopover.show();
        }
    }
}());

;(function() {
"use strict";

angular
    .module('fittus.home')
    .service("Calendar", ["FIREBASE_DATABASE_URL", "$q", function(FIREBASE_DATABASE_URL, $q) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);
        var service = {
            getEvents: getEvents,
        };

        return service;

        /////

        function getEvents(uid) {
            var defer = $q.defer();
            var events = [];
            ref.child('scheduled_workouts').child(uid).on('value', function (workoutSnap) {
                workoutSnap.forEach(function (childSnap) {
                    var event = childSnap.val();
                    events.push(event);
                    // var date = new Date(event.date);
                    // events.push({
                    //     name: event.name,
                    //     date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +  date.getDate()
                    // });
                });
                defer.resolve(events);
            });

            return defer.promise;
        }
    }]);
}());

;(function() {
"use strict";

angular
    .module('fittus.home')
    .factory('CordovaCamera', ["$cordovaCamera", "$q", function($cordovaCamera, $q) {
        var self = this;

        //
        // generic function for retrieving a base64 imagedata string
        self.newImage = function(sourceType, optTargetSize) {

            var q = $q.defer();

            var targetSizeTarget = 800;
            if (optTargetSize != undefined && optTargetSize != "") {
                targetSizeTarget = optTargetSize;
            };

            var sourceType;
            switch (sourceType) {
                case "CAMERA":
                    //
                    sourceType = Camera.PictureSourceType.CAMERA;
                    break
                case "PHOTOLIBRARY":
                    //
                    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                    break
            };

            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: sourceType,
                allowEdit: true,
                targetWidth: targetSizeTarget,
                targetHeight: targetSizeTarget,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                q.resolve("data:image/jpeg;base64," + imageData);
            }, function(error) {
                q.reject(error);
            });
            return q.promise;
        };

        //
        // mock used to test adding a new image on desktop
        self.newImageTest = function(sourceType, targetSize) {
            var q = $q.defer();
            var tempImg = "data:image/jpeg;base64,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";
            q.resolve(tempImg);
            return q.promise;
        };

        return self;

    }])
}());

;(function() {
"use strict";

FeedController.$inject = ["$scope", "$state", "$timeout", "$ionicLoading", "$ionicActionSheet", "CordovaCamera", "FIREBASE_DATABASE_URL", "$firebaseObject", "$firebaseArray", "user", "$ionicModal", "ionicTimePicker", "Post", "User", "Gym"];
angular
    .module('fittus.home')
    .controller('FeedController', FeedController);

function FeedController($scope, $state, $timeout, $ionicLoading, $ionicActionSheet, CordovaCamera, FIREBASE_DATABASE_URL, $firebaseObject, $firebaseArray, user, $ionicModal, ionicTimePicker, Post, User, Gym) {
    var vm = this,
        ref = new Firebase(FIREBASE_DATABASE_URL),
        userRef = ref.child('users'),
        changeTimeoutPromise;
    vm.user = user;
    var friendsRef = ref.child('users').child(vm.user.uid).child('friends');
    var postsRef = ref.child('posts');
    vm.newfeed = []; // all posts
    vm.openTagFriendModal = openTagFriendModal;
    vm.friends = [];
    if (vm.user.started_post_id) {
        $scope.floatButton = 'workout-complete';
    } else {
        $scope.floatButton = 'workout-add';
    }

    initNewPostObject(); // init new post

    // functions register --------
    vm.openTimePicker = openTimePicker;
    vm.attachPhoto = attachPhoto;
    vm.openChangeGymModal = openChangeGymModal; // open change gym modal
    vm.search = search;
    vm.addFriendToPost = addFriendToPost;
    vm.likePost = likePost;
    vm.addComment = addComment;
    vm.loadPostComments = loadPostComments;

    // functions execution --------

    // Get friend's posts
    angular.forEach(vm.user.friends, function(friendId) {
        postsRef.child(friendId).on('child_added', function(postSnap) {
            var post = postSnap.val();
            post.taggedFriendsName = [];
            post.taggedFriendsAvatar = [];
            post.id = postSnap.key();
            if (!post.likes) post.likes = [];
            post.likes = angular.fromJson(post.likes);

            angular.forEach(post.friends, function(friendId) {
                User.get(friendId).then(function(friend) {
                    post.taggedFriendsName.push(friend.name);
                    post.taggedFriendsAvatar.push(friend.avatar);
                });
            });

            userRef.child(friendId).on('value', function(linkedUserSnap) {
                post.user = linkedUserSnap.val();
                post.user.uid = linkedUserSnap.key();
                angular.forEach(post.comments, function(cmt) {
                    if (!cmt.user) {
                        User.get(cmt.uid).then(function(u) {
                            cmt.user = u;
                        });
                    }
                });
                vm.newfeed.unshift(post);
            });
        });
    });

    // Get 10 of my newest posts
    postsRef.child(vm.user.uid).limitToLast(10).on("child_added", function(postSnap) {
        var post = postSnap.val();
        post.user = vm.user;
        post.taggedFriendsName = [];
        post.taggedFriendsAvatar = [];
        post.id = postSnap.key();
        if (!post.likes) post.likes = [];
        post.likes = angular.fromJson(post.likes);

        angular.forEach(post.friends, function(friendId) {
            User.get(friendId).then(function(friend) {
                post.taggedFriendsName.push(friend.name);
                post.taggedFriendsAvatar.push(friend.avatar);
            });
        });
        angular.forEach(post.comments, function(cmt) {
            if (!cmt.user) {
                User.get(cmt.uid).then(function(u) {
                    cmt.user = u;
                });
            }
        });
        vm.newfeed.unshift(post);
    });

    // Get friends list info
    angular.forEach(vm.user.friends, function(friendId) {
        userRef.child(friendId).on('value', function(linkedUserSnap) {
            var linkedUser = linkedUserSnap.val();
            linkedUser.uid = linkedUserSnap.key();
            vm.friends.push(linkedUser);
        });
    });

    initModals();

    ///////////

    function initNewPostObject() {
        var now = new Date(),
            hours = now.getHours(),
            ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours > 12 ? hours - 12 : hours;

        // new post object
        vm.post = {
            content: '',
            time: {
                hours: hours,
                minutes: now.getMinutes(),
                ampm: ampm
            },
            location: user.gym,
            friends: []
        };
    }

    function likePost(post) {
        var index = post.likes.indexOf(vm.user.uid);
        if (index == -1) {
            post.likes.push(vm.user.uid); // like
        } else {
            post.likes.splice(index, 1); // unlike
        }
        // save to firebase
        postsRef.child(vm.user.uid).child(post.id).child('likes').set(angular.toJson(angular.fromJson(post.likes)));
    }

    function addComment(post) {
        // save to firebase
        if (!post.comments) post.comments = {};
        var newCommentRef = postsRef.child(post.user.uid).child(post.id).child('comments').push({
            comment: vm.newComment,
            uid: vm.user.uid
        });
        post.comments[newCommentRef.key()] = {
            comment: vm.newComment,
            user: vm.user
        };
    }

    function loadPostComments(post, index) {
        vm.newComment = '';

        vm.commentSectionOnPost == index ? vm.commentSectionOnPost = -1 : vm.commentSectionOnPost = index;
    }

    function openTagFriendModal() {
        vm.tagFriendModal.show();
    }

    function addFriendToPost(uid) {
        vm.post.friends.push(uid);
    }

    function attachPhoto() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Take a new picture' },
                { text: 'Import from phone library' },
            ],
            titleText: 'Attach photo',
            cancelText: 'Cancel',
            cancel: function() {},
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        //
                        proceedChangePicture("CAMERA");
                        break
                    case 1:
                        //
                        proceedChangePicture("PHOTOLIBRARY");
                        break
                }
                return true;
            }
        });
    }

    function proceedChangePicture(sourceType) {
        CordovaCamera.newImage(sourceType, 200).then(
            function(imageData) {

                if (imageData != undefined) {
                    vm.post.image = imageData;
                }

            },
            function(error) {
                //Codes.handleError(error);
            }
        )
    };

    function openTimePicker() {
        var inputTime = 0;
        if(vm.post.time.ampm == 'PM' && vm.post.time.hours < 12) {
            inputTime = (vm.post.time.hours + 12) * 3600 + vm.post.time.minutes *60;
        }else{
            inputTime = vm.post.time.hours * 3600 + vm.post.time.minutes *60;
        }
        var ipObj1 = {
            inputTime: inputTime,
            step: 1,
            format: 12,
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000),
                        hours = selectedTime.getUTCHours(),
                        ampm = hours >= 12 ? 'PM' : 'AM';

                    hours = hours > 12 ? hours - 12 : hours;
                    vm.post.time = {
                        hours: hours,
                        minutes: selectedTime.getUTCMinutes(),
                        ampm: ampm
                    }
                }
            },
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }

    function initModals() {
        // New start post modal
        $ionicModal.fromTemplateUrl('module/home/feed/workout-start.template.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.workoutStartModal = modal;
        });

        // New complete post modal
        $ionicModal.fromTemplateUrl('module/home/feed/workout-complete.template.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.workoutCompleteModal = modal;
        });

        // Change location modal
        $ionicModal.fromTemplateUrl('module/home/profile/change-gym.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.changeGymModal = modal;
        });

        // Tag friend modal
        $ionicModal.fromTemplateUrl('module/home/feed/tag-friend.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.tagFriendModal = modal;
        });
    }

    $scope.showWorkoutModal = function() {
        if ($scope.floatButton == 'workout-add') {
            $scope.workoutStartModal.show();
        } else {
            // Calculate workout time
            ref.child('posts').child(vm.user.uid).child(vm.user.started_post_id).once('value', function(postSnap) {
                var post = postSnap.val();
                var now = new Date();
                var diff = new Date(now - post.createdAt);
                vm.workoutDuration = {
                    hours: diff.getUTCHours(),
                    minutes: diff.getUTCMinutes()
                }
            });
            $scope.workoutCompleteModal.show();
        }
    }

    $scope.closeModal = function(modal) {
        if (modal == 'workout-add') {
            $scope.workoutStartModal.hide();
        } else {
            $scope.workoutCompleteModal.hide();
        }
    }

    $scope.doStartWorkout = function() {
        $scope.workoutStartModal.hide();
        $scope.floatButton = 'workout-complete';
        vm.post.status = 'started';

        var newPostRef = ref.child('posts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.post)));
        newPostRef.child('createdAt').set(Firebase.ServerValue.TIMESTAMP);
        // Save pushed post id to track complete
        vm.user.started_post_id = newPostRef.key();
        ref.child('users').child(vm.user.uid).child('started_post_id').set(newPostRef.key()); // save to firebase
        // clear out post content
        initNewPostObject();
    }

    $scope.doCompleteWorkout = function() {
        $scope.workoutCompleteModal.hide();
        $scope.floatButton = 'workout-add';
        vm.post.status = 'finished';
        vm.user.started_post_id = '';
        ref.child('users').child(vm.user.uid).child('started_post_id').remove(); // save to firebase
        ref.child('posts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.post)));
        initNewPostObject();
    }

    /**
     * Open change gym modal listener
     */
    function openChangeGymModal() {
        vm.changeGymModal.show();
    }

    /**
     * Search for gyms via Foursquare api
     * @param  {integer} zipcode
     */
    function search() {
        if (changeTimeoutPromise) $timeout.cancel(changeTimeoutPromise);
        changeTimeoutPromise = $timeout(function() {
            $ionicLoading.show();
            Gym.search(vm.zipcode).then(function(gyms) {
                vm.gyms = gyms;
            }).finally(function() {
                $ionicLoading.hide();
            });
        }, 1000);
    }

    function extend(base) {
        var parts = Array.prototype.slice.call(arguments, 1);
        parts.forEach(function(p) {
            if (p && typeof(p) === 'object') {
                for (var k in p) {
                    if (p.hasOwnProperty(k)) {
                        base[k] = p[k];
                    }
                }
            }
        });
        return base;
    }

    function joinPaths(id, paths, callback) {
        var returnCount = 0;
        var expectedCount = paths.length;
        var mergedObject = {};

        paths.forEach(function(p) {
            ref.child(p + '/' + id).once('value',
                // success
                function(snap) {
                    // add it to the merged data
                    // extend(mergedObject, snap.val());
                    mergedObject[p] = snap.val();

                    // when all paths have resolved, we invoke
                    // the callback (jQuery.when would be handy here)
                    if (++returnCount === expectedCount) {
                        callback(null, mergedObject);
                    }
                },
                // error
                function(error) {
                    returnCount = expectedCount + 1; // abort counters
                    callback(error, null);
                }
            );
        });
    }

}
}());

;(function() {
"use strict";

angular
    .module('fittus.home')
    .service("Post", ["FIREBASE_DATABASE_URL", "$q", function(FIREBASE_DATABASE_URL, $q) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);
        var service = {
            add: add,
            all: all
        };

        return service;

        /////

        function add(post) {
            var myRef = ref.child('posts').child(post.user_id).push(post);
            myRef.onDisconnect().update({ endedAt: Firebase.ServerValue.TIMESTAMP });
            myRef.update({ startedAt: Firebase.ServerValue.TIMESTAMP });
        }

        function all(page) {
            var d = $q.defer();
            ref.child('posts').on("value", function(postsSnap) {
                var posts = postsSnap.val();
                angular.forEach(posts, function(post) {
                    ref.child('users').on("value", function(usersSnap) {
                        post.user = usersSnap.val();
                    }, function(errorObject) {
                        console.log("The read user failed: " + errorObject.code);
                        d.reject();
                    });
                    d.resolve(posts);
                });
            }, function(errorObject) {
                d.reject();
                console.log("The read failed: " + errorObject.code);
            });

            return d.promise;
        }

        function _extend(base) {
            var parts = Array.prototype.slice.call(arguments, 1);
            parts.forEach(function(p) {
                if (p && typeof(p) === 'object') {
                    for (var k in p) {
                        if (p.hasOwnProperty(k)) {
                            base[k] = p[k];
                        }
                    }
                }
            });
            return base;
        }
    }]);
}());

;(function() {
"use strict";

ProfileController.$inject = ["$scope", "$state", "FIREBASE_DATABASE_URL", "$timeout", "$ionicModal", "$ionicLoading", "user", "Goal", "Auth", "Gym", "User"];
angular
    .module('fittus.home')
    .controller('ProfileController', ProfileController);

function ProfileController($scope, $state, FIREBASE_DATABASE_URL, $timeout, $ionicModal, $ionicLoading, user, Goal, Auth, Gym, User) {
    var vm = this,
        changeTimeoutPromise = false; // use to prevent search while typing zipcode
    vm.user = user;
    vm.user.friends = vm.user.friends ? vm.user.friends : [];
    var ref = new Firebase(FIREBASE_DATABASE_URL);
    var gymRef = ref.child('users').child(vm.user.uid).child('gym');
    var goalRef = ref.child('users').child(vm.user.uid).child('goals');
    var friendsRef = ref.child('users').child(vm.user.uid).child('friends');

    vm.user.goals = vm.user.goals ? vm.user.goals : [];
    vm.selectedGoals = vm.user.goals;
    vm.changeGymModal = null;
    vm.changeGoalModal = null;
    vm.goalSelected = 1;
    vm.friendList = [];
    if (vm.user.goals) {
        var tempGoals = [];
        angular.forEach(vm.user.goals, function(goal) {
            tempGoals.push(Goal.get(goal));
        });
        vm.user.goals = tempGoals;
    }
    // functions register
    vm.logout = logout; // logout
    vm.openChangeGymModal = openChangeGymModal;
    vm.openChangeGoalModal = openChangeGoalModal;
    vm.search = search; // search gym
    vm.searchPeople = searchPeople; // search people
    vm.followPeople = followPeople;
    vm.unfollowPeople = unfollowPeople;
    vm.changeGoal = changeGoal;
    vm.saveChangedGoals = saveChangedGoals;

    // functions execute
    initModals(); // run init modal function

    // Get friends
    angular.forEach(vm.user.friends, function(friendId) {
        ref.child('users').child(friendId).on('value', function(friendSnap) {
            var f = friendSnap.val();
            f.uid = friendSnap.key();
            vm.friendList.push(f);
        });
    });

    // Watch for gym change
    $scope.$watch('vm.user.gym', function(newGym, oldGym) {
        if (newGym && oldGym && (newGym.name != oldGym.name)) {
            gymRef.set(angular.fromJson(angular.toJson(newGym)));
        }
    });

    ////////
    /**
     * Change current user goal
     * @param  {string} id
     */
    function changeGoal(id) {
        var index = vm.selectedGoals.indexOf(id);
        if (index != -1) {
            vm.selectedGoals.splice(index, 1);
        } else {
            vm.selectedGoals.push(id);
        }

        var tempGoals = [];
        angular.forEach(vm.selectedGoals, function(goal) {
            tempGoals.push(Goal.get(goal));
        });
        vm.user.goals = tempGoals;
    }

    function saveChangedGoals() {
        goalRef.set(angular.fromJson(angular.toJson(vm.selectedGoals)));
    }
    /**
     * Search for gyms via Foursquare api
     * @param  {integer} zipcode
     */
    function search() {
        if (changeTimeoutPromise) $timeout.cancel(changeTimeoutPromise);
        changeTimeoutPromise = $timeout(function() {
            Gym.search(vm.zipcode).then(function(gyms) {
                vm.gyms = gyms;
            }, function() {
                // TODO: show not found
            });
        }, 1000);
    }

    function searchPeople() {
        vm.people = [];
        if (changeTimeoutPromise) $timeout.cancel(changeTimeoutPromise);
        changeTimeoutPromise = $timeout(function() {
            $ionicLoading.show();
            User.search(vm.searchPeopleInput).then(function(people) {
                vm.people = people;
            }).finally(function() {
                $ionicLoading.hide();
            });
        }, 1000);
    }

    /**
     * Open change gym modal listener
     */
    function openChangeGymModal() {
        vm.changeGymModal.show();
    }

    /**
     * Open change goal modal listener
     */
    function openChangeGoalModal() {
        vm.changeGoalModal.show();
    }

    /**
     * Logout of this app
     */
    function logout() {
        Auth.logout();
        $state.go('tutorial');
    }

    /**
     * Init, load all modal templates
     */
    function initModals() {
        $ionicModal.fromTemplateUrl('module/home/profile/change-gym.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.changeGymModal = modal;
        });

        $ionicModal.fromTemplateUrl('module/home/profile/change-goal.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.changeGoalModal = modal;
        });
    }

    function followPeople(uid) {
        vm.user.friends.push(uid);
        friendsRef.set(vm.user.friends);
    }

    function unfollowPeople(uid) {
        var index = vm.user.friends.indexOf(uid);
        if (index > -1) {
            vm.user.friends.splice(index, 1);
            vm.friendList.splice(index, 1);
            friendsRef.set(vm.user.friends);
        }
    }
}
}());
