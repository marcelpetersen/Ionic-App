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
