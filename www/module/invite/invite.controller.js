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
