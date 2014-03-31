'use strict';


angular.module('dfAccessManagement', ['ngRoute', 'ngDreamFactory', 'ngAnimate'])
    .constant('MODAUTH_ROUTER_PATH', '/access-management')
    .constant('MODAUTH_ASSET_PATH', 'admin_components/dreamfactory-access-management/')
    .config(['$routeProvider', 'MODAUTH_ROUTER_PATH', 'MODAUTH_ASSET_PATH',
        function ($routeProvider, MODAUTH_ROUTER_PATH, MODAUTH_ASSET_PATH) {
            $routeProvider
                .when(MODAUTH_ROUTER_PATH, {
                    templateUrl: MODAUTH_ASSET_PATH + 'views/main.html',
                    controller: 'AccessManagementCtrl'
                });
        }])
    .controller('AccessManagementCtrl', ['$scope', '$q', 'DreamFactory', function ($scope, $q, DreamFactory) {

        // TODO: Filter out current user  Probably need to store a reference to the current user on the main app scope
    }])
    .directive('modaccessNavigation', ['MODAUTH_ASSET_PATH',
        function (MODAUTH_ASSET_PATH) {

            return {
                restrict: 'E',
                require: '^accessManagement',
                templateUrl: MODAUTH_ASSET_PATH + 'views/navigation.html'
            }
        }])

    .directive('accessManagement', ['DSP_URL', 'MODAUTH_ASSET_PATH', '$http', '$q', 'DreamFactory', 'accessManagementEventsService', 'accessManagementRulesService',
        function (DSP_URL, MODAUTH_ASSET_PATH, $http, $q, DreamFactory, accessManagementEventsService, accessManagementRulesService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/access-management.html',
                scope: {},
                controller: function ($scope) {


                    $scope.viewUsersMasterActive = true;
                    $scope.viewRolesMasterActive = false;
                    $scope.viewAssignMasterActive = false;
                    $scope.viewConfigMasterActive = false;
                    
                    $scope.toggleModuleNavigationBool = true;

                    $scope.roles = [];
                    $scope.users = [];
                    $scope.apps = [];
                    $scope.services = [];


                    // Create a short name
                    $scope.es = accessManagementEventsService.module;
                    $scope.rs = accessManagementRulesService;


                    // INIT DEF
                    $scope.init = function () {
                        if (DreamFactory.isReady()) {
                            $scope._getRoles();
                            $scope._getUsers();
                            $scope._getApps();
                            $scope._getServices();
                        }
                    };


                    // PUBLIC API
                    $scope.openUsersMaster = function () {

                        $scope._openUsersMaster();
                    };

                    $scope.openRolesMaster = function () {

                        $scope._openRolesMaster();
                    };

                    $scope.openAssignMaster = function () {

                        $scope._openAssignMaster();
                    };

                    $scope.openConfigMaster = function () {

                        $scope._openConfigMaster();
                    };


                    // PRIVATE API
                    $scope._toggleViewUsersMaster = function (stateBool) {
                        
                        $scope.viewUsersMasterActive = stateBool;
                    };

                    $scope._toggleViewRolesMaster = function (stateBool) {

                        $scope.viewRolesMasterActive = stateBool;
                    };

                    $scope._toggleViewAssignMaster = function (stateBool) {

                        $scope.viewAssignMasterActive = stateBool;
                    };

                    $scope._toggleViewConfigMaster = function (stateBool) {

                        $scope.viewConfigMasterActive = stateBool;
                    };

                    $scope._toggleViewUsersMasterActive = function () {

                        $scope._toggleViewUsersMaster(true);
                        $scope._toggleViewRolesMaster(false);
                        $scope._toggleViewAssignMaster(false);
                        $scope._toggleViewConfigMaster(false);
                    };

                    $scope._toggleViewRolesMasterActive = function () {

                        $scope._toggleViewRolesMaster(true);
                        $scope._toggleViewUsersMaster(false);
                        $scope._toggleViewAssignMaster(false);
                        $scope._toggleViewConfigMaster(false);
                    };

                    $scope._toggleViewAssignMasterActive = function () {

                        $scope._toggleViewAssignMaster(true);
                        $scope._toggleViewUsersMaster(false);
                        $scope._toggleViewRolesMaster(false);
                        $scope._toggleViewConfigMaster(false);
                    };

                    $scope._toggleViewConfigMasterActive = function () {

                        $scope._toggleViewConfigMaster(true);
                        $scope._toggleViewUsersMaster(false);
                        $scope._toggleViewRolesMaster(false);
                        $scope._toggleViewAssignMaster(false);
                    };

                    $scope._toggleModuleNavigation = function () {

                        $scope.toggleModuleNavigationBool = !$scope.toggleModuleNavigationBool;
                    };

                    $scope._toggleEachRecord = function (recordsArr, stateBool) {

                        angular.forEach(recordsArr, function(obj) {
                            obj.dfUISelected = stateBool;
                        })
                    };

                    $scope._addSelectedProperty = function (recordObj) {

                        recordObj['dfUISelected'] = false;
                    };

                    $scope._addUnsavedProperty = function (recordObj) {

                        recordObj['dfUIUnsaved'] = false;
                    };

                    $scope._addUIProperties = function (records) {


                        if (records instanceof Array) {
                            angular.forEach(records, function (obj) {

                                $scope._addSelectedProperty(obj);
                                $scope._addUnsavedProperty(obj);
                            });
                        } else if (records instanceof Object) {

                            $scope._addSelectedProperty(records);
                            $scope._addUnsavedProperty(records);
                        }

                        return records;
                    };

                    $scope._getRolesData = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {
                            fields: '*',
                            limit: $scope.rs.recordsLimit,
                            related: 'role_service_accesses,role_system_accesses'
                        };

                        DreamFactory.api.system.getRoles(requestObj,
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };

                    $scope._getUsersData = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {
                            fields: '*',
                            limit: $scope.rs.recordsLimit
                        };

                        DreamFactory.api.system.getUsers(requestObj,
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };

                    $scope._getAppsData = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {};

                        DreamFactory.api.system.getApps(requestObj,
                            function (data) {
                                defer.resolve(data);
                            },
                            function (error) {
                                defer.resolve(error);
                            });


                        return defer.promise;
                    };

                    $scope._getServicesData = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {};

                        DreamFactory.api.system.getServices(requestObj,
                        function (data) {

                            defer.resolve(data);
                        },
                        function (error) {

                            defer.resolve(error);
                        });

                        return defer.promise;
                    };

                    $scope._getServiceComponents = function(serviceDataObj) {

                        if (!serviceDataObj) {
                            throw 'AccessManagement Module Error: No Service Data Object Defined'
                        }

                        return $http.get(DSP_URL + '/rest/' + serviceDataObj.api_name + '/?app_name=admin&fields=*');
                    };

                    $scope._addStarDesignationForAllOptions = function () {

                        return {id: 0, name: "*", type: ""};
                    }




                    // COMPLEX IMPLEMENTATION
                    $scope._getRoles = function () {

                        $scope._getRolesData().then(
                            function (result) {
                                $scope.roles = $scope._addUIProperties(result.record);
                            },
                            function (reject) {
                                throw 'AccessManagement Module Error: ' + reject.error[0].message
                            });
                    };

                    $scope._getUsers = function () {

                        $scope._getUsersData().then(
                            function (result) {
                                $scope.users = $scope._addUIProperties(result.record);
                            },
                            function (reject) {
                                throw 'AccessManagement Module Error: ' + reject.error[0].message
                            });
                    };

                    $scope._getApps = function () {

                        $scope._getAppsData().then(
                            function (result) {
                                $scope.apps = $scope._addUIProperties(result.record);
                            },
                            function (reject) {

                                // TODO: AppService doesn't return an error
                                throw 'AccessManagement Module Error: ' + reject.error[0].message
                            });
                    };

                    $scope._getServices = function () {

                        $scope._getServicesData().then(
                            function (result) {

                                $scope.services = result.record;

                                if ($scope.services.length > 0) {
                                    angular.forEach($scope.services, function(obj) {

                                        $scope._getServiceComponents(obj).then(
                                            function(scResult) {

                                                if (scResult.data.resource) {
                                                    scResult.data.resource.unshift($scope._addStarDesignationForAllOptions());
                                                }


                                                obj['components'] = scResult

                                            },
                                            function(scReject) {

                                                console.log(scReject);

                                                //throw 'AccessManagement Module Error: ' + scReject.error[0].message
                                            }
                                        );
                                    });
                                }

                                $scope.services.unshift($scope._addStarDesignationForAllOptions());

                                var firstService = $scope.services[0];
                                firstService['components'] = {
                                    config: {},
                                    data: {
                                        resource:[]
                                    }
                                };

                                firstService.components.data.resource = $scope._addStarDesignationForAllOptions();

                            },
                            function (reject) {

                                throw 'AccessManagement Module Error: ' + reject.error[0].message
                            }
                        );
                    }

                    $scope._openUsersMaster = function () {

                        $scope._toggleViewUsersMasterActive();
                        $scope.toggleModuleNavigationBool = true;
                    };

                    $scope._openRolesMaster = function () {

                        $scope._toggleViewRolesMasterActive();
                        $scope.toggleModuleNavigationBool = true;
                    };

                    $scope._openAssignMaster= function () {

                        $scope._toggleViewAssignMasterActive();
                        $scope.toggleModuleNavigationBool = true;
                    };

                    $scope._openConfigMaster = function () {

                        $scope._toggleViewConfigMasterActive();
                        $scope.toggleModuleNavigationBool = true;
                    };



                    // HANDLE MESSAGES
                    $scope.$on('api:ready', function (e) {
                        $scope.init();
                    });

                    $scope.$on($scope.es.openModuleNavigation, function (e) {

                        $scope._toggleModuleNavigation();
                    });

                    $scope.$on(accessManagementEventsService.assignUserRoleEvents.assignRole, function (e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.saveUsers, usersDataArr);
                    });

                    $scope.$on(accessManagementEventsService.assignUserRoleEvents.unassignRole, function (e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.saveUsers, usersDataArr);
                    });

                    $scope.$on(accessManagementEventsService.assignUserRoleEvents.removeRoleUsers, function (e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.removeUsers, usersDataArr);
                    });


                    // WATCHERS AND INIT
                    $scope.init();


                }
            }
        }])

    .directive('usersMaster', ['$q', '$http', 'DSP_URL', 'MODAUTH_ASSET_PATH', 'DreamFactory', 'accessManagementRulesService', 'accessManagementEventsService',
        function ($q, $http, DSP_URL, MODAUTH_ASSET_PATH, DreamFactory, accessManagementRulesService, accessManagementEventsService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/users-master.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    // Create a shortname
                    scope.es = accessManagementEventsService.usersEvents;

                    // PUBLIC VARS
                    scope.active = true;

                    scope.viewUsersListActive = true;
                    scope.viewCreateUserActive = false;


                    scope.id = 'users';
                    scope.toggleAllUsersBool = false;
                    scope.limit = accessManagementRulesService.recordsLimit;
                    scope.topLevelNavigation = true;
                    scope.newUser = {};


                    // PUBLIC API
                    scope.openModuleNavigation = function () {

                        scope.$emit(accessManagementEventsService.module.openModuleNavigation);
                    };

                    scope.removeUsers = function () {

                        // @TODO Add Confirm Delete Code
                        scope._removeUsers();
                    };

                    scope.toggleAllUsers = function () {

                        scope._toggleAllUsers();
                    };

                    scope.saveAllUsers = function () {

                        scope._saveUsers();
                    };

                    scope.revertAllUsers = function () {

                        scope._revertAllUsers();
                    };

                    scope.createUser = function () {

                        scope._createUser();
                    };

                    scope.exportUsers = function () {

                        scope._exportUsers();
                    };

                    scope.importUsers = function () {

                        scope._importUsers();
                    };


                    //PRIVATE API
                    scope._toggleViewUsersList = function (stateBool) {

                        scope.viewUsersListActive = stateBool;
                    };

                    scope._toggleViewCreateUser = function (stateBool) {

                        scope.viewCreateUserActive = stateBool;
                    };

                    scope._toggleViewUsersListActive = function () {

                        scope._toggleViewUsersList(true);
                        scope._toggleViewCreateUser(false);
                    };

                    scope._toggleViewCreateUsersActive = function () {

                        scope._toggleViewCreateUser(true);
                        scope._toggleViewUsersList(false);
                    };

                    scope._removeUsersFromSystem = function (usersDataArr) {

                        var idsForRemoval = [],
                            objsForRemoval = [];


                        angular.forEach(usersDataArr, function (value, index) {

                            if (value.dfUISelected) {

                                if (value.is_sys_admin && accessManagementRulesService.allowMassAdminUserDeletion) {

                                    objsForRemoval.push(value);
                                    idsForRemoval.push(value.id);

                                } else if (!value.is_sys_admin) {

                                    objsForRemoval.push(value);
                                    idsForRemoval.push(value.id);

                                }
                            }
                        });


                        // Short Circuit: Nothing to delete.
                        if (idsForRemoval.length === 0) {
                            throw 'AccessManagement Users Error: No users selected for removal.'
                        }


                        var defer = $q.defer();

                        var requestObj = {
                            ids: idsForRemoval.join(','),
                            fields: '*',
                            related: null
                        };

                        DreamFactory.api.system.deleteUsers(
                            requestObj,
                            function (data) {
                                defer.resolve(data);
                            },
                            function (error) {
                                defer.reject(error)
                            });


                        return defer.promise;
                    };

                    scope._removeUsersData = function (userDataObj) {

                        angular.forEach(scope.users, function (obj, index) {

                            if (obj.id === userDataObj.id) {
                                delete scope.users[index];
                                scope.users.splice(index, 1)
                            }
                        });
                    };

                    scope._saveUsersToSystem = function (usersDataArr) {

                        var objsToSave = [];

                        angular.forEach(usersDataArr, function (obj) {

                            if (obj.dfUIUnsaved) {

                                objsToSave.push(obj);
                            }
                        });

                        if (objsToSave.length == 0) {
                            throw 'AccessManagement Users Error: No users selected for save.'
                        }

                        var defer = $q.defer();

                        var requestObj = {
                            body: {
                                record: objsToSave
                            }
                        };

                        DreamFactory.api.system.updateUsers(
                            requestObj,
                            function (data) {
                                defer.resolve(data);
                            },
                            function (error) {
                                defer.resolve(error)
                            }
                        );

                        return defer.promise
                    };

                    scope._addUser = function (userDataObj) {

                        scope.users.unshift(userDataObj);
                    };

                    scope._createUserModel = function () {

                        return {
                            id: null,
                            created_date: null,
                            created_by_id: null,
                            last_modified_date: null,
                            last_modified_by_id: null,
                            display_name: null,
                            first_name: null,
                            last_name: null,
                            email: null,
                            phone: null,
                            confirmed: false,
                            is_active: false,
                            is_sys_admin: false,
                            role_id: null,
                            default_app_id: null,
                            user_source: 0,
                            user_data: []
                        }
                    };

                    scope._resetUserInArray = function (userDataObj) {

                        angular.forEach(scope.users, function (obj, index) {
                            if (obj.id === userDataObj.id) {
                                scope.users.splice(index, 1);
                            }
                        });

                        scope.users.unshift(userDataObj);
                    };

                    // TODO: Fix Export downloading of zip file
                    scope._exportUsersData = function () {

                        $http.get(DSP_URL + '/rest/system/user?app_name=admin&file=jimmy.csv&format=csv&download=true',
                            function (data) {

                            },
                            function (error) {

                            }
                        )


                    };

                    // TODO: Add User Import
                    scope._importUsersData = function () {
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._removeUsers = function (usersDataArr) {

                        usersDataArr = usersDataArr || scope.users;

                        scope._removeUsersFromSystem(usersDataArr).then(
                            function (result) {
                                angular.forEach(result.record, function (userDataObj) {
                                    scope._removeUsersData(userDataObj)
                                });
                                scope.$emit(scope.es.removeUsersSuccess);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'AccessManagement Users Request Error: ' + reject.error[0].message;
                            }
                        )
                    };

                    scope._toggleAllUsers = function () {

                        scope.toggleAllUsersBool = !scope.toggleAllUsersBool;
                        scope._toggleEachRecord(scope.users, scope.toggleAllUsersBool);
                    };

                    scope._saveUsers = function (usersDataArr) {

                        usersDataArr = usersDataArr || scope.users;


                        // Save all users to the remote system
                        scope._saveUsersToSystem(usersDataArr).then(
                            function (result) {

                                angular.forEach(result.record, function (userDataObj) {
                                    scope._resetUserInArray(userDataObj);
                                })
                            },
                            function (reject) {

                                console.log(reject);
                                throw 'AccessManagement Users Request Error: ' + reject.error[0].message
                            }
                        );
                    };

                    scope._revertAllUsers = function (usersDataArr) {

                        usersDataArr = usersDataArr || scope.users;

                        angular.forEach(usersDataArr, function(obj) {

                            if (obj.dfUIUnsaved && obj.userCopy) {

                                var userCopy = obj.userCopy;

                                for (var key in obj) {
                                    if(obj.hasOwnProperty(key)) {
                                        obj[key] = userCopy[key]
                                    }
                                }
                            }

                            if (obj.dfUIUnsaved) {
                                obj.dfUIUnsaved = false;
                            }

                            delete obj.userCopy;
                        });
                    };

                    scope._createUser = function () {

                        scope._toggleViewCreateUsersActive();
                        scope.newUser = angular.copy(scope._createUserModel());
                        scope.topLevelNavigation = false;
                    };

                    // Part of fix export
                    scope._exportUsers = function () {
                        console.log('Export Users');
                        // scope._exportUsersData()
                    };

                    // Part of user import
                    scope._importUsers = function () {
                        console.log('Import Users');
                        // scope._importUsersData()
                    };


                    // HANDLE EVENTS
                    scope.$on('view:change:view', function (e, viewIdStr) {

                        if (viewIdStr === scope.id) {
                            scope.active = true;
                            scope.$emit('view:changed', scope.id);
                        } else {
                            scope.active = false;
                        }
                    });


                    // handle events broadcasted from parent
                    scope.$on(scope.es.saveUsers, function (e, usersDataObj) {

                        scope._saveUsers(usersDataObj);
                    });

                    scope.$on(scope.es.removeUsers, function(e, usersDataArr) {

                        console.log(usersDataArr);

                        scope._removeUsers(usersDataArr);
                    });



                    // Handle events emitted from children
                    scope.$on(accessManagementEventsService.userEvents.openUserSuccess, function (e) {

                        scope.topLevelNavigation = false;
                    });

                    scope.$on(accessManagementEventsService.userEvents.closeUserSuccess, function (e) {

                        scope.topLevelNavigation = true;
                    });

                    scope.$on(accessManagementEventsService.userEvents.removeUserSuccess, function (e, userDataObj) {

                        scope._removeUsersData(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.userEvents.saveUserSuccess, function (e, userDataObj) {

                        scope._resetUserInArray(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.userEvents.revertUserSuccess, function (e, userDataObj) {


                    });

                    scope.$on(accessManagementEventsService.userEvents.closeUserSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope._toggleViewUsersListActive();
                    });

                    scope.$on(accessManagementEventsService.userEvents.createUserSuccess, function (e, userDataObj) {

                        scope._addUIProperties(userDataObj);
                        scope._addUser(userDataObj);
                    });




                    // WATCHERS AND INITIALIZATION


                }
            }
        }])
    .directive('usersList', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService',
        function(MODAUTH_ASSET_PATH, accessManagementEventsService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/users-list.html',
                scope: true,
                link: function(scope, elem, attrs) {

                    scope.usersListActive = true;
                    scope.userDetailActive = false;
                    scope.selectedUser = null;

                    scope.filter = {
                        userViewBy: 'email',
                        userProp: 'email',
                        userValue: null,
                        userOrderBy: 'email',
                        userOrderByReverse: false
                    };


                    //PUBLIC API
                    scope.openUserRecord = function (userDataObj) {

                        scope._openUserRecord(userDataObj);
                    };

                    /**
                     * Interface for selecting a record
                     */
                    scope.selectUser = function (userDataObj) {

                        // Call complex implementation
                        scope._selectUser(userDataObj);
                    };



                    // PRIVATE API

                    /**
                     * Toggle dfUISelected property on scope.user
                     *
                     * @private
                     */
                    scope._setUserSelected = function (userDataObj) {

                        userDataObj.dfUISelected = !userDataObj.dfUISelected;
                    };

                    scope._toggleUsersList = function (stateBool) {

                        scope.usersListActive = stateBool;
                    };

                    scope._toggleUserDetail = function (stateBool) {

                        scope.userDetailActive = stateBool;
                    };

                    scope._toggleListActive = function () {

                        scope._toggleUsersList(true);
                        scope._toggleUserDetail(false);

                    };

                    scope._toggleDetailActive = function () {

                        scope._toggleUserDetail(true);
                        scope._toggleUsersList(false)
                    };

                    scope._setSelectedUser = function (userDataObj) {

                        scope.selectedUser = userDataObj
                    };



                    // COMPLEX IMPLEMENTATION
                    scope._openUserRecord = function (userDataObj) {

                        scope._toggleDetailActive();
                        scope._setSelectedUser(userDataObj);
                    };

                    scope._closeUserRecord = function () {

                        scope._toggleListActive();
                    };

                    /**
                     * Selects record
                     *
                     * @emit selectUserSuccess
                     * @private
                     */
                    scope._selectUser = function (userDataObj) {

                        scope._setUserSelected(userDataObj);
                        scope.$emit(scope.es.selectUserSuccess)
                    };


                    // HANDLE EVENTS
                    scope.$on(accessManagementEventsService.userEvents.closeUserSuccess, function (e) {

                        scope._closeUserRecord();
                    });


                }
            }
    }])
    .directive('userListItem', ['MODAUTH_ASSET_PATH', function(MODAUTH_ASSET_LIST) {
        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_LIST + 'views/user-list-item.html',
            scope: true,
            link: function(scope, elem, attrs) {


                // PUBLIC API
                /**
                 * Interface for selecting a record
                 */
                scope.selectUser = function () {

                    // Call complex implementation
                    scope._selectUser();
                };


                // PRIVATE API
                /**
                 * Toggle dfUISelected property on scope.user
                 *
                 * @private
                 */
                scope._setUserSelected = function () {

                    scope.user.dfUISelected = !scope.user.dfUISelected;
                };


                // COMPLEX IMPLEMENTATION
                /**
                 * Selects record
                 *
                 * @emit selectUserSuccess
                 * @private
                 */
                scope._selectUser = function () {

                    scope._setUserSelected();
                    scope.$emit(scope.es.selectUserSuccess)
                };


                // WATCHERS AND INIT


            }
        }
    }])
    .directive('userItemDetail', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', '$q', 'DreamFactory',
        function(MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, $q, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/user-item-detail.html',
                scope: {
                    user: '=',
                    roles: '=',
                    apps: '='

                },
                link: function(scope, elem, attrs) {


                    /**
                     * Short name for accessManagementEventsService.recordEvents
                     * @type {service}
                     */
                    scope.es = accessManagementEventsService.userEvents;

                    /**
                     * Stores a copy of the role for the revert function
                     * @type {object}
                     */
                    scope.userCopy = {};

                    /**
                     * Store the form name
                     * @type {string}
                     */
                    scope.formName = 'user-edit';




                    // PUBLIC API
                    /*
                     The Public Api section is meant to interact with the template.
                     Each function calls it's private complement to actually do the work.
                     It's a little bit more overhead but we get a few things out of it.
                     1. We have a clean interface with an underlying implementation that can be changed easily
                     2. We can setup hooks for pre and post processing if we choose to.
                     */


                    /**
                     * Interface for closing a record
                     */
                    scope.closeUser = function () {

                        // Call complex implementation
                        scope._closeUser();
                    };

                    /**
                     * Interface for saving a record
                     */
                    scope.saveUser = function () {

                        // Call complex implementation
                        scope._saveUser();
                    };

                    /**
                     * Interface for removing a record
                     */
                    scope.removeUser = function () {

                        // Call complex implementation
                        scope._confirmRemoveUser() ? scope._removeUser() : false;
                    };

                    /**
                     * Interface for reverting a record
                     */
                    scope.revertUser = function () {

                        // Call complex implementation
                        scope._revertUser();
                    };



                    // PRIVATE API
                    /*
                     The Private Api is where we create small targeted functions to be used in the Complex
                     Implementations section
                     */

                    /**
                     * Creates a request object to pass to DreamFactory SDK functions
                     *
                     * @param requestDataObj
                     * @param fieldsDataStr
                     * @param relatedDataStr
                     * @returns {{id: (null|creds.id|test.id|id|internals.credentials.dh37fgj492je.id|locals.id|*), body: *, fields: (fields|*|null), related: (*|null)}}
                     * @private
                     */
                    scope._makeRequest = function (requestDataObj, fieldsDataStr, relatedDataStr) {

                        var fields = fields || null,
                            related = related || null;


                        return {
                            id: requestDataObj.id,
                            body: requestDataObj,
                            fields: fields,
                            related: related
                        }
                    };

                    /**
                     * Wrapper for DreamFactory SDK updateUser function
                     *
                     * @param userDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._saveUserToSystem = function (userDataObj) {

                        var defer = $q.defer();

                        DreamFactory.api.system.updateUser(
                            scope._makeRequest(userDataObj, '*'),
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };

                    /**
                     * Wrapper for DreamFactory SDK deleteUser function
                     *
                     * @param userDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._removeUserFromSystem = function (userDataObj) {

                        var defer = $q.defer();

                        DreamFactory.api.system.deleteUser(
                            scope._makeRequest(userDataObj, '*'),
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;

                    };

                    /**
                     * Get config auto close value
                     *
                     * @returns {boolean}
                     * @private
                     */
                    scope._checkAutoClose = function () {

                        return accessManagementRulesService.autoCloseUserDetail;
                    };

                    /**
                     * Check for unsaved changes.
                     * Sets scope.role.dfUIUnsaved
                     *
                     * @private
                     */
                    scope._checkUnsavedChanges = function () {

                        if (scope[scope.formName].$dirty) {

                            scope.user.dfUIUnsaved = true;
                            scope.user['userCopy'] = scope._copyUser(scope.userCopy);
                        } else {

                            scope.user.dfUIUnsaved = false;
                            if (scope.user['userCopy']) {
                                delete scope.user.userCopy;
                            }
                        }
                    };

                    /**
                     * Create an angular copy
                     *
                     * @param userDataObj
                     * @returns {userDataObj}
                     * @private
                     */
                    scope._copyUser = function (userDataObj) {

                        return angular.copy(userDataObj);
                    };

                    /**
                     * Set the edit user form to a pristine state
                     * @private
                     */
                    scope._setFormPristine = function () {

                        scope[scope.formName].$setPristine();
                    };

                    /**
                     * Set the edit user form to a dirty state
                     * @private
                     */
                    scope._setFormDirty = function () {

                        scope[scope.formName].$setDirty();
                    };

                    /**
                     * Set form state based on user saved status
                     * @param userDataObj
                     * @private
                     */
                    scope._setFormState = function (userDataObj) {

                        userDataObj.dfUIUnsaved ? scope._setFormDirty() : scope._setFormPristine();
                    };

                    /**
                     * Sets the local scope.user and scope.userCopy to null
                     * @private
                     */
                    scope._setLocalUserNull = function () {

                        // Set the current user to null this way if we select the
                        // same user again it will trigger the watcher
                        scope.user = null;

                        // Set the current user copy to null
                        scope.userCopy = null;
                    };

                    /**
                     * Confirm User removal from system
                     * @returns {bool}
                     * @private
                     */
                    scope._confirmRemoveUser = function () {

                        return confirm('Remove ' + scope.user.display_name + '?');
                    };

                    /**
                     * Sets the current user to the most recent copy of itself
                     *
                     * @private
                     */
                    scope._revertUserData = function () {

                        for(var key in scope.userCopy) {
                            if (scope.user.hasOwnProperty(key)) {
                                scope.user[key] = scope.userCopy[key];
                            }
                        }
                    };

                    /**
                     * Determines what user data to use as copy for reversion
                     */
                    scope._setUserCopy = function (userDataObj) {

                        if (userDataObj.userCopy) {
                            scope.userCopy = scope._copyUser(userDataObj.userCopy);
                        }else {
                            scope.userCopy = scope._copyUser(userDataObj);
                        }
                    };




                    // COMPLEX IMPLEMENTATION

                    /**
                     * Some init for the open record
                     *
                     * @emit closeUserSucess
                     * @private
                     */
                    scope._openUser = function (userDataObj) {

                        scope._setFormState(userDataObj);
                        scope._setUserCopy(userDataObj);
                        scope.$emit(scope.es.openUserSuccess);
                    };


                    /**
                     * Closes record
                     *
                     * @emit closeUserSucess
                     * @private
                     */
                    scope._closeUser = function () {

                        // Check for unsaved changes on the model
                        scope._checkUnsavedChanges();

                        // Set the form clean for the next user
                        scope._setFormPristine();

                        // Reset the local user
                        scope._setLocalUserNull();

                        // Alert our parent to the fact that we're done with our
                        // closing routine
                        scope.$emit(scope.es.closeUserSuccess);
                    };

                    /**
                     * Saves the User record
                     *
                     * @throws AccessManagement User Error
                     * @private
                     */
                    scope._saveUser = function () {

                        scope._saveUserToSystem(scope.user).then(
                            function (result) {

                                scope[scope.formName].$setPristine();
                                scope.user = result;
                                scope.userCopy = scope._copyUser(result);

                                if (scope._checkAutoClose()) {
                                    scope.closeUser();
                                }

                                scope.$emit(scope.es.saveUserSuccess, result);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'Save User Failed'
                            }
                        );
                    };

                    /**
                     * Removes record
                     *
                     * @throws AccessManagement User Error
                     * @private
                     */
                    scope._removeUser = function () {

                        scope._removeUserFromSystem(scope.user).then(
                            function (result) {
                                scope.$emit(scope.es.removeUserSuccess, result);
                                scope.closeUser();
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'Remove User Failed'
                            }
                        );
                    };

                    /**
                     * Reverts record to first loaded or most recent saved state
                     *
                     * @private
                     */
                    scope._revertUser = function () {

                        scope._revertUserData();
                        scope[scope.formName].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.revertUserSuccess, scope.user);
                    };



                    // WATCHERS AND INIT
                    scope.$watch('user', function(newValue, oldValue) {

                        if (newValue) {
                            scope._openUser(newValue);
                        }
                    });

                }
            }
    }])
    .directive('createUser', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/create-user.html',
                scope: {
                    user: '=',
                    roles: '=',
                    apps: '='
                },
                link: function (scope, elem, attrs) {

                    scope.es = accessManagementEventsService.userEvents;


                    // PUBLIC API
                    scope.closeUser = function () {

                        scope._confirmUnsavedClose() ? scope._closeUser() : false;
                    };

                    scope.createUser = function () {

                        scope._createUser();
                    };


                    // PRIVATE API
                    scope._confirmUnsavedClose = function () {

                        if (scope['create-user'].$dirty) {
                            return confirm('Discard unsaved changes?');
                        } else {
                            return true;
                        }
                    };

                    scope._createUserOnSystem = function () {

                        var defer = $q.defer();

                        var requestObj = {
                            body: {
                                record: scope.user
                            },
                            fields: '*',
                            related: null
                        };

                        DreamFactory.api.system.createUsers(
                            requestObj,
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._closeUser = function () {

                        scope['create-user'].$setPristine();
                        scope.$emit(scope.es.closeUserSuccess);
                    };

                    scope._createUser = function () {

                        scope._createUserOnSystem().then(
                            function (result) {

                                scope['create-user'].$setPristine();
                                scope.$emit(scope.es.createUserSuccess, result.record[0]);
                                scope.closeUser();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.createUserError, error);
                            });
                    };


                    // HANDLE MESSAGES



                    // WATCHERS AND INIT

                }
            }
        }])

    .directive('rolesMaster', ['$q', 'MODAUTH_ASSET_PATH', 'DreamFactory', 'accessManagementRulesService', 'accessManagementEventsService',
        function ($q, MODAUTH_ASSET_PATH, DreamFactory, accessManagementRulesService, accessManagementEventsService) {

            return {
                restrict: 'E',
                require: '^accessManagement',
                scope: true,
                templateUrl: MODAUTH_ASSET_PATH + 'views/roles-master.html',
                link: function (scope, elem, attrs) {

                    // Create short names
                    scope.es = accessManagementEventsService.rolesEvents;

                    // PUBLIC VARS

                    scope.viewRolesListActive = true;
                    scope.viewCreateRoleActive = false;

                    scope.active = false;
                    scope.id = 'roles';
                    scope.toggleAllRolesBool = false;
                    scope.limit = accessManagementRulesService.recordsLimit;
                    scope.topLevelNavigation = true;
                    scope.newRole = {};


                    // PUBLIC API
                    scope._toggleViewRolesList = function (stateBool) {

                        scope.viewRolesListActive = stateBool;
                    };

                    scope._toggleViewCreateRole = function (stateBool) {

                        scope.viewCreateRoleActive = stateBool;
                    };

                    scope._toggleViewRolesListActive = function () {

                        scope._toggleViewRolesList(true);
                        scope._toggleViewCreateRole(false);
                    };

                    scope._toggleViewCreateRolesActive = function () {

                        scope._toggleViewCreateRole(true);
                        scope._toggleViewRolesList(false);
                    };
                    
                    scope.openModuleNavigation = function () {

                        scope.$emit(accessManagementEventsService.module.openModuleNavigation);
                    };

                    scope.createRole = function () {

                        scope._createRole();
                    };

                    scope.toggleAllRoles = function () {

                        scope._toggleAllRoles();
                    };

                    scope.saveAllRoles = function () {

                        scope._saveRoles();
                    };

                    scope.revertAllRoles = function () {

                        scope._revertAllRoles();
                    };

                    scope.removeRoles = function () {

                        if (scope._confirmRemoveRoles()) {
                            scope._removeRoles();
                        }

                    };

                    scope.exportRoles = function () {

                        scope._exportRoles();
                    };

                    scope.importRoles = function () {

                        scope._importRoles();
                    };


                    //PRIVATE API
                    scope._confirmRemoveRoles = function () {

                        return confirm('Are you sure you want to delete these roles?');
                    }

                    scope._createRoleModel = function () {

                        return {
                            id: null,
                            created_date: null,
                            created_by_id: null,
                            last_modified_date: null,
                            last_modified_by_id: null,
                            name: null,
                            is_active: true,
                            default_app_id: null,
                            newRole: true
                        }
                    };

                    scope._addRole = function (roleDataObj) {

                        scope.roles.unshift(roleDataObj);
                    };

                    scope._saveRolesToSystem = function (rolesDataArr) {

                        var objsToSave = [];

                        angular.forEach(rolesDataArr, function (obj) {

                            if (obj.dfUIUnsaved) {

                                objsToSave.push(obj);
                            }
                        });


                        if (objsToSave.length == 0) {
                            throw 'saveRolesToSystem Error: No roles selected for save.'
                        }

                        var defer = $q.defer();

                        var requestObj = {
                            body: {
                                record: objsToSave
                            }
                        };

                        DreamFactory.api.system.updateRoles(
                            requestObj,
                            function (data) {
                                defer.resolve(data);
                            },
                            function (error) {
                                defer.resolve(error)
                            }
                        );

                        return defer.promise
                    };

                    scope._resetRoleInArray = function (roleDataObj) {

                        angular.forEach(scope.roles, function (obj, index) {
                            if (obj.id === roleDataObj.id) {
                                scope.roles.splice(index, 1);
                            }
                        });

                        scope.roles.unshift(roleDataObj);
                    };

                    scope._removeRolesFromSystem = function (rolesDataArr) {

                        var idsForRemoval = [];


                        angular.forEach(rolesDataArr, function (value, index) {

                            if (value.dfUISelected) {

                                if (value.is_sys_admin && accessManagementRulesService.allowMassAdminUserDeletion) {

                                    idsForRemoval.push(value.id);

                                } else if (!value.is_sys_admin) {

                                    idsForRemoval.push(value.id);
                                }
                            }
                        });


                        // Short Circuit: Nothing to delete.
                        if (idsForRemoval.length === 0) {
                            throw 'AccessManagement Roles Error: No roles selected for removal.'
                        }

                        var defer = $q.defer();

                        var requestObj = {
                            ids: idsForRemoval.join(','),
                            fields: '*',
                            related: null
                        };

                        DreamFactory.api.system.deleteRoles(
                            requestObj,
                            function (data) {
                                defer.resolve(data);
                            },
                            function (error) {
                                defer.reject(error)
                            });

                        return defer.promise;
                    };

                    scope._removeRolesData = function (rolesDataObj) {

                        angular.forEach(scope.roles, function (obj, index) {
                            if (obj.id === rolesDataObj.id) {
                                delete scope.roles[index];
                                scope.roles.splice(index, 1)
                            }
                        });
                    };

                    // TODO: Fix Export downloading of zip file
                    scope._exportRolesData = function () {
                    };

                    // TODO: Add User Import
                    scope._importRolesData = function () {
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._createRole = function () {

                        scope._toggleViewCreateRolesActive();
                        scope.newRole = angular.copy(scope._createRoleModel());
                        console.log(scope.newRole);
                        scope.topLevelNavigation = false;
                    };

                    scope._toggleAllRoles = function () {

                        scope.toggleAllRolesBool = !scope.toggleAllRolesBool;
                        scope._toggleEachRecord(scope.roles, scope.toggleAllRolesBool);
                    };

                    scope._saveRoles = function (rolesDataArr) {

                        rolesDataArr = rolesDataArr || scope.roles;

                        // Save all roles to the remote system
                        scope._saveRolesToSystem(rolesDataArr).then(
                            function (result) {

                                angular.forEach(result.record, function (roleDataObj) {
                                    scope.$broadcast(scope.es.saveAllRolesSuccess);
                                    scope._resetRoleInArray(roleDataObj);
                                })
                            },
                            function (reject) {

                                console.log(reject);
                                throw 'saveRolesToSystem Request Failed: ' + reject.error[0].message
                            }
                        );
                    };

                    scope._revertAllRoles = function (rolesDataArr) {

                        rolesDataArr = rolesDataArr || scope.roles;

                        angular.forEach(rolesDataArr, function(obj) {

                            if (obj.dfUIUnsaved && obj.roleCopy) {

                                var roleCopy = obj.roleCopy;

                                for (var key in obj) {
                                    if(obj.hasOwnProperty(key)) {
                                        obj[key] = roleCopy[key]
                                    }
                                }
                            }

                            if (obj.dfUIUnsaved) {
                                obj.dfUIUnsaved = false;
                            }

                            delete obj.roleCopy;
                        });
                    };

                    scope._removeRoles = function (rolesDataArr) {

                        rolesDataArr = rolesDataArr || scope.roles;

                        scope._removeRolesFromSystem(rolesDataArr).then(
                            function (result) {
                                angular.forEach(result.record, function (roleDataObj) {
                                    scope._removeRolesData(roleDataObj)
                                });
                                scope.$emit(scope.es.removeUsersSuccess);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'AccessManagement Roles Request Error: ' + reject.error[0].message;
                            }
                        )
                    };

                    // Part of fix export
                    scope._exportRoles = function () {
                        console.log('Export Roles');
                        // scope._exportUsersData()
                    };

                    // Part of user import
                    scope._importRoles = function () {
                        console.log('Import Roles');
                        // scope._importUsersData()
                    };


                    // HANDLE MESSAGES
                    scope.$on('view:change:view', function (e, viewIdStr) {

                        if (viewIdStr === scope.id) {
                            scope.active = true;
                            scope.$emit('view:changed', scope.id);
                        } else {
                            scope.active = false;
                        }
                    });

                    scope.$on(accessManagementEventsService.roleEvents.openRoleSuccess, function (e, roleDataObj) {

                        scope.topLevelNavigation = false;
                    });

                    scope.$on(accessManagementEventsService.roleEvents.closeRoleSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope._toggleViewRolesListActive();
                    });

                    scope.$on(accessManagementEventsService.roleEvents.removeRoleSuccess, function (e, roleDataObj) {

                        scope._removeRolesData(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.roleEvents.createRoleSuccess, function (e, roleDataObj) {

                        scope._addUIProperties(roleDataObj);
                        scope._addRole(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.roleEvents.saveRoleSuccess, function (e, roleDataObj) {

                        scope._resetRoleInArray(roleDataObj);
                    });

                    // WATCHERS AND INITIALIZATION


                }
            }
        }])
    .directive('rolesList', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService',
        function(MODAUTH_ASSET_PATH, accessManagementEventsService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/roles-list.html',
                scope: true,
                link: function(scope, elem, attrs) {


                    scope.rolesListActive = true;
                    scope.roleDetailActive = false;
                    scope.selectedRole = null;

                    //PUBLIC API
                    scope.openRoleRecord = function (userDataObj) {

                        scope._openRoleRecord(userDataObj);
                    };

                    /**
                     * Interface for selecting a record
                     */
                    scope.selectRole = function (roleDataObj) {

                        // Call complex implementation
                        scope._selectRole(roleDataObj);
                    };


                    // PRIVATE API
                    scope._toggleRolesList = function (stateBool) {

                        scope.rolesListActive = stateBool;
                    };

                    scope._toggleRoleDetail = function (stateBool) {

                        scope.roleDetailActive = stateBool;
                    };

                    scope._toggleListActive = function () {

                        scope._toggleRolesList(true);
                        scope._toggleRoleDetail(false);
                    };

                    scope._toggleDetailActive = function () {

                        scope._toggleRoleDetail(true);
                        scope._toggleRolesList(false)
                    };

                    scope._setSelectedRole = function (roleDataObj) {

                        scope.selectedRole = roleDataObj;
                    };

                    /**
                     * Toggle dfUISelected property on scope.role
                     *
                     * @private
                     */
                    scope._setRoleSelected = function (roleDataObj) {

                        roleDataObj.dfUISelected = !roleDataObj.dfUISelected;
                    };



                    // COMPLEX IMPLEMENTATION
                    scope._openRoleRecord = function (roleDataObj) {

                        scope._toggleDetailActive();
                        scope._setSelectedRole(roleDataObj);
                    };

                    scope._closeRoleRecord = function () {

                        scope._toggleListActive();
                    };

                    /**
                     * Selects record
                     *
                     * @emit selectRoleSuccess
                     * @private
                     */
                    scope._selectRole = function (roleDataObj) {

                        scope._setRoleSelected(roleDataObj);
                        scope.$emit(scope.es.selectRoleSuccess)
                    };


                    // HANDLE EVENTS
                    scope.$on(accessManagementEventsService.roleEvents.closeRoleSuccess, function (e) {

                        scope._closeRoleRecord();
                    });

                }
            }
    }])
    .directive('roleListItem', ['MODAUTH_ASSET_PATH', function(MODAUTH_ASSET_LIST) {
        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_LIST + 'views/role-list-item.html',
            scope: true,
            link: function(scope, elem, attrs) {


                // PUBLIC API
                /**
                 * Interface for selecting a record
                 */
                scope.selectRole = function () {

                    // Call complex implementation
                    scope._selectRole();
                };


                // PRIVATE API
                /**
                 * Toggle dfUISelected property on scope.role
                 *
                 * @private
                 */
                scope._setRoleSelected = function () {

                    scope.role.dfUISelected = !scope.role.dfUISelected;
                };


                // COMPLEX IMPLEMENTATION
                /**
                 * Selects record
                 *
                 * @emit selectRoleSuccess
                 * @private
                 */
                scope._selectRole = function () {

                    scope._setRoleSelected();
                    scope.$emit(scope.es.selectRoleSuccess)
                };


                // WATCHERS AND INIT


            }
        }
    }])
    .directive('roleItemDetail', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', '$q', 'DreamFactory',
        function(MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, $q, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/role-item-detail.html',
                scope: {
                    role: '=',
                    users: '=',
                    apps: '=',
                    services: '='
                },
                link: function(scope, elem, attrs) {


                    /**
                     * Short name for accessManagementEventsService.recordEvents
                     * @type {service}
                     */
                    scope.es = accessManagementEventsService.roleEvents;

                    /**
                     * Stores a copy of the role for the revert function
                     * @type {object}
                     */
                    scope.roleCopy = {};

                    /**
                     * Store the form name
                     * @type {string}
                     */
                    scope.formName = 'role-edit';




                    // PUBLIC API
                    /*
                     The Public Api section is meant to interact with the template.
                     Each function calls it's private complement to actually do the work.
                     It's a little bit more overhead but we get a few things out of it.
                     1. We have a clean interface with an underlying implementation that can be changed easily
                     2. We can setup hooks for pre and post processing if we choose to.
                     */


                    /**
                     * Interface for closing a record
                     */
                    scope.closeRole = function () {

                        // Call complex implementation
                        scope._closeRole();
                    };

                    /**
                     * Interface for saving a record
                     */
                    scope.saveRole = function () {

                        // Call complex implementation
                        scope._saveRole();
                    };

                    /**
                     * Interface for removing a record
                     */
                    scope.removeRole = function () {

                        // Call Complex Implementation
                        if (scope._confirmRemoveRole()) {

                            scope._confirmRemoveRoleUsers() ? scope._removeRole(true) : scope._removeRole();
                        }
                    };

                    /**
                     * Interface for reverting a record
                     */
                    scope.revertRole = function () {

                        // Call complex implementation
                        scope._revertRole();
                    };



                    // PRIVATE API
                    /*
                     The Private Api is where we create small targeted functions to be used in the Complex
                     Implementations section
                     */

                    /**
                     * Creates a request object to pass to DreamFactory SDK functions
                     *
                     * @param requestDataObj
                     * @param fieldsDataStr
                     * @param relatedDataStr
                     * @returns {{id: (null|creds.id|test.id|id|internals.credentials.dh37fgj492je.id|locals.id|*), body: *, fields: (fields|*|null), related: (*|null)}}
                     * @private
                     */
                    scope._makeRequest = function (requestDataObj, fieldsDataStr, relatedDataStr) {

                        var fields = fieldsDataStr || null,
                            related = relatedDataStr || null;

                        return {
                            id: requestDataObj.id,
                            body: requestDataObj,
                            fields: fields,
                            related: related
                        }
                    };

                    /**
                     * Wrapper for DreamFactory SDK updateRole function
                     *
                     * @param roleDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._saveRoleToSystem = function (roleDataObj) {

                        var defer = $q.defer();

                        DreamFactory.api.system.updateRole(
                            scope._makeRequest(roleDataObj, '*', 'role_service_accesses,role_system_accesses'),
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };

                    /**
                     * Wrapper for DreamFactory SDK deleteRole function
                     *
                     * @param roleDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._removeRoleFromSystem = function (roleDataObj) {

                        var defer = $q.defer();

                        DreamFactory.api.system.deleteRole(
                            scope._makeRequest(roleDataObj, '*'),
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;

                    };

                    /**
                     * Get config auto close value
                     *
                     * @returns {boolean}
                     * @private
                     */
                    scope._checkAutoClose = function () {

                        return accessManagementRulesService.autoCloseRoleDetail;
                    };

                    /**
                     * Check for unsaved changes.
                     * Sets scope.role.dfUIUnsaved
                     *
                     * @private
                     */
                    scope._checkUnsavedChanges = function () {

                        // Check if our edit form is dirty
                        if (scope[scope.formName].$dirty) {

                            // it is so set some props
                            scope.role.dfUIUnsaved = true;

                            // and copy our backup to the obj in case we want to
                            // revert later/mass revert
                            scope.role['roleCopy'] = scope._copyRole(scope.roleCopy);
                        } else {

                            // Our form was not dirty
                            // set the dfUIUnsaved prop to relfect that
                            scope.role.dfUIUnsaved = false;

                            // delete any safe copies.
                            // we don't need them b/c the current
                            // state of the model is whats on the server.
                            if (scope.role['roleCopy']) {
                                delete scope.role.roleCopy;
                            }
                        }
                    };

                    /**
                     * Create an angular copy
                     *
                     * @param roleDataObj
                     * @returns {roleDataObj}
                     * @private
                     */
                    scope._copyRole = function (roleDataObj) {

                        return angular.copy(roleDataObj);
                    };

                    /**
                     * Set the edit role form to a pristine state
                     * @private
                     */
                    scope._setFormPristine = function () {

                        scope[scope.formName].$setPristine();
                    };

                    /**
                     * Set the edit role form to a dirty state
                     * @private
                     */
                    scope._setFormDirty = function () {

                        scope[scope.formName].$setDirty();
                    };

                    /**
                     * Set form state based on role saved status
                     * @param roleDataObj
                     * @private
                     */
                    scope._setFormState = function (roleDataObj) {

                        // Sets the form state based on role obj property
                        roleDataObj.dfUIUnsaved ? scope._setFormDirty() : scope._setFormPristine();
                    };

                    /**
                     * Sets the local scope.role and scope.roleCopy to null
                     * @private
                     */
                    scope._setLocalRoleNull = function () {

                        // Set the current role to null this way if we select the
                        // same role again it will trigger the watcher
                        scope.role = null;

                        // Set the current role copy to null
                        scope.roleCopy = null;
                    };

                    /**
                     * Confirm Role removal from system
                     * @returns {bool}
                     * @private
                     */
                    scope._confirmRemoveRole = function () {

                        return confirm('Remove ' + scope.role.name + '?');
                    };

                    /**
                     * Confirm delete all users with this role
                     *
                     * @returns {bool}
                     * @private
                     */
                    scope._confirmRemoveRoleUsers = function () {
                        return confirm('Would you like to remove all users with in this role?')
                    };

                    /**
                     * Sets the current role to the most recent copy of itself
                     *
                     * @private
                     */
                    scope._revertRoleData = function () {

                        // copy props from backup copy obj to working obj
                        for(var key in scope.roleCopy) {
                            if (scope.role.hasOwnProperty(key)) {
                                scope.role[key] = scope.roleCopy[key];
                            }
                        }
                    };

                    /**
                     * Determines what role data to use as copy for reversion
                     */
                    scope._setRoleCopy = function (roleDataObj) {

                        if (roleDataObj.roleCopy) {
                            scope.roleCopy = scope._copyRole(roleDataObj.roleCopy);
                        }else {
                            scope.roleCopy = scope._copyRole(roleDataObj);
                        }
                    };


                    // COMPLEX IMPLEMENTATION

                    /**
                     * Some init for the open record
                     *
                     * @emit closeRoleSucess
                     * @private
                     */
                    scope._openRole = function (roleDataObj) {

                        // Set the form state to dirty or clean based on the
                        // scope.role.dfUIUnsaved property
                        scope._setFormState(roleDataObj);

                        // Decide what to make a copy of..
                        // the original scope obj or use the copy
                        // that resides in the model if previously unsaved
                        scope._setRoleCopy(roleDataObj);

                        // Let the parent know we are successful
                        scope.$emit(scope.es.openRoleSuccess);
                    };


                    /**
                     * Closes record
                     *
                     * @emit closeRoleSucess
                     * @private
                     */
                    scope._closeRole = function () {

                        // Check for unsaved changes on the model
                        scope._checkUnsavedChanges();

                        // Set the form clean for the next role
                        scope._setFormPristine();

                        // Reset the local role
                        scope._setLocalRoleNull();

                        // Alert our parent to the fact that we're done with our
                        // closing routine
                        scope.$emit(scope.es.closeRoleSuccess);
                    };

                    /**
                     * Saves the Role record
                     *
                     * @throws AccessManagement Roles Error
                     * @private
                     */
                    scope._saveRole = function () {

                        // Pass in our role to save to the system
                        // this will return a promise that we have to handle
                        scope._saveRoleToSystem(scope.role).then(

                            // Success
                            function (result) {



                                // Broadcast a message to child directives that we are saving
                                // and they should run their save routines
                                scope.$broadcast(scope.es.saveRole);

                                // Set the form to pristine
                                scope[scope.formName].$setPristine();

                                // check if the form is pristine
                                // if so sets dfUIUnsaved property to false
                                scope._checkUnsavedChanges();

                                // Update the local copies of the record
                                scope.role = result;

                                // use _copyRole so we don;t just get a reference
                                scope.copyRole = scope._copyRole(result);


                                // Should we auto close
                                if (scope._checkAutoClose()) {

                                    // we should
                                    scope.closeRole();
                                }

                                // Let the parents know we were successful and don't pass the user
                                scope.$emit(scope.es.saveRoleSuccess, result);

                            },

                            // Error
                            function (reject) {
                                throw 'AccessManagement Roles Error: ' + reject.error[0].message
                            }
                        );
                    };

                    /**
                     * Removes record
                     *
                     * @throws AccessManagement Roles Error
                     * @private
                     */
                    scope._removeRole = function (deleteUsersBool) {

                        // Create a message obj to pass to any children
                        // with success options for their routines
                        var successMessagesObj = {
                            assignMassUsers: {
                                removeUsers: deleteUsersBool
                            }
                        };

                        // Pass our role to the remove function
                        // and handle the returned promise
                        scope._removeRoleFromSystem(scope.role).then(

                            // Success
                            function (result) {

                                // Let the children know we were successful and pass an object
                                // containing any params on what they should do on success
                                scope.$broadcast(scope.es.removeRoleSuccess, successMessagesObj);

                                // Let the parent know we were successful in removing ourselves
                                scope.$emit(scope.es.removeRoleSuccess, result);

                                // The record no longer exists so it should be closed.
                                scope.closeRole();
                            },

                            // Error
                            function (reject) {

                                throw 'AccessManagement Roles Error: ' + reject.error[0].message
                            }
                        );
                    };

                    /**
                     * Reverts record to load or most recent saved state
                     *
                     * @private
                     */
                    scope._revertRole = function () {

                        // set the working scope.role to the backup scope.roleCopy
                        scope._revertRoleData();

                        // Let the children directives know they should run their
                        // revert routines
                        scope.$broadcast(scope.es.revertRole);

                        // set the form to a pristine state
                        scope[scope.formName].$setPristine();

                        // check to make sure the form is pristine
                        // if so set scope.role.dfUIUnsaved to false
                        scope._checkUnsavedChanges();
                    };



                    // WATCHERS AND INIT
                    scope.$watch('role', function(newValue, oldValue) {

                        if (newValue) {
                            scope._openRole(newValue);
                        }
                    });

                }
            }
        }])
    .directive('createRole', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/create-role.html',
                scope: {
                    role: '=',
                    apps: '='
                },
                link: function (scope, elem, attrs) {

                    scope.es = accessManagementEventsService.roleEvents;

                    scope.active = false;


                    // PUBLIC API
                    scope.closeRole = function () {

                        scope._confirmUnsavedClose() ? scope._closeRole() : false;
                    };

                    scope.createRole = function () {

                        scope._createRole();
                    };


                    // PRIVATE API
                    scope._confirmUnsavedClose = function () {

                        if (scope['create-role'].$dirty) {
                            return confirm('Discard unsaved changes?');
                        } else {
                            return true;
                        }
                    };

                    scope._createRoleOnSystem = function () {

                        var defer = $q.defer();

                        var requestObj = {
                            body: {
                                record: scope.role
                            },
                            fields: '*',
                            related: null
                        };

                        DreamFactory.api.system.createRoles(
                            requestObj,
                            function (data) {

                                defer.resolve(data);
                            },
                            function (error) {

                                defer.reject(error);
                            }
                        );

                        return defer.promise;
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._closeRole = function () {

                        scope['create-role'].$setPristine();
                        scope.$emit(scope.es.closeRoleSuccess);
                    };

                    scope._createRole = function () {

                        scope._createRoleOnSystem().then(
                            function (result) {

                                scope['create-role'].$setPristine();
                                scope.$emit(scope.es.createRoleSuccess, result.record[0]);
                                scope.closeRole();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.createRoleError, error);
                            });
                    };


                }
            }
        }])

    .directive('assignUserRoleMaster', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService',
        function (MODAUTH_ASSET_PATH, accessManagementEventsService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/assign-user-role-master.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    // Create short names
                    scope.es = accessManagementEventsService.assignUserRoleEvents;


                    // PUBLIC VARS
                    // Stores sorted users that don't have the current role
                    scope.usersWithOutRole = [];

                    // Stores sorted users that do have the current role
                    scope.usersWithRole = [];

                    // Stores the current role
                    scope.currentRole = null;

                    // Stores the current role id
                    scope.currentRoleId = null;

                    // Stores default options for filters
                    // as well as provides a model to bind to
                    // so our filter and our directive that controls
                    // filter/view options can communicate
                    scope.filter = {
                        uaViewBy: 'email',
                        uaUserProp: 'email',
                        uaUserValue: null,
                        uaOrderBy: 'id',
                        uaOrderByReverse: false,
                        aViewBy: 'email',
                        aUserProp: 'email',
                        aUserValue: null,
                        aOrderBy: 'id',
                        aOrderByReverse: false,
                    };


                    // PUBLIC API
                    // UI Interface
                    scope.toggleUserSelected = function (userDataObj) {

                        scope._toggleUserSelected(userDataObj);
                    };

                    scope.assignRole = function () {

                        scope._assignRole();
                    };

                    scope.unassignRole = function () {

                        scope._unassignRole();
                    };

                    scope.toggleAllUsers = function (usersDataArr) {

                        if (!scope._isArrayEmpty(usersDataArr)) {
                            scope._toggleAllUsers(usersDataArr);
                        }
                    };




                    // PRIVATE API
                    // Sort the users into two groups.  Users that have this
                    // role and users that don't
                    scope.__sortUsers = function (users) {

                        // Reset our sorted arrays to empty
                        scope.__setSortedEmpty();

                        // Foreach user that was passed in
                        angular.forEach(users, function (obj) {

                            // does the user role id equal the current role id
                            if (obj.role_id != scope.currentRole.id) {

                                // it doesn't
                                obj['role_name'] = scope._getRoleName(obj.role_id);
                                scope.usersWithOutRole.push(obj);
                            } else {

                                // it does
                                obj['role_name'] = scope._getRoleName(obj.role_id);
                                scope.usersWithRole.push(obj);
                            }
                        })
                    };

                    // Reset our sort arrays
                    scope.__setSortedEmpty = function () {

                        scope.usersWithOutRole = [];
                        scope.usersWithRole = [];
                    };

                    // Set the role id to the current role on each selected user
                    // that doesn't have the current role
                    scope._getSelectedUsersWithOutRole = function () {

                        var selectedUsers = [];

                        angular.forEach(scope.usersWithOutRole, function (obj) {

                            if (obj.dfUISelected) {
                                obj.dfUIUnsaved = true;
                                obj.role_id = scope.currentRole.id;
                                selectedUsers.push(obj);
                                scope._toggleUserSelectedData(obj);

                            }
                        });

                        if (selectedUsers.length > 0) {
                            return selectedUsers;
                        } else {
                            throw 'Assign Role Error: No users selected.'
                        }
                    };

                    // Set the role id to null/default role on each selected user
                    // that has the current role
                    scope._getSelectedUsersWithRole = function () {

                        var selectedUsers = [];

                        angular.forEach(scope.usersWithRole, function (obj) {

                            if (obj.dfUISelected) {
                                obj.dfUIUnsaved = true;
                                obj.role_id = null;
                                selectedUsers.push(obj);
                                scope._toggleUserSelectedData(obj);
                            }
                        });

                        if (selectedUsers.length > 0) {
                            return selectedUsers;
                        } else {
                            throw 'Unassign Role Error: No users selected.'
                        }
                    };

                    // Toggle user to be modified
                    scope._toggleUserSelectedData = function (userDataObj) {

                        userDataObj.dfUISelected = !userDataObj.dfUISelected;
                        userDataObj.dfUISelected ? scope.totalSelectedUsers++ : scope.totalSelectedUsers--;
                    };

                    // Check if we have one or more selected users in array
                    scope._checkForSelectedUsers = function (usersArr) {

                        var haveUsers = false;

                        // Foreach user in array
                        angular.forEach(usersArr, function(obj) {

                            // are they selected
                            if (obj.dfUISelected) {

                                // someone is selected
                                haveUsers =  true;
                            }
                        });

                        return haveUsers;
                    };

                    // Gets current role data
                    scope._getCurrentRoleData = function (roleId) {

                        var selectedRole = null;

                        angular.forEach(scope.roles, function (obj) {

                            if (obj.id === roleId) {

                                selectedRole = obj;
                            }
                        });

                        return selectedRole;
                    };

                    // Sets currentRole
                    scope._setCurrentRoleData = function (roleId) {

                        scope.currentRole = scope._getCurrentRoleData(roleId);
                    };

                    scope._isArrayEmpty = function (arr) {

                        return arr.length == 0;
                    };


                    // COMPLEX IMPLEMENTATION
                    // Function to toggle user selected
                    scope._toggleUserSelected = function (userDataObj) {

                        scope._toggleUserSelectedData(userDataObj);
                    };

                    // Function to assign the role
                    scope._assignRole = function () {

                        // check if any users are selected
                        if (scope._checkForSelectedUsers(scope.usersWithOutRole)) {

                            // Tell the main parent Directive Controller to save the selected users with the current role.
                            scope.$emit(scope.es.assignRole, scope._getSelectedUsersWithOutRole());
                        }
                    };

                    // Function to unassign the role
                    scope._unassignRole = function () {

                        // check if any users are selected
                        if (scope._checkForSelectedUsers(scope.usersWithRole)) {

                            // Tell the main parent Directive Controller to save the selected users with the current role removed
                            scope.$emit(scope.es.unassignRole, scope._getSelectedUsersWithRole())
                        }
                    };

                    scope._getRoleName = function (roleId) {

                        var roleName = 'Unassigned';

                        angular.forEach(scope.roles, function (obj) {

                            if (obj.id === roleId) {
                                roleName = obj.name
                            }

                        });

                        return roleName;
                    };

                    scope._toggleAllUsers = function (usersDataArr) {

                        angular.forEach(usersDataArr, function (obj) {
                            scope._toggleUserSelected(obj);
                        })
                    };

                    scope.$on('$destroy', function(e) {

                    });


                    // HANDLE MESSAGES



                    // WATCHERS
                    var watchRoleId = scope.$watch('currentRoleId', function (newValue, oldValue) {

                        // Do we have a role
                        if (newValue !== null) {

                            // set the current role data
                            scope._setCurrentRoleData(newValue);

                            // make a local copy of the users
                            scope.massAssignUsers = angular.copy(scope.users);

                            // sort the users into two groups.
                            // Ones that have the current role and ones that don't
                            scope.__sortUsers(scope.massAssignUsers);

                        }
                    });

                    var watchUsers = scope.$watchCollection('users', function (newValue, oldValue) {

                        // Do we have a role
                        if (scope.currentRole !== null) {

                            // make a local copy of the users
                            scope.massAssignUsers = angular.copy(newValue);

                            // sort the users into two groups.
                            // Ones that have the current role and ones that don't
                            scope.__sortUsers(scope.massAssignUsers);
                        }
                    });
                }
            }
    }])

    .directive('filterUsers', ['MODAUTH_ASSET_PATH', function(MODAUTH_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/filter-users.html',
            scope: {
                sectionTitle: '@',
                filterViewBy: '=',
                filterProp: '=',
                filterValue: '=',
                orderBy: '=',
                orderByReverse: '='
            }
        }
    }])
    .directive('selectApp', ['MODAUTH_ASSET_PATH', function (MODAUTH_ASSET_PATH) {
        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/select-app.html',
            scope: {
                labelText: '@',
                appModel: '=',
                apps: '='
            }
        }
    }])
    .directive('selectRole', ['MODAUTH_ASSET_PATH', function (MODAUTH_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/select-role.html',
            scope: {
                labelText: '@',
                roleModel: '=',
                roles: '='
            }
        }
    }])
    .directive('addService', ['MODAUTH_ASSET_PATH', function (MODAUTH_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/select-service.html',
            scope: {
                services: '=',
                role: '='
            },
            link: function(scope, elem, attrs) {

                // PUBLIC API
                scope.addServiceAccess = function () {

                    scope._addServiceAccess();
                };


                // PRIVATE API
                scope._createAccessModel = function() {

                    return {
                        access: "No Access",
                        component: '*',
                        created_by_id: null,
                        created_date: null,
                        id: null,
                        filters: [],
                        filter_op: 'AND',
                        last_modified_by_id: null,
                        last_modified_date: null,
                        role_id: scope.role.id,
                        service_id: null
                    }
                };


                scope._addServiceAccessData = function () {

                    scope.role.role_service_accesses.push(scope._createAccessModel());

                };

                scope._removeService = function (index) {

                    scope.role.role_service_accesses.splice(index, 1);
                }

                // TODO: Set event in event service
                scope.$on('remove:access', function (e, o) {

                    scope._removeService(o)
                });



                // COMPLEX IMPLEMENTATION

                scope._addServiceAccess = function () {

                    scope._addServiceAccessData();
                };

                scope.$watch('role', function(newValue, oldValue) {

                    //console.log(newValue.role_services_accesses);

                })

            }
        }
    }])
    .directive('serviceAccessEdit',['MODAUTH_ASSET_PATH', '$compile',  function(MODAUTH_ASSET_PATH, $compile) {

        return {
            restrict: 'A',
            replace: true,
            templateUrl: MODAUTH_ASSET_PATH + 'views/service-access-edit.html',
            scope: {
                access: '=',
                services: '=',
                index: '='
            },
            link: function (scope, elem, attrs) {

                scope.currentServiceComponents = [];
                scope.accessFiltersActive = false;


                // PUBIC API
                scope.removeServiceAccess = function () {

                    scope._confirmRemoveAccess() ? scope._removeServiceAccess() : false;
                };

                scope.toggleAccessFilters = function () {

                    scope._toggleAccessFilters();
                };



                // PRIVATE API
                scope._getServiceData = function (serviceIdInt) {

                    var service = false;

                    angular.forEach(scope.services, function (obj) {

                        if (obj.id === serviceIdInt || obj.id === '' || obj.id === 0) {

                            service = obj;
                        }
                    });

                    return service;
                };

                scope._confirmRemoveAccess = function() {

                    return confirm('Would you like to remove access for ' + scope._getServiceName(scope.access.service_id));
                };

                scope._getServiceName = function(serviceIdInt) {

                    var serviceDataObj = scope._getServiceData(serviceIdInt),
                        name;

                    if (serviceDataObj)  {

                        if (serviceDataObj.name === '*') {
                            name = 'All Services'
                        }else {
                            name = serviceDataObj.name;
                        }

                    }

                    return name
                };

                scope._setAccessServiceId = function () {

                    if (scope.access.service_id == null) {
                        scope.access.service_id = 0
                    }
                };

                scope._setCurrentServiceComponents = function (serviceDataObj) {

                    //console.log(serviceDataObj);

                    if (serviceDataObj.components || serviceDataObj.id === 0) {
                        scope.currentServiceComponents = serviceDataObj.components.data.resource;
                    }else {
                        throw 'AccessManagement Roles Warning: No service components found for ' + serviceDataObj.name;
                    }
                };

                scope._addAccessFilterTable = function () {

                    var html = '<tr service-access-filters></tr>'
                    $(elem).after($compile(html)(scope));
                };

                scope._removeAccessFilterTable = function () {

                    $(elem).next().remove();
                };

                scope._toggleAccessFiltersActive = function () {

                    scope.accessFiltersActive = !scope.accessFiltersActive;
                }



                //COMPLEX IMPLEMENTATION
                scope._getService = function (serviceIdInt) {

                    scope._setCurrentServiceComponents(scope._getServiceData(serviceIdInt));
                    scope._setAccessServiceId();
                };

                scope._removeServiceAccess = function () {

                    scope.$emit('remove:access', scope.index);
                };

                scope._toggleAccessFilters = function () {

                    scope._toggleAccessFiltersActive();
                    scope.accessFiltersActive ? scope._addAccessFilterTable() : scope._removeAccessFilterTable();
                };


                // WATCHERS AND INIT

                scope.$watchCollection('access', function(newValue, oldValue) {

                    //console.log(scope.access)

                    scope._getService(scope.access.service_id);
                    scope._setAccessServiceId();

                });


            }
        }

    }])
    .directive('serviceAccessFilters', ['MODAUTH_ASSET_PATH', function(MODAUTH_ASSET_PATH) {

        return {
            restrict: 'A',
            replace: true,
            scope: true,
            templateUrl: MODAUTH_ASSET_PATH + 'views/service-access-filters.html',
            link: function(scope, elem, attrs) {

                scope.filterOps = ['AND', 'OR'];

                scope.operators = [
                    "=",
                    "!=",
                    ">",
                    "<",
                    ">=",
                    "<=",
                    "in",
                    "not in",
                    "starts with",
                    "ends with",
                    "contains",
                    "is null",
                    "is not null"
                ];



                // PUBLIC API
                scope.addFilter = function () {

                    scope._addFilter();
                };

                scope.removeFilter = function (index) {

                    scope._confirmRemoveFilter() ? scope._removeFilter(index) : false;
                };



                // PRIVATE API
                scope._createFilterModel = function () {

                    return {
                        name: '',
                        operator: '',
                        value: ''
                    }
                };

                scope._hasFilters = function(accessDataObj) {

                    return !!accessDataObj.filters;
                };

                scope._confirmRemoveFilter = function () {

                    return confirm('Remove Filter?');
                }

                scope._addFilterData = function () {

                    if (scope._hasFilters(scope.access)) {
                        scope.access.filters.push(scope._createFilterModel());
                    }else {
                        scope.access['filters'] = [];
                        scope.access.filters.push(scope._createFilterModel());
                    }
                };

                scope._removeFilterData = function (index) {

                    scope.access.filters.splice(index, 1);
                };



                //COMPLEX IMPLEMENTATION
                scope._addFilter = function () {

                    scope._addFilterData();
                };

                scope._removeFilter = function (index) {

                    scope._removeFilterData(index);
                };




                //WATCHERS AND INIT



            }
        }
    }])

    .directive('configMaster', ['MODAUTH_ASSET_PATH', 'accessManagementRulesService', function(MODAUTH_ASSET_PATH, accessManagementRulesService) {

        return {

            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/config-master.html',
            link: function(scope, elem, attrs) {


                // Create short names
                scope.rs = accessManagementRulesService;



                scope.active = false;
                scope.id = 'config';
                scope.topLevelNavigation = true;



                // HANDLE MESSAGES
                scope.$on('view:change:view', function (e, viewIdStr) {

                    if (viewIdStr === scope.id) {
                        scope.active = true;
                        scope.$emit('view:changed', scope.id);
                    } else {
                        scope.active = false;
                    }
                });
            }
        }
    }])
    .directive('configUsersOptions', ['MODAUTH_ASSET_PATH', 'stringService', function(MODAUTH_ASSET_PATH, stringService) {

        return {

            restrict: 'E',
            scope: true,
            templateUrl: MODAUTH_ASSET_PATH + 'views/config-users-options.html',
            link: function(scope, elem, attrs) {


                // Create Short Name
                // TODO: Add root locale chooser and use that value here
                scope.stringService = stringService.config.usersConfig.en;


                // TODO: Add save function for Users options

            }
        }
    }])
    .directive('configRolesOptions', ['MODAUTH_ASSET_PATH', 'stringService', function(MODAUTH_ASSET_PATH, stringService) {

        return {

            restrict: 'E',
            scope: true,
            templateUrl: MODAUTH_ASSET_PATH + 'views/config-roles-options.html',
            link: function(scope, elem, attrs) {


                // Create Short Name
                // TODO: Add root locale chooser and use that value here
                scope.stringService = stringService.config.rolesConfig.en;


                // TODO: Add save function for Roles options

            }
        }
    }])
    .directive('configGeneralOptions', ['MODAUTH_ASSET_PATH', 'stringService',
        function (MODAUTH_ASSET_PATH, stringService) {


            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/config-general-options.html',
                scope: true,
                link: function(scope, elem, attrs) {

                    // Create Short Name
                    scope.stringService = stringService.config.generalConfig.en;







                }
            }
    }])

    .service('accessManagementEventsService', [function () {

        return {
            module: {
                getRoles: 'get:roles',
                getUsers: 'get:users',
                getApps: 'get:apps',
                openModuleNavigation: 'open:modulenav'

            },
            usersEvents: {

                removeUsers: 'remove:users',
                toggleAllUsers: 'select:all',
                saveUsers: 'save:users',
                createUser: 'create:user',
                exportUsers: 'export:users',
                importUsers: 'import:users',
                getUsersSuccess: 'get:users:success',
                getUsersError: 'get:users:error',
                removeUsersSuccess: 'remove:users:success',
                removeUsersError: 'remove:users:error',
                saveAllUsersSuccess: 'save:users:success',
                saveAllUsersError: 'save:users:error',
                createUserSuccess: 'create:user:success',
                createUserError: 'create:user:error'
            },
            rolesEvents: {

                removeRoles: 'remove:roles',
                toggleAllRoles: 'select:all',
                saveRoles: 'save:Roles',
                createRole: 'create:role',
                exportRoles: 'export:roles',
                importRoles: 'import:roles',
                revertAllRoles: 'revert:all:roles',
                getRolesSuccess: 'get:roles:success',
                getRolesError: 'get:roles:error',
                removeRolesSuccess: 'remove:roles:success',
                removeRolesError: 'remove:roles:error',
                saveAllRolesSuccess: 'save:roles:success',
                saveAllRolesError: 'save:roles:error',
                createRoleSuccess: 'create:role:success',
                createRoleError: 'create:role:error'
            },
            userEvents: {

                closeUser: 'close:user',
                openUser: 'open:user',
                removeUser: 'remove:user',
                revertUser: 'revert:user',
                selectUser: 'select:user',
                saveUser: 'save:user',
                createUser: 'create:user',
                openUserSuccess: 'open:user:success',
                closeUserSuccess: 'close:user:success',
                saveUserSuccess: 'save:user:success',
                removeUserSuccess: 'remove:user:success',
                revertUserSuccess: 'revert:user:success',
                selectUserSuccess: 'select:user:success',
                createUserSuccess: 'create:user:success',
                createUserError: 'create:user:error'

            },
            roleEvents: {
                openRoleSingle: 'open:role:single',
                closeRoleSingle: 'close:role:single',
                openRole: 'open:role',
                removeRole: 'remove:role',
                revertRole: 'revert:role',
                selectRole: 'select:role',
                saveRole: 'save:role',
                closeRole: 'close:role',
                createRole: 'create:role',
                openRoleSuccess: 'open:role:success',
                closeRoleSuccess: 'close:role:success',
                saveRoleSuccess: 'save:role:success',
                removeRoleSuccess: 'remove:role:success',
                revertRoleSuccess: 'revert:role:success',
                createRoleSuccess: 'create:role:success',
                createRoleError: 'create:role:error',
                selectRoleSuccess: 'select:role:success'

            },
            assignUserRoleEvents: {
                assignRole: 'assign:role',
                unassignRole: 'unassign:role',
                removeRoleUsers: 'remove:role:users'
            },
            selectRolesEvents: {

            },
            assignMassUsersEvents: {

            }
        }
    }])
    .service('accessManagementRulesService', [function () {

        return {
            allowMassAdminUserDeletion: false,
            viewUsersAsTable: false,
            viewRolesAsTable: false,
            recordsLimit: 20,
            recordsPerPage: 20,
            autoCloseUserDetail: true,
            autoCloseRoleDetail: true
        }
    }])
    .service('stringService', [function() {

        return {

            config: {
                generalConfig: {
                    en: {
                        sectionTitle: 'General Options',
                        recordsLimit: 'Number of records to retrieve',
                        recordsPerPage: 'Number of records to show per page'
                    }
                },
                usersConfig: {
                    en: {
                        sectionTitle: 'Users Options',
                        allowMassAdminDelete: 'Allow administrators to be mass deleted.',
                        autoCloseUserDetail: 'Auto close user detail on save.',
                        viewUsersAsTable: 'View Users as table.'
                    }
                },

                rolesConfig: {
                    en: {
                        sectionTitle: 'Roles Options',
                        autoCloseRoleDetail: 'Auto close user detail on save.',
                        viewRolesAsTable: 'View Roles as table.'
                    }
                }
            }
        }
    }])
    .filter('orderObjectBy', [function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field]);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    }])
    .filter('removeField', [function () {
        return function (items, field, reverse) {

            var filtered = {};

            angular.forEach(items, function (value, key) {
                if (key !== field) {
                    filtered[key] = value;
                }
            });
            return filtered;
        }
    }])
    .filter('showOnlyFieldsOrdered', [function () {
        return function (items, fieldList) {

            var filtered = {};
            fieldList = fieldList.split(',');

            angular.forEach(fieldList, function (listValue, listKey) {
                filtered[listKey] = items[listValue];
            });
            return filtered;
        }
    }])
    .filter('dfFilterBy', [function() {
        return function (items, options) {

            var filtered = [];

            // There is nothing to base a filter off of
            if (!options) {return items};

            if (!options.field) {return items};
            if (!options.value) {return items};
            if (!options.regex) {
                options.regex = new RegExp(options.value)
            }

            angular.forEach(items, function(item) {
                if (options.regex.test(item[options.field])) {

                    filtered.push(item)
                }
            });

            return filtered;
        }
    }]);

