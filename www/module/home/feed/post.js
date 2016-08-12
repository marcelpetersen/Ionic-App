angular
    .module('fittus.home')
    .service("Post", function(FIREBASE_DATABASE_URL, $q) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);
        var service = {
            add: add,
            all: all
        };

        return service;

        /////

        function add(post) {
            var myRef = ref.child('posts').child(post.user_id).push(post);
            myRef.onDisconnect().update({ endedAt: Firebase.ServerValue.TIMESTAMP });
            myRef.update({ startedAt: Firebase.ServerValue.TIMESTAMP });
        }

        function all(page) {
            var d = $q.defer();
            ref.child('posts').on("value", function(postsSnap) {
                var posts = postsSnap.val();
                angular.forEach(posts, function(post) {
                    ref.child('users').on("value", function(usersSnap) {
                        post.user = usersSnap.val();
                    }, function(errorObject) {
                        console.log("The read user failed: " + errorObject.code);
                        d.reject();
                    });
                    d.resolve(posts);
                });
            }, function(errorObject) {
                d.reject();
                console.log("The read failed: " + errorObject.code);
            });

            return d.promise;
        }

        function _extend(base) {
            var parts = Array.prototype.slice.call(arguments, 1);
            parts.forEach(function(p) {
                if (p && typeof(p) === 'object') {
                    for (var k in p) {
                        if (p.hasOwnProperty(k)) {
                            base[k] = p[k];
                        }
                    }
                }
            });
            return base;
        }
    });
