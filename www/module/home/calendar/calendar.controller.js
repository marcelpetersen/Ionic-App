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
