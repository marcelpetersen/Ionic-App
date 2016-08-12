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
