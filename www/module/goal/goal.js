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
