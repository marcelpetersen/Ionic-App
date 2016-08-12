angular
    .module('fittus.auth')
    .service("User", function($q, FIREBASE_DATABASE_URL, Auth) {
        var usersRef = new Firebase(FIREBASE_DATABASE_URL + "/users");

        var service = {
            add: add,
            set: set,
            get: get,
            getFriends: getFriends,
            search: search,
            getAuthUser: getAuthUser,
            usersRef: usersRef
        };

        return service;

        /////

        function getFriends(user) {
            var friends = [];
            // Get friends list info
            angular.forEach(user.friends, function(friendId) {
                usersRef.child(friendId).on('value', function(linkedUserSnap) {
                    var linkedUser = linkedUserSnap.val();
                    linkedUser.uid = linkedUserSnap.key();
                    friends.push(linkedUser);
                });
            });

            return friends;
        }

        function search(keyword) {
            var d = $q.defer();
            usersRef.orderByChild('name').startAt(keyword).on('value', function(usersSnap) {
                var users = [];
                usersSnap.forEach(function(userSnap) {
                    var user = userSnap.val();
                    user.uid = userSnap.key();
                    users.push(user);
                });
                d.resolve(users);
            }, function() {
                d.reject();
            });

            return d.promise;
        }

        function add(authData, callback) {
            var newUser = {
                provider: authData.provider,
                name: _getName(authData),
                avatar: _getProfileImage(authData),
                linked_account: _getLinkedAccount(authData)
            };

            usersRef.child(authData.uid).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                if (exists) { // exists
                    if (callback) callback(true);
                } else { // non exists
                    usersRef.child(authData.uid).set(newUser);
                    if (callback) callback(false);
                }
            });
        }

        function set(attr, data) {
            var authUser = Auth.getAuth();
            usersRef.child(authUser.uid).child(attr).set(angular.fromJson(angular.toJson(data)));
        }

        function get(uid) {
            var d = $q.defer();
            usersRef.child(uid).on("value", function(snap) {
                var user = snap.val();
                user.uid = snap.key();
                d.resolve(user);
            }, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
                d.reject();
            });

            return d.promise;
        }

        function getAuthUser() {
            var d = $q.defer();
            var authData = Auth.getAuth();

            usersRef.child(authData.uid).on("value", function(snap) {
                var user = snap.val();
                user.uid = snap.key();
                d.resolve(user);
            }, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
                d.reject();
            });

            return d.promise;
        }

        function _getLinkedAccount(authData) {
            switch (authData.provider) {
                case 'google':
                    return "https://plus.google.com/" + authData.google.id;
                    break;
                case 'facebook':
                    return 'https://www.facebook.com/' + authData['facebook'].id;
                    break;
            }
        }

        function _getProfileImage(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.profileImageURL;
                    break;
                case 'facebook':
                    return authData.facebook.profileImageURL;
                    break;
            }
        }

        // find a suitable name based on the meta info given by each provider
        function _getName(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.displayName;
                    break;
                case 'facebook':
                    return authData.facebook.displayName;
                    break;
            }
        }
    })
