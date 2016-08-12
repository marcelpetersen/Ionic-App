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

.run(function($ionicPlatform) {
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
})

.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {});
}])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
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
            user: function(User) {
                return User.getAuthUser();
            }
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
            user: function(User) {
                return User.getAuthUser();
            }
        }
    })

    .state('home.calendar', {
        url: '/calendar',
        params: {
            newevent: null
        },
        resolve: {
            events: function(user, Calendar) {
                return Calendar.getEvents(user.uid);
            }
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
            user: function(User) {
                return User.getAuthUser();
            }
        }
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tutorial');

})

.directive('resolveLoader', function($rootScope, $timeout, $ionicLoading) {

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
});
