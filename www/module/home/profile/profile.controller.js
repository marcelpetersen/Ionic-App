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
