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
