angular
    .module('fittus.auth')
    .service("Auth", function($firebaseAuth, FIREBASE_DATABASE_URL) {
        var ref = new Firebase(FIREBASE_DATABASE_URL);

        return {
            instance: instance,
            getAuth: getAuth,
            logout: logout
        };

        //////////

        function getAuth() {
        	return ref.getAuth();
        }

        function instance() {
            return $firebaseAuth(ref);
        }

        function logout() {
            ref.unauth();
        }
    });
