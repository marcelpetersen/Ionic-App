angular
    .module('fittus.gym')
    .service("Gym", function($http, $q) {
        var gyms = [{
            id: 1,
            name: 'All time Fitness',
            street: '1010 Treemont Street',
            area: 'Chicago MA',
            zipcode: '02151'
        }, {
            id: 2,
            name: 'Planet Fitness #2152',
            street: '1010 Treemont Street',
            area: 'Boston MA',
            zipcode: '02151'
        }, {
            id: 3,
            name: 'Great fitness #2152',
            street: '1010 Treemont Street',
            area: 'New York',
            zipcode: '10007'
        }];

        var service = {
            search: search
        };

        return service;

        /////

        // function search(zipcode) {
        //     return gyms.filter(function (gym) {
        //         return (zipcode == gym.zipcode);
        //     });
        // }

        function search(zipcode) {
            var d = $q.defer();

            var clientID = 'DOK4YLYQILB5L5L0Y24ZNTUISHGCR3YNVTHEMF2E0DPQO53Y',
                clientSecret = 'TLV3HAQLDY3MKNSQQKCPQ40BQAHD4TKDYAGTVPHRWGNSL3G1';
            $http.get(
                "https://api.foursquare.com/v2/venues/explore/?near=" +
                zipcode +
                "&venuePhotos=1&categoryId=4bf58dd8d48988d175941735" +
                "&client_id=" + clientID +
                "&client_secret=" + clientSecret +
                " &v=20131124"
            ).then(function(result, status) {
                var items = result.data.response.groups[0].items;

                var help = [];
                for (var el in items) {
                    var place = parseVenue(items[el]);
                    help.push(place);
                }

                d.resolve(help);
            }, function(data, status) {
                console.log(data, status);
                d.reject();
            });

            return d.promise;
        }

        function parseVenue(data) {
            var venue = data.venue;
            var price = '$';

            if (venue.price) {
                var value = venue.price.tier;
                while (value > 1) {
                    price += '$';
                    value--;
                }
            } else {
                price = '';
            }

            var rating = Math.round(venue.rating) / 2.0;
            var plus = [];
            var minus = [];
            for (var i in [0, 1, 2, 3, 4]) {
                if (rating > 0.5) {
                    rating--;
                    plus.push(i);
                } else {
                    minus.push(i);
                }
            }

            var picture_url = '';
            try {
                picture_url = venue.photos.groups[0].items[0].prefix + '100x100' + venue.photos.groups[0].items[0].suffix;
            } catch (e) {
                console.log(e);
            }

            return {
                name: venue.name,
                plus: plus,
                minus: minus,
                venueID: venue.id,
                picture_url: picture_url,
                reviews: venue.ratingSignals + ' reviews',
                price: price,
                place: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
                category: venue.categories[0].name
            };
        };
    });
