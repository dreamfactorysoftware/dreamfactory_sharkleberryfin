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

        // @todo
        // Need to get DreamFactory to bootstrap so it's ready when we need to make calls.
        // Trying to prefetch data and then pass through a controller to make available for
        // all directives.  Seems to be the way to go if I can get DreamFactory to load first.
    }])
    .directive('modaccessNavigation', ['MODAUTH_ASSET_PATH',
        function (MODAUTH_ASSET_PATH) {

            return {
                restrict: 'E',
                require: '^accessManagement',
                templateUrl: MODAUTH_ASSET_PATH + 'views/navigation.html'
            }
        }])
    .directive('accessManagement', ['MODAUTH_ASSET_PATH', '$q', 'DreamFactory', 'accessManagementEventsService', 'accessManagementDataService',
        function (MODAUTH_ASSET_PATH, $q, DreamFactory, accessManagementEventsService, accessManagementDataService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/access-management.html',
                scope: {},
                controller: function ($scope) {

                    $scope.activeView = 'users';
                    $scope.toggleModuleNavigationBool = true;
                    $scope.roles = [];
                    $scope.users = [];
                    $scope.apps = [];


                    // Create a short name
                    $scope.es = accessManagementEventsService.module;

                    $scope.init = function () {
                        if (DreamFactory.isReady()) {
                            $scope.$broadcast($scope.es.broadcast.getRoles);
                            $scope.$broadcast($scope.es.broadcast.getUsers);
                            $scope.$broadcast($scope.es.broadcast.getApps);
                        }
                    };


                    // PUBLIC API
                    $scope.changeView = function (viewIdStr) {

                        $scope.$broadcast('view:change:view', viewIdStr);
                    };


                    // PRIVATE API
                    $scope._toggleModuleNavigation = function () {

                        $scope.toggleModuleNavigationBool = !$scope.toggleModuleNavigationBool;
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

                    $scope._getRoles = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {
                            fields: '*',
                            limit: 100
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

                    $scope._getUsers = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {
                            fields: '*',
                            limit: 100
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

                    $scope._getApps = function (requestObj) {

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


                    // HANDLE MESSAGES
                    $scope.$on($scope.es.emit.openModuleNavigation, function (e) {

                        console.log($scope.toggleModuleNavigationBool);
                        $scope._toggleModuleNavigation();
                    });

                    $scope.$on('api:ready', function (e) {
                        $scope.init();
                    });

                    $scope.$on('view:changed', function (e, viewIdStr) {

                        $scope.activeView = viewIdStr;
                        $scope._toggleModuleNavigation();
                    });

                    $scope.$on($scope.es.broadcast.getRoles, function (e) {

                        $scope._getRoles().then(
                            function (result) {
                                $scope.roles = $scope._addUIProperties(result.record);
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        )
                    });

                    $scope.$on($scope.es.broadcast.getUsers, function (e) {

                        $scope._getUsers().then(
                            function (result) {
                                $scope.users = $scope._addUIProperties(result.record);
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        )
                    });

                    $scope.$on($scope.es.broadcast.getApps, function(e) {

                        $scope._getApps().then(
                            function(result) {
                                $scope.apps = $scope._addUIProperties(result.record);
                            },
                            function(reject) {

                                console.log(reject);
                            }
                        )
                    });

                    $scope.$on(accessManagementEventsService.recordEvents.emit.saveRecordSuccess, function (e, userDataObj) {


                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.emit.assignUsersRole, function(e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.broadcast.saveAllUsers,usersDataArr);
                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.emit.unassignUsersRole, function(e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.broadcast.saveAllUsers,usersDataArr);
                    });


                    // WATCHERS AND INIT
                    $scope.init();


                }
            }
        }])
    .directive('usersMaster', ['$q', '$http', 'DSP_URL', 'MODAUTH_ASSET_PATH', 'DreamFactory', 'accessManagementRulesService', 'accessManagementEventsService', 'accessManagementDataService',
        function ($q, $http, DSP_URL, MODAUTH_ASSET_PATH, DreamFactory, accessManagementRulesService, accessManagementEventsService, accessManagementDataService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/users-master.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    // Create a shortname
                    scope.es = accessManagementEventsService.usersEvents;
                    scope.ds = accessManagementDataService;

                    // PUBLIC VARS
                    scope.active = true;
                    scope.id = 'users';
                    scope.toggleAllUsersBool = false;
                    scope.limit = accessManagementRulesService.recordsLimit;
                    scope.topLevelNavigation = true;
                    scope.newUser = {};


                    // PUBLIC API
                    scope.removeUsers = function () {

                        scope.$broadcast(scope.es.broadcast.removeUsers);
                    };

                    scope.toggleAllUsers = function () {

                        scope.$broadcast(scope.es.broadcast.toggleAllUsers);
                    };

                    scope.saveAllUsers = function () {

                        scope.$broadcast(scope.es.broadcast.saveAllUsers);
                    };

                    scope.revertAllUsers = function () {

                        scope.$broadcast(scope.es.broadcast.revertAllUsers);
                    };

                    scope.createUser = function () {

                        scope.$broadcast(scope.es.broadcast.createUser);
                    };

                    scope.exportUsers = function () {

                        scope.$broadcast(scope.es.broadcast.exportUsers);
                    };

                    scope.importUsers = function () {

                        scope.$broadcast(scope.es.broadcast.importUsers);
                    };

                    scope.openModuleNavigation = function () {

                        scope.$emit(accessManagementEventsService.module.emit.openModuleNavigation);
                    };


                    //PRIVATE API
                    scope._toggleAllUsers = function (dataObj, bool) {

                        angular.forEach(dataObj, function (value, index) {
                            value['dfUISelected'] = bool;
                        });
                    };

                    scope._removeSelectedUsersFromSystem = function (dataObj) {

                        var idsForRemoval = [],
                            objsForRemoval = [];


                        angular.forEach(dataObj, function (value, index) {

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
                        if (idsForRemoval.length === 0) return false;


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

                    scope.__removeUsersData = function (userDataObj) {

                        angular.forEach(scope.users, function (obj, index) {

                            if (obj.id === userDataObj.id) {
                                delete scope.users[index];
                                scope.users.splice(index, 1)
                            }
                        });
                    };

                    scope._saveAllUsersToSystem = function (usersDataObj) {

                        var objsToSave = [];

                        angular.forEach(usersDataObj, function (obj) {

                            if (obj.dfUIUnsaved) {

                                objsToSave.push(obj);
                            }
                        });

                        console.log(objsToSave);


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
                            confirmed: true,
                            is_active: true,
                            is_sys_admin: true,
                            role_id: null,
                            default_app_id: null,
                            user_source: 0,
                            user_data: [],
                            newUser: true
                        }
                    };

                    scope._addUser = function (userDataObj) {

                        scope.users.unshift(userDataObj);
                    };

                    scope.__resetUserInArray = function (userDataObj) {

                        angular.forEach(scope.users, function (obj, index) {
                            if (obj.id === userDataObj.id) {
                                scope.users.splice(index, 1);
                            }
                        });

                        scope.users.unshift(userDataObj);
                    };


                    // todo Fix Export downloading of zip file
                    scope._exportUsers = function () {

                        $http.get(DSP_URL + '/rest/system/user?app_name=admin&file=jimmy.csv&format=csv&download=true',
                            function (data) {

                            },
                            function (error) {

                            }
                        )


                    };

                    // todo Add User Import
                    scope._importUsers = function () {
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

                    scope.$on(scope.es.broadcast.removeUsers, function (e) {

                        try {
                            scope._removeSelectedUsersFromSystem(scope.users).then(
                                function (result) {
                                    angular.forEach(result.record, function (userDataObj) {
                                        scope.__removeUsersData(userDataObj)
                                    });

                                    scope.$emit(scope.es.emit.removeUsersSuccess);
                                },
                                function (reject) {
                                    console.log('rejected');
                                    console.log(reject);
                                    scope.$emit(scope.es.emit.removeUsersError);
                                    throw 'Remove Users Error: ';
                                }
                            )
                        } catch (e) {
                            throw 'Remove Users Error: Failed';
                        }

                    });

                    scope.$on(scope.es.broadcast.toggleAllUsers, function (e) {

                        scope.toggleAllUsersBool = !scope.toggleAllUsersBool;
                        scope._toggleAllUsers(scope.users, scope.toggleAllUsersBool);
                    });

                    scope.$on(scope.es.broadcast.saveAllUsers, function (e, usersDataObj) {


                        usersDataObj = usersDataObj || scope.users;


                        console.log('save all users');
                        try {

                            // Save all users to the remote system
                            scope._saveAllUsersToSystem(usersDataObj).then(
                                function (result) {

                                    // Let all the user objects know they should save themselves.
                                    // This will update our main scope b/c everyone is bound to it.
                                    scope.$broadcast(scope.es.broadcast.saveAllUsersSuccess);

                                    // Alert the Application that all users have been saved.
                                    scope.$emit(scope.es.emit.saveAllUsersSuccess);

                                    angular.forEach(result.record, function(userDataObj) {
                                        scope.__resetUserInArray(userDataObj);
                                    })
                                },
                                function (reject) {

                                    console.log(reject);
                                    scope.$emit(scope.es.emit.saveAllUsersError);
                                }
                            );
                        } catch (e) {
                            throw 'Save All Users: Failed';
                        }
                    });

                    scope.$on(scope.es.broadcast.revertAllUsers, function (e) {

                        scope.$broadcast(accessManagementEventsService.userEvents.broadcast.revertRecord)
                    });

                    scope.$on(scope.es.broadcast.createUser, function (e) {

                        scope.newUser = scope._createUserModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, scope.newUser);
                    });

                    // Part of fix export
                    scope.$on(scope.es.broadcast.exportUsers, function (e) {

                        scope._exportUsers();
                    });

                    // Part of user import
                    scope.$on(scope.es.broadcast.importUsers, function (e) {


                    });


                    // Handle Child Edit-User/Create-User Events
                    scope.$on(accessManagementEventsService.recordEvents.emit.openRecordSuccess, function (e, userDataObj) {

                        e.stopPropagation();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.userEvents.broadcast.openRecordSingle, userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.closeRecordSuccess, function (e) {

                        e.stopPropagation();
                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.userEvents.broadcast.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.removeRecordSuccess, function (e, userDataObj) {

                        e.stopPropagation();
                        scope.__removeUsersData(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.createRecordSuccess, function (e, userDataObj) {

                        e.stopPropagation();
                        scope._addUIProperties(userDataObj);
                        scope._addUser(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.saveRecordSuccess, function (e, userDataObj) {

                        e.stopPropagation();
                        scope.__resetUserInArray(userDataObj);
                    });


                    // WATCHERS AND INITIALIZATION


                }
            }
        }])
    .directive('rolesMaster', ['$q', 'MODAUTH_ASSET_PATH', 'DreamFactory', 'accessManagementRulesService', 'accessManagementEventsService', 'accessManagementDataService',
        function ($q, MODAUTH_ASSET_PATH, DreamFactory, accessManagementRulesService, accessManagementEventsService, accessManagementDataService) {

            return {
                restrict: 'E',
                require: '^accessManagement',
                scope: true,
                templateUrl: MODAUTH_ASSET_PATH + 'views/roles-master.html',
                link: function (scope, elem, attrs) {


                    // Create short names
                    scope.es = accessManagementEventsService.rolesEvents;
                    scope.ds = accessManagementDataService;

                    // PUBLIC VARS
                    scope.active = false;
                    scope.id = 'roles';
                    scope.toggleAllRolesBool = false;
                    scope.limit = accessManagementRulesService.recordsLimit;
                    scope.topLevelNavigation = true;
                    scope.newRole = {};


                    // PUBLIC API
                    scope.openModuleNavigation = function () {

                        scope.$emit(accessManagementEventsService.module.emit.openModuleNavigation);
                    };

                    scope.createRole = function () {

                        scope.$broadcast(scope.es.broadcast.createRole);
                    };

                    scope._addRole = function (roleDataObj) {

                        scope.roles.unshift(roleDataObj);
                    };


                    //PRIVATE API

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


                    // HANDLE MESSAGES
                    scope.$on('view:change:view', function (e, viewIdStr) {

                        if (viewIdStr === scope.id) {
                            scope.active = true;
                            scope.$emit('view:changed', scope.id);
                        } else {
                            scope.active = false;
                        }
                    });

                    scope.$on(scope.es.broadcast.createRole, function (e) {

                        scope.newRole = scope._createRoleModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, scope.newRole);
                    });


                    // Handle Child Edit-Role Events
                    scope.$on(accessManagementEventsService.recordEvents.emit.openRecordSuccess, function (e, roleDataObj) {

                        e.stopPropagation();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.closeRecordSuccess, function (e) {

                        e.stopPropagation();
                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.removeRecordSuccess, function (e, roleDataObj) {

                        e.stopPropagation();
                        scope.__removeRolesData(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.createRecordSuccess, function (e, roleDataObj) {

                        e.stopPropagation();
                        scope._addUIProperties(roleDataObj);
                        scope._addRole(roleDataObj);
                    });


                    // WATCHERS AND INITIALIZATION


                }
            }
        }])
    .directive('editUser', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, DreamFactory) {
            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/edit-user.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    // Create Short Names
                    scope.es = accessManagementEventsService.recordEvents;

                    scope.active = false;
                    scope.singleUserActive = false;
                    scope.userCopy = {};
                    scope.formName = 'user-edit-' + scope.user.id;

                    scope.init = function () {

                        scope.userCopy = scope._copyRecord(scope.user);
                    };


                    // PUBLIC API
                    scope.openRecord = function () {

                        scope.$broadcast(scope.es.broadcast.openRecord);
                    };

                    scope.closeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.closeRecord);
                    };

                    scope.saveRecord = function () {

                        scope.$broadcast(scope.es.broadcast.saveRecord)
                    };

                    scope.removeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.removeRecord);
                    };

                    scope.revertRecord = function () {

                        scope.$broadcast(scope.es.broadcast.revertRecord)
                    };

                    scope.selectRecord = function () {

                        scope.$broadcast(scope.es.broadcast.selectRecord);
                    };


                    // PRIVATE API
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

                    scope._saveRecord = function (userDataObj) {

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

                    scope._removeRecord = function (userDataObj) {

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

                    scope._checkAutoClose = function () {

                        return !!accessManagementRulesService.autoCloseUserDetail;

                    };

                    scope._checkUnsavedChanges = function () {

                        if (scope['user-edit-' + scope.user.id].$dirty) {
                            scope.user.dfUIUnsaved = true;
                        } else {
                            scope.user.dfUIUnsaved = false;
                        }
                    };

                    scope._copyRecord = function (userDataObj) {

                        return angular.copy(userDataObj);
                    };

                    scope._revertRecord = function () {

                        scope.user = scope._copyRecord(scope.userCopy);
                    };

                    scope._setRecordSelected = function () {

                        scope.user.dfUISelected = !scope.user.dfUISelected;
                    };


                    // HANDLE MESSAGES
                    scope.$on(scope.es.broadcast.openRecord, function (e) {

                        scope.active = true;
                        scope.$emit(scope.es.emit.openRecordSuccess, scope.user);
                    });

                    scope.$on(scope.es.broadcast.closeRecord, function (e) {

                        scope.$emit(scope.es.emit.closeRecordSuccess);
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, userDataObj) {

                        if (userDataObj.id !== scope.user.id) {
                            scope.singleUserActive = true;
                        }
                    });

                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope._checkUnsavedChanges();
                        scope.singleUserActive = false;
                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.saveRecord, function (e) {

                        scope._saveRecord(scope.user).then(
                            function (result) {

                                scope['user-edit-' + scope.user.id].$setPristine();
                                scope._checkUnsavedChanges();
                                scope.user = result;
                                scope.userCopy = result;


                                if (scope._checkAutoClose()) {
                                    scope.closeRecord();
                                }

                                scope.$emit(scope.es.emit.saveRecordSuccess, result);
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );
                    });

                    scope.$on(scope.es.broadcast.removeRecord, function (e) {

                        scope._removeRecord(scope.user).then(
                            function (result) {
                                scope.$emit(scope.es.emit.removeRecordSuccess, result);
                                scope.closeRecord();
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );
                    });

                    scope.$on(scope.es.broadcast.revertRecord, function (e) {

                        scope._revertRecord();
                        scope['user-edit-' + scope.user.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.emit.revertRecordSuccess);
                    });

                    scope.$on(scope.es.broadcast.selectRecord, function (e) {

                        scope._setRecordSelected();
                        scope.$emit(scope.es.emit.selectRecordSuccess)
                    });

                    scope.$on(accessManagementEventsService.usersEvents.broadcast.saveAllUsersSuccess, function (e) {

                        console.log('received reset user')

                        scope['user-edit-' + scope.user.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.userCopy = scope._copyRecord(scope.user);
                    });

                    scope.$on('$destroy', function () {

                    });


                    // INIT AND WATCHERS
                    scope.init();
                }
            }
        }])
    .directive('editRole', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', '$q', 'DreamFactory',
        function (MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, $q, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/edit-role.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    // Create Short Names
                    scope.es = accessManagementEventsService.recordEvents;
                    scope.ds = accessManagementRulesService;

                    scope.active = false;
                    scope.singleRoleActive = false;
                    scope.roleCopy = {};
                    scope.formName = 'role-edit-' + scope.role.id;

                    console.log(scope.roles);

                    scope.init = function () {

                        scope.roleCopy = scope._copyRecord(scope.role);
                    };


                    // PUBLIC API
                    scope.openRecord = function () {

                        scope.$broadcast(scope.es.broadcast.openRecord);
                    };

                    scope.closeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.closeRecord);
                    };

                    scope.saveRecord = function () {

                        scope.$broadcast(scope.es.broadcast.saveRecord)
                    };

                    scope.removeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.removeRecord);
                    };

                    scope.revertRecord = function () {

                        scope.$broadcast(scope.es.broadcast.revertRecord)
                    };

                    scope.selectRecord = function () {

                        scope.$broadcast(scope.es.broadcast.selectRecord);
                    };


                    // PRIVATE API
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

                    scope._saveRecord = function (roleDataObj) {

                        var defer = $q.defer();

                        DreamFactory.api.system.updateRole(
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

                    scope._removeRecord = function (roleDataObj) {

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

                    scope._checkAutoClose = function () {

                        return !!accessManagementRulesService.autoCloseUserDetail;

                    };

                    scope._checkUnsavedChanges = function () {

                        if (scope['role-edit-' + scope.role.id].$dirty) {
                            scope.role.dfUIUnsaved = true;
                        } else {
                            scope.role.dfUIUnsaved = false;
                        }
                    };

                    scope._copyRecord = function (roleDataObj) {

                        return angular.copy(roleDataObj);
                    };

                    scope._revertRecord = function () {

                        scope.role = scope._copyRecord(scope.roleCopy);
                    };

                    scope._setRecordSelected = function () {

                        scope.role.dfUISelected = !scope.role.dfUISelected;
                    };


                    // HANDLE MESSAGES
                    scope.$on(scope.es.broadcast.openRecord, function (e) {

                        scope.active = true;
                        scope.$emit(scope.es.emit.openRecordSuccess, scope.role);
                    });

                    scope.$on(scope.es.broadcast.closeRecord, function (e) {

                        scope.$emit(scope.es.emit.closeRecordSuccess);
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, roleDataObj) {

                        if (roleDataObj.id !== scope.role.id) {
                            scope.singleRoleActive = true;
                        }
                    });

                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope._checkUnsavedChanges();
                        scope.singleRoleActive = false;
                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.saveRecord, function (e) {

                        scope._saveRecord(scope.role).then(
                            function (result) {

                                scope['role-edit-' + scope.role.id].$setPristine();
                                scope._checkUnsavedChanges();
                                scope.role = scope.roleCopy = result;


                                if (scope._checkAutoClose()) {
                                    scope.closeRecord();
                                }

                                scope.$emit(scope.es.emit.saveRecordSuccess, result);
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );
                    });

                    scope.$on(scope.es.broadcast.removeRecord, function (e) {

                        scope._removeRecord(scope.role).then(
                            function (result) {
                                scope.$emit(scope.es.emit.removeRecordSuccess, result);
                                scope.closeRecord();
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );
                    });

                    scope.$on(scope.es.broadcast.revertRecord, function (e) {

                        scope._revertRecord();
                        scope['role-edit-' + scope.role.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.emit.revertRecordSuccess);
                    });

                    scope.$on(scope.es.broadcast.selectRecord, function (e) {

                        scope._setRecordSelected();
                        scope.$emit(scope.es.emit.selectRecordSuccess)
                    });

                    scope.$on(accessManagementEventsService.usersEvents.broadcast.saveAllUsersSuccess, function (e) {

                        scope['role-edit-' + scope.role.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.roleCopy = scope._copyRecord(scope.role);
                    });

                    scope.$on('$destroy', function () {

                    });


                    // INIT AND WATCHERS
                    scope.init();
                }
            }
        }])
    .directive('selectRole', ['MODAUTH_ASSET_PATH', function (MODAUTH_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/select-role.html',
            scope: {
                roleModel: '=roleModel',
                roles: '=roles'
            }
        }
    }])
    .directive('massAssignUsers', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService',
        function (MODAUTH_ASSET_PATH, accessManagementEventsService) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/mass-assign-users.html',
                scope: {
                    users: '=users',
                    roleId: '@roleId'
                },
                link: function (scope, elem, attrs) {


                    // Create a short names
                    scope.es = accessManagementEventsService.assignMassUsersEvents;


                    // PUBLIC VARS

                    // Stores sorted users that don't have the current role
                    scope.usersWithOutRole = [];

                    // Stores sorted users that do have the current role
                    scope.usersWithRole = [];


                    // PUBLIC API

                    // UI Interface
                    scope.toggleUserSelected = function (userDataObj) {

                        scope.$broadcast(scope.es.broadcast.toggleUserSelected, userDataObj);
                    };

                    scope.assignRole = function () {

                        scope.$broadcast(scope.es.broadcast.assignRole);
                    };

                    scope.unassignRole = function () {

                        scope.$broadcast(scope.es.broadcast.unassignRole);
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
                            if (obj.role_id != scope.roleId) {

                                // it doesn't
                                scope.usersWithOutRole.push(obj);
                            } else {

                                // it does
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
                    scope._getSelectedUsersWithOutRole = function() {

                        var selectedUsers = [];

                        angular.forEach(scope.usersWithOutRole, function(obj) {

                            if (obj.dfUISelected) {
                                obj.dfUIUnsaved = true;
                                obj.role_id = scope.roleId;
                                selectedUsers.push(obj);
                            }
                        });

                        if (selectedUsers.length > 0) {
                            return selectedUsers;
                        }else {
                            throw 'Assign Role Error: No users selected.'
                        }
                    };

                    // Set the role id to null/default role on each selected user
                    // that has the current role
                    scope._getSelectedUsersWithRole = function() {

                        var selectedUsers = [];

                        angular.forEach(scope.usersWithRole, function(obj) {

                            if (obj.dfUISelected) {
                                obj.dfUIUnsaved = true;
                                obj.role_id = null;
                                selectedUsers.push(obj);
                            }
                        });

                        if (selectedUsers.length > 0) {
                            return selectedUsers;
                        }else {
                            throw 'Unassign Role Error: No users selected.'
                        }
                    };

                    // Toggle users to be modified
                    scope.__toggleUserSelected = function(userDataObj) {
                        angular.forEach(scope.users, function (obj, index) {

                            if (obj.id === userDataObj.id) {
                                obj.dfUISelected = !obj.dfUISelected;
                            }
                        })
                    };



                    // HANDLE MESSAGES

                    // Listen for UI function to toggle user selected
                    scope.$on(scope.es.broadcast.toggleUserSelected, function(e, userDataObj) {

                        scope.__toggleUserSelected(userDataObj);
                    });

                    // Listen for the UI function to assign the role
                    scope.$on(scope.es.broadcast.assignRole, function(e) {

                        // Tell the main parent Directive Controller to save the selected users with the current role.
                        scope.$emit(scope.es.emit.assignUsersRole, scope._getSelectedUsersWithOutRole());
                    });

                    // Listen for the UI function to unassign the role
                    scope.$on(scope.es.broadcast.unassignRole, function(e) {

                        // Tell the main parent Directive Controller to save the selected users with the current role removed
                        scope.$emit(scope.es.emit.unassignUsersRole, scope._getSelectedUsersWithRole())
                    });


                    // @todo Prompt or unselect selected users on record close.

                    // @todo Run role assign and unassign on record save.





                    // WATCHERS AND INIT
                    var watchUsers = scope.$watchCollection('users', function (newValue, oldValue) {
                        scope.__sortUsers(newValue);
                    });
                }
            }
        }])
    .directive('selectApp', ['MODAUTH_ASSET_PATH', function(MODAUTH_ASSET_PATH) {
        return {
            restrict: 'E',
            templateUrl: MODAUTH_ASSET_PATH + 'views/select-app.html',
            scope: {
                appModel: '=appModel',
                apps: '=apps'
            }
        }
    }])
    .directive('createUser', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/create-user.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    scope.es = accessManagementEventsService.recordEvents;

                    scope.active = false;
                    scope.singleUserActive = false;



                    // PUBLIC API
                    scope.closeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.closeRecord);
                    };

                    scope.createRecord = function () {

                        scope.$broadcast(scope.es.broadcast.createRecord)
                    };


                    // PRIVATE API
                    scope._confirmUnsavedClose = function () {

                        if (scope['create-user'].$dirty) {
                            return confirm('Discard unsaved changes?');
                        } else {
                            return true;
                        }
                    };

                    scope._createUserRecord = function () {

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


                    // HANDLE MESSAGES
                    scope.$on(scope.es.broadcast.closeRecord, function (e) {

                        if (scope._confirmUnsavedClose()) {
                            scope['create-user'].$setPristine();
                            scope.$emit(scope.es.emit.closeRecordSuccess);
                        }
                    });

                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, userDataObj) {

                        if (userDataObj.id === null) {
                            scope.active = true;
                            scope.user = angular.copy(scope.newUser);
                        }
                    });

                    scope.$on(scope.es.broadcast.createRecord, function (e) {

                        scope._createUserRecord().then(
                            function (result) {

                                scope['create-user'].$setPristine();
                                scope.$emit(scope.es.emit.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.emit.createRecordError, error);
                            }
                        )

                    });

                }
            }
        }])
    .directive('createRole', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/create-role.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    scope.es = accessManagementEventsService.recordEvents;

                    scope.active = false;
                    scope.singleRoleActive = false;



                    // PUBLIC API
                    scope.closeRecord = function () {

                        scope.$broadcast(scope.es.broadcast.closeRecord);
                    };

                    scope.createRecord = function () {

                        scope.$broadcast(scope.es.broadcast.createRecord)
                    };


                    // PRIVATE API
                    scope._confirmUnsavedClose = function () {

                        if (scope['create-role'].$dirty) {
                            return confirm('Discard unsaved changes?');
                        } else {
                            return true;
                        }
                    };

                    scope._createRoleRecord = function () {

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


                    // HANDLE MESSAGES
                    scope.$on(scope.es.broadcast.closeRecord, function (e) {

                        if (scope._confirmUnsavedClose()) {
                            scope['create-role'].$setPristine();
                            scope.$emit(scope.es.emit.closeRecordSuccess);
                        }
                    });

                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, roleDataObj) {

                        if (roleDataObj.id === null) {
                            scope.active = true;
                            scope.role = angular.copy(scope.newRole);
                        }
                    });

                    scope.$on(scope.es.broadcast.createRecord, function (e) {

                        scope._createRoleRecord().then(
                            function (result) {

                                scope['create-role'].$setPristine();
                                scope.$emit(scope.es.emit.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.emit.createRecordError, error);
                            }
                        )

                    });

                }
            }
        }])
    .service('accessManagementEventsService', [function () {

        return {
            module: {
                broadcast: {
                    getRoles: 'get:roles',
                    getUsers: 'get:users',
                    getApps: 'get:apps'

                },
                emit: {
                    openModuleNavigation: 'open:modulenav'

                }
            },
            usersEvents: {
                broadcast: {
                    removeUsers: 'remove:users',
                    toggleAllUsers: 'select:all',
                    saveAllUsers: 'save:users:all',
                    createUser: 'create:user',
                    exportUsers: 'export:users',
                    importUsers: 'import:users',
                    saveAllUsersSuccess: 'save:users:success'
                },
                emit: {
                    getUsersSuccess: 'get:users:success',
                    getUsersError: 'get:users:error',
                    removeUsersSuccess: 'remove:users:success',
                    removeUsersError: 'remove:users:error',
                    saveAllUsersSuccess: 'save:users:success',
                    saveAllUsersError: 'save:users:error',
                    createUserSuccess: 'create:user:success',
                    createUserError: 'create:user:error'
                }
            },
            recordEvents: {
                broadcast: {
                    openRecord: 'open:record',
                    closeRecord: 'close:record',
                    saveRecord: 'save:record',
                    removeRecord: 'remove:record',
                    revertRecord: 'revert:record',
                    createRecord: 'create:record',
                    selectRecord: 'select:record',
                    openRecordSingle: 'open:record:single',
                    closeRecordSingle: 'close:record:single'


                },
                emit: {
                    openRecordSuccess: 'open:record:success',
                    closeRecordSuccess: 'close:record:success',
                    saveRecordSuccess: 'save:record:success',
                    removeRecordSuccess: 'remove:record:success',
                    revertRecordSuccess: 'revert:record:success',
                    createRecordSuccess: 'create:record:success',
                    createRecordError: 'create:record:error',
                    selectRecordSuccess: 'select:record:success'

                }
            },
            userEvents: {
                broadcast: {
                    openRecord: 'open:record',
                    closeRecord: 'close:record',
                    saveRecord: 'save:record',
                    removeRecord: 'remove:record',
                    revertRecord: 'revert:record',
                    createRecord: 'create:record',
                    selectRecord: 'select:record',
                    openRecordSingle: 'open:record:single',
                    closeRecordSingle: 'close:record:single'


                },
                emit: {
                    openRecordSuccess: 'open:record:success',
                    closeRecordSuccess: 'close:record:success',
                    saveRecordSuccess: 'save:record:success',
                    removeRecordSuccess: 'remove:record:success',
                    revertRecordSuccess: 'revert:record:success',
                    createUserSuccess: 'create:user:success',
                    createUserError: 'create:user:error',
                    selectRecordSuccess: 'select:record:success'

                }
            },
            rolesEvents: {

                broadcast: {

                },

                emit: {
                    getRolesSuccess: 'get:roles:success',
                    getRolesError: 'get:roles:error'
                }
            },
            selectRolesEvents: {

                broadcast: {},
                emit: {}
            },
            assignMassUsersEvents: {
                broadcast: {
                    assignRole: 'assign:role',
                    unassignRole: 'unassign:role'
                },
                emit: {
                    assignUsersRole: 'assign:users:role',
                    unassignUsersRole: 'unassign:users:role'

                }
            }
        }
    }])
    .service('accessManagementRulesService', [function () {

        return {
            allowMassAdminUserDeletion: false,
            allowMassRoleDeletion: true,
            allowMassGroupDeletion: true,
            recordsLimit: 100,
            recordsPerPage: 20,
            autoCloseUserDetail: true
        }
    }])
    .service('accessManagementDataService', [function () {


        var dataObjs = {};


        function _addDataObj(nameStr, dspDataObj) {

            dataObjs[nameStr] = dspDataObj;

            return !dataObjs[nameStr];
        }

        function _removeDataObj(nameStr) {

            delete dataObjs[nameStr];

            return !dataObjs[nameStr];
        }

        function _getDataObj(nameStr) {

            if (!dataObjs[nameStr]) {
                return false;
            } else {
                return dataObjs[nameStr];
            }
        }

        function _getDataObjs(nameArr) {

            var result = [];

            angular.forEach(nameArr, function (value, index) {

                if (dataObjs[value]) {
                    result.push(dataObjs[value]);
                } else {

                    return false;
                }
            });

            return result;
        }

        function _setDataObj(nameStr, dataObj) {

            if (!dataObj[nameStr]) {
                return false;
            }

            dataObj[nameStr] = dataObj;

            return !dataObj[nameStr];
        }


        return {

            addDataObj: function (nameStr, dspDataObj) {


                return _addDataObj(nameStr, dspDataObj);
            },


            removeDataObj: function (nameStr) {

                return _removeDataObj(nameStr);
            },

            getDataObj: function (nameStr) {

                return _getDataObj(nameStr);
            },

            getDataObjs: function (nameArr) {

                return _getDataObjs(nameArr);
            },

            setDataObj: function (nameStr, dataObj) {

                return _setDataObj(nameStr, dataObj);
            }




        };
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
    }]);


