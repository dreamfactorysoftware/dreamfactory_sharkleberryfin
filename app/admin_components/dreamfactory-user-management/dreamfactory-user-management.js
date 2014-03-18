'use strict';


angular.module('dfUserManagement', ['ngRoute', 'ngCookies', 'ngDreamFactory'])
    .constant('MODUSRMNGR_ROUTER_PATH', '/user-management')
    .constant('MODUSRMNGR_ASSET_PATH', 'admin_components/dreamfactory-user-management/')
    .config(['$routeProvider', 'MODUSRMNGR_ROUTER_PATH', 'MODUSRMNGR_ASSET_PATH',
        function ($routeProvider, MODUSRMNGR_ROUTER_PATH, MODUSRMNGR_ASSET_PATH) {

            $routeProvider
                .when(MODUSRMNGR_ROUTER_PATH, {
                    templateUrl: MODUSRMNGR_ASSET_PATH + 'views/main.html'
                })
                .when(MODUSRMNGR_ROUTER_PATH + '/logout/:path1?/:path2?/:path3?', {
                    resolve: {

                        logout: ['$rootScope', '$route', '$location', '$http', '$cookies', 'DreamFactory', 'userEventsService', 'userDataService',
                            function ($rootScope, $route, $location, $http, $cookies, DreamFactory, userEventsService, userDataService) {

                                function changeRouteFunc(paramsObj) {

                                    paramsObj = paramsObj || {}

                                    if (paramsObj) {

                                        var path = '';

                                        angular.forEach(paramsObj, function (value, key) {
                                            path += '/' + value;
                                        })
                                    } else {

                                        path = '/';
                                    }

                                    $location.url(path);
                                }


                                console.log('logout route');

                                DreamFactory.api.user.logout({},
                                    function (data) {

                                        console.log('Logout Successful');
                                        $rootScope.$broadcast(userEventsService.logoutSuccess);
                                        userDataService.unsetCurrentUser();
                                        $cookies.PHPSESSID = '';
                                        changeRouteFunc($route.current.params);

                                    },
                                    function (error) {

                                        console.log('Logout Error');
                                        $rootScope.$broadcast(userEventsService.logoutError);
                                    })
                            }]
                    }
                })
        }])
    .run(['$cookies', '$http', function($cookies, $http) {


        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.PHPSESSID;

    }])
    .controller('UserManagementCtrl', ['$scope', function ($scope) {


    }])
    .directive('modusrmngrNavigation', ['MODUSRMNGR_ASSET_PATH',
        function (MODUSRMNGR_ASSET_PATH) {

            return {
                restrict: 'E',
                templateUrl: MODUSRMNGR_ASSET_PATH + 'views/navigation.html',
                link: function (scope, elem, attrs) {

                }
            }
        }])
    .directive('userManagement', ['MODUSRMNGR_ASSET_PATH', 'DreamFactory', 'userDataService',
        function (MODUSRMNGR_ASSET_PATH, DreamFactory, userDataService) {

            return {
                restrict: 'E',
                controller: function ($scope) {

                    $scope.activeView = 'profile';


                    $scope.changeView = function (viewIdStr) {

                        $scope.$broadcast('view:change:view', viewIdStr);
                    };


                    $scope.$on('view:changed', function (e, viewIdStr) {

                        $scope.activeView = viewIdStr;
                    });

                },
                templateUrl: MODUSRMNGR_ASSET_PATH + 'views/user-management.html',
                link: function (scope, elem, attrs) {


                }
            }
        }])
    .directive('userProfile', ['MODUSRMNGR_ASSET_PATH',
        function (MODUSRMNGR_ASSET_PATH) {

            return {

                restrict: 'E',
                scope: {},
                templateUrl: MODUSRMNGR_ASSET_PATH + 'views/edit-profile.html',
                link: function (scope, elem, attrs) {

                    scope.active = true;
                    scope.id = 'profile';


                    scope.$on('view:change:view', function (e, viewIdStr) {

                        if (viewIdStr === scope.id) {
                            scope.active = true;
                            scope.$broadcast('view:changed', scope.id);
                        } else {
                            scope.active = false;
                        }
                    });
                }
            }
        }])
    .directive('userPassword', ['MODUSRMNGR_ASSET_PATH',
        function (MODUSRMNGR_ASSET_PATH) {

            return {

                restrict: 'E',
                scope: {},
                templateUrl: MODUSRMNGR_ASSET_PATH + 'views/edit-password.html',
                link: function (scope, elem, attrs) {

                    scope.active = false;
                    scope.id = 'password';


                    scope.$on('view:change:view', function (e, viewIdStr) {

                        if (viewIdStr === scope.id) {
                            scope.active = true;
                            scope.$broadcast('view:changed', scope.id);
                        } else {
                            scope.active = false;
                        }
                    });
                }
            }
        }])
    .directive('userLogin', ['MODUSRMNGR_ASSET_PATH', 'DreamFactory', 'userDataService', '$http', '$cookies', 'userEventsService',
        function (MODUSRMNGR_ASSET_PATH, DreamFactory, userDataService, $http, $cookies, userEventsService) {

            return {

                restrict: 'E',
                scope: {},
                templateUrl: MODUSRMNGR_ASSET_PATH + 'views/login.html',
                link: function (scope, elem, attrs) {

                    // Vars
                    scope.creds = {
                        email: '',
                        password: ''
                    };

                    // Public API
                    scope.login = function (creds) {

                        scope.$broadcast('user:login', creds)
                    };

                    // Private API


                    // Handle Messages
                    scope.$on('user:login', function (e, creds) {

                        function setSessionToken(data) {

                            return $cookies.PHPSESSID ? $cookies.PHPSESSID : data.session_id;

                        }

                        function setCookies(data) {

                            $cookies.PHPSESSID = $cookies.PHPSESSID === data.session_id ? $cookies.PHPSESSID : data.session_id;
                        }


                        var request = {
                            body: creds
                        };

                        DreamFactory.api.user.login(request,
                            function (data) {

                                console.log('Login Success');
                                userDataService.setCurrentUser(data);
                                setCookies(data);
                                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = setSessionToken(data);
                                $http.defaults.headers.common['X-DreamFactory-Application-Name'] = 'admin';
                                scope.$emit(userEventsService.loginSuccess, data)
                            },
                            function (error) {

                                console.log('Login Error');
                                scope.$emit(userEventsService.loginError, error);

                            })
                    });
                }
            }
        }])
    .directive('userLogout', ['$http', '$cookies', 'userEventsService', 'userDataService', 'DreamFactory',
        function ($http, $cookies, userEventsService, userDataService, DreamFactory) {
            return {

                restrict: 'E',
                scope: {},
                link: function (scope, elem, attrs) {
                    scope.$on('user:logout', function (e) {
                        DreamFactory.api.user.logout({},
                            function (data) {
                                scope.$emit(userEventsService.logoutSuccess);
                                $cookies.PHPSESSID = '';
                                userDataService.unsetCurrentUser();
                                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = '';

                            },
                            function (error) {
                                scope.$emit(userEventsService.logoutError, error);
                            }
                        )
                    });
                }
            }
        }])
    .service('userDataService', [function () {

        var currentUser = {};


        function _getCurrentUser() {

            console.log(currentUser);
            return currentUser;
        }

        function _setCurrentUser(userDataObj) {

            currentUser = userDataObj;
            console.log(currentUser);
        }

        function _unsetCurrentUser() {

            currentUser = {};
            console.log(currentUser)
        }


        return {

            getCurrentUser: function () {

                return _getCurrentUser();
            },

            setCurrentUser: function (userDataObj) {

                _setCurrentUser(userDataObj);
            },

            unsetCurrentUser: function () {

                _unsetCurrentUser();
            }
        }
    }])
    .service('userEventsService', [function () {

        return {
            login: 'user:login',
            loginSuccess: 'user:login:success',
            loginError: 'user:login:error',
            logout: 'user:logout',
            logoutSuccess: 'user:logout:success',
            logoutError: 'user:logout:error'
        }
    }]);




