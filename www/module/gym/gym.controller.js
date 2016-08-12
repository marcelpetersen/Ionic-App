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
