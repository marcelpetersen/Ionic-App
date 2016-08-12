angular
    .module('fittus.home')
    .service("Calendar", function(FIREBASE_DATABASE_URL, $q) {
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
    });
