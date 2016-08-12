angular
    .module('fittus.home')
    .controller('FeedController', FeedController);

function FeedController($scope, $state, $timeout, $ionicLoading, $ionicActionSheet, CordovaCamera, FIREBASE_DATABASE_URL, $firebaseObject, $firebaseArray, user, $ionicModal, ionicTimePicker, Post, User, Gym) {
    var vm = this,
        ref = new Firebase(FIREBASE_DATABASE_URL),
        userRef = ref.child('users'),
        changeTimeoutPromise;
    vm.user = user;
    var friendsRef = ref.child('users').child(vm.user.uid).child('friends');
    var postsRef = ref.child('posts');
    vm.newfeed = []; // all posts
    vm.openTagFriendModal = openTagFriendModal;
    vm.friends = [];
    if (vm.user.started_post_id) {
        $scope.floatButton = 'workout-complete';
    } else {
        $scope.floatButton = 'workout-add';
    }

    initNewPostObject(); // init new post

    // functions register --------
    vm.openTimePicker = openTimePicker;
    vm.attachPhoto = attachPhoto;
    vm.openChangeGymModal = openChangeGymModal; // open change gym modal
    vm.search = search;
    vm.addFriendToPost = addFriendToPost;
    vm.likePost = likePost;
    vm.addComment = addComment;
    vm.loadPostComments = loadPostComments;

    // functions execution --------

    // Get friend's posts
    angular.forEach(vm.user.friends, function(friendId) {
        postsRef.child(friendId).on('child_added', function(postSnap) {
            var post = postSnap.val();
            post.taggedFriendsName = [];
            post.taggedFriendsAvatar = [];
            post.id = postSnap.key();
            if (!post.likes) post.likes = [];
            post.likes = angular.fromJson(post.likes);

            angular.forEach(post.friends, function(friendId) {
                User.get(friendId).then(function(friend) {
                    post.taggedFriendsName.push(friend.name);
                    post.taggedFriendsAvatar.push(friend.avatar);
                });
            });

            userRef.child(friendId).on('value', function(linkedUserSnap) {
                post.user = linkedUserSnap.val();
                post.user.uid = linkedUserSnap.key();
                angular.forEach(post.comments, function(cmt) {
                    if (!cmt.user) {
                        User.get(cmt.uid).then(function(u) {
                            cmt.user = u;
                        });
                    }
                });
                vm.newfeed.unshift(post);
            });
        });
    });

    // Get 10 of my newest posts
    postsRef.child(vm.user.uid).limitToLast(10).on("child_added", function(postSnap) {
        var post = postSnap.val();
        post.user = vm.user;
        post.taggedFriendsName = [];
        post.taggedFriendsAvatar = [];
        post.id = postSnap.key();
        if (!post.likes) post.likes = [];
        post.likes = angular.fromJson(post.likes);

        angular.forEach(post.friends, function(friendId) {
            User.get(friendId).then(function(friend) {
                post.taggedFriendsName.push(friend.name);
                post.taggedFriendsAvatar.push(friend.avatar);
            });
        });
        angular.forEach(post.comments, function(cmt) {
            if (!cmt.user) {
                User.get(cmt.uid).then(function(u) {
                    cmt.user = u;
                });
            }
        });
        vm.newfeed.unshift(post);
    });

    // Get friends list info
    angular.forEach(vm.user.friends, function(friendId) {
        userRef.child(friendId).on('value', function(linkedUserSnap) {
            var linkedUser = linkedUserSnap.val();
            linkedUser.uid = linkedUserSnap.key();
            vm.friends.push(linkedUser);
        });
    });

    initModals();

    ///////////

    function initNewPostObject() {
        var now = new Date(),
            hours = now.getHours(),
            ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours > 12 ? hours - 12 : hours;

        // new post object
        vm.post = {
            content: '',
            time: {
                hours: hours,
                minutes: now.getMinutes(),
                ampm: ampm
            },
            location: user.gym,
            friends: []
        };
    }

    function likePost(post) {
        var index = post.likes.indexOf(vm.user.uid);
        if (index == -1) {
            post.likes.push(vm.user.uid); // like
        } else {
            post.likes.splice(index, 1); // unlike
        }
        // save to firebase
        postsRef.child(vm.user.uid).child(post.id).child('likes').set(angular.toJson(angular.fromJson(post.likes)));
    }

    function addComment(post) {
        // save to firebase
        if (!post.comments) post.comments = {};
        var newCommentRef = postsRef.child(post.user.uid).child(post.id).child('comments').push({
            comment: vm.newComment,
            uid: vm.user.uid
        });
        post.comments[newCommentRef.key()] = {
            comment: vm.newComment,
            user: vm.user
        };
    }

    function loadPostComments(post, index) {
        vm.newComment = '';

        vm.commentSectionOnPost == index ? vm.commentSectionOnPost = -1 : vm.commentSectionOnPost = index;
    }

    function openTagFriendModal() {
        vm.tagFriendModal.show();
    }

    function addFriendToPost(uid) {
        vm.post.friends.push(uid);
    }

    function attachPhoto() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Take a new picture' },
                { text: 'Import from phone library' },
            ],
            titleText: 'Attach photo',
            cancelText: 'Cancel',
            cancel: function() {},
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        //
                        proceedChangePicture("CAMERA");
                        break
                    case 1:
                        //
                        proceedChangePicture("PHOTOLIBRARY");
                        break
                }
                return true;
            }
        });
    }

    function proceedChangePicture(sourceType) {
        CordovaCamera.newImage(sourceType, 200).then(
            function(imageData) {

                if (imageData != undefined) {
                    vm.post.image = imageData;
                }

            },
            function(error) {
                //Codes.handleError(error);
            }
        )
    };

    function openTimePicker() {
        var inputTime = 0;
        if(vm.post.time.ampm == 'PM' && vm.post.time.hours < 12) {
            inputTime = (vm.post.time.hours + 12) * 3600 + vm.post.time.minutes *60;
        }else{
            inputTime = vm.post.time.hours * 3600 + vm.post.time.minutes *60;
        }
        var ipObj1 = {
            inputTime: inputTime,
            step: 1,
            format: 12,
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000),
                        hours = selectedTime.getUTCHours(),
                        ampm = hours >= 12 ? 'PM' : 'AM';

                    hours = hours > 12 ? hours - 12 : hours;
                    vm.post.time = {
                        hours: hours,
                        minutes: selectedTime.getUTCMinutes(),
                        ampm: ampm
                    }
                }
            },
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }

    function initModals() {
        // New start post modal
        $ionicModal.fromTemplateUrl('module/home/feed/workout-start.template.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.workoutStartModal = modal;
        });

        // New complete post modal
        $ionicModal.fromTemplateUrl('module/home/feed/workout-complete.template.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.workoutCompleteModal = modal;
        });

        // Change location modal
        $ionicModal.fromTemplateUrl('module/home/profile/change-gym.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.changeGymModal = modal;
        });

        // Tag friend modal
        $ionicModal.fromTemplateUrl('module/home/feed/tag-friend.template.html', {
            scope: $scope
        }).then(function(modal) {
            vm.tagFriendModal = modal;
        });
    }

    $scope.showWorkoutModal = function() {
        if ($scope.floatButton == 'workout-add') {
            $scope.workoutStartModal.show();
        } else {
            // Calculate workout time
            ref.child('posts').child(vm.user.uid).child(vm.user.started_post_id).once('value', function(postSnap) {
                var post = postSnap.val();
                var now = new Date();
                var diff = new Date(now - post.createdAt);
                vm.workoutDuration = {
                    hours: diff.getUTCHours(),
                    minutes: diff.getUTCMinutes()
                }
            });
            $scope.workoutCompleteModal.show();
        }
    }

    $scope.closeModal = function(modal) {
        if (modal == 'workout-add') {
            $scope.workoutStartModal.hide();
        } else {
            $scope.workoutCompleteModal.hide();
        }
    }

    $scope.doStartWorkout = function() {
        $scope.workoutStartModal.hide();
        $scope.floatButton = 'workout-complete';
        vm.post.status = 'started';

        var newPostRef = ref.child('posts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.post)));
        newPostRef.child('createdAt').set(Firebase.ServerValue.TIMESTAMP);
        // Save pushed post id to track complete
        vm.user.started_post_id = newPostRef.key();
        ref.child('users').child(vm.user.uid).child('started_post_id').set(newPostRef.key()); // save to firebase
        // clear out post content
        initNewPostObject();
    }

    $scope.doCompleteWorkout = function() {
        $scope.workoutCompleteModal.hide();
        $scope.floatButton = 'workout-add';
        vm.post.status = 'finished';
        vm.user.started_post_id = '';
        ref.child('users').child(vm.user.uid).child('started_post_id').remove(); // save to firebase
        ref.child('posts').child(vm.user.uid).push(angular.fromJson(angular.toJson(vm.post)));
        initNewPostObject();
    }

    /**
     * Open change gym modal listener
     */
    function openChangeGymModal() {
        vm.changeGymModal.show();
    }

    /**
     * Search for gyms via Foursquare api
     * @param  {integer} zipcode
     */
    function search() {
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

    function extend(base) {
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

    function joinPaths(id, paths, callback) {
        var returnCount = 0;
        var expectedCount = paths.length;
        var mergedObject = {};

        paths.forEach(function(p) {
            ref.child(p + '/' + id).once('value',
                // success
                function(snap) {
                    // add it to the merged data
                    // extend(mergedObject, snap.val());
                    mergedObject[p] = snap.val();

                    // when all paths have resolved, we invoke
                    // the callback (jQuery.when would be handy here)
                    if (++returnCount === expectedCount) {
                        callback(null, mergedObject);
                    }
                },
                // error
                function(error) {
                    returnCount = expectedCount + 1; // abort counters
                    callback(error, null);
                }
            );
        });
    }

}
