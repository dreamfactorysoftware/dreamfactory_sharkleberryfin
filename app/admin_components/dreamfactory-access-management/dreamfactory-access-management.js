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
    .directive('accessManagement', ['MODAUTH_ASSET_PATH', '$q', 'DreamFactory', 'accessManagementEventsService', 'accessManagementRulesService',
        function (MODAUTH_ASSET_PATH, $q, DreamFactory, accessManagementEventsService, accessManagementRulesService) {

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
                    $scope.rs = accessManagementRulesService;


                    // INIT DEF
                    $scope.init = function () {
                        if (DreamFactory.isReady()) {
                            $scope._getRoles();
                            $scope._getUsers();
                            $scope._getApps();
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

                    $scope._toggleEachRecord = function (dataObj, bool) {

                        angular.forEach(dataObj, function (value, index) {
                            value['dfUISelected'] = bool;
                        });
                    };

                    $scope._getRolesData = function (requestObj) {

                        var defer = $q.defer();

                        requestObj = requestObj || {
                            fields: '*',
                            limit: scope.rs.recordsLimit
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
                            function(result) {
                                $scope.apps = $scope._addUIProperties(result.record);
                            },
                            function(reject) {

                                // TODO: AppService doesn't return an error
                                throw 'AccessManagement Module Error: ' + reject.error[0].message
                            });
                    };


                    // HANDLE MESSAGES
                    $scope.$on('api:ready', function (e) {
                        $scope.init();
                    });

                    $scope.$on('view:changed', function (e, viewIdStr) {

                        $scope.activeView = viewIdStr;
                        $scope.toggleModuleNavigationBool = true;
                    });

                    $scope.$on($scope.es.emit.openModuleNavigation, function (e) {

                        $scope._toggleModuleNavigation();
                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.emit.assignUsersRole, function(e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.broadcast.saveUsers, usersDataArr);
                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.emit.unassignUsersRole, function(e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.broadcast.saveUsers,usersDataArr);
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
                    scope.openModuleNavigation = function () {

                        scope.$emit(accessManagementEventsService.module.emit.openModuleNavigation);
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
                    scope._removeUsersFromSystem = function (dataObj) {

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
                        if (idsForRemoval.length === 0) {
                            throw 'removeUsersFromSystem Error: No users selected for removal.'
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
                            throw 'saveUsersToSystem Error: No users selected for save.'
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
                    scope._removeUsers = function () {

                        scope._removeUsersFromSystem(scope.users).then(
                            function (result) {
                                angular.forEach(result.record, function (userDataObj) {
                                    scope._removeUsersData(userDataObj)
                                });
                                scope.$emit(scope.es.emit.removeUsersSuccess);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'AccessManagement Users Request Error: ' + reject.error[0].message;
                            }
                        )
                    };

                    scope._toggleAllUsers = function() {

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

                    scope._revertAllUsers = function() {

                        scope.$broadcast(accessManagementEventsService.userEvents.broadcast.revertRecord)
                    };

                    scope._createUser = function() {

                        scope.newUser = scope._createUserModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, scope.newUser);
                    };

                    // Part of fix export
                    scope._exportUsers = function() {
                        console.log('Export Users');
                        // scope._exportUsersData()
                    };

                    // Part of user import
                    scope._importUsers = function() {
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

                    scope.$on(scope.es.broadcast.saveUsers, function(e, usersDataObj) {

                        scope._saveUsers(usersDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.openRecordSuccess, function (e, userDataObj) {

                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.closeRecordSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.removeRecordSuccess, function (e, userDataObj) {

                        scope._removeUsersData(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.saveRecordSuccess, function (e, userDataObj) {

                        scope._resetUserInArray(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.createRecordSuccess, function (e, userDataObj) {

                        scope._addUIProperties(userDataObj);
                        scope._addUser(userDataObj);
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

                        // @TODO Add Confirm Delete Code
                        scope._removeRoles();
                    };

                    scope.exportRoles = function () {

                        scope._exportRoles();
                    };

                    scope.importRoles = function () {

                        scope._importRoles();
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
                    scope._exportRolesData = function () {};

                    // TODO: Add User Import
                    scope._importRolesData = function () {};



                    // COMPLEX IMPLEMENTATION
                    scope._createRole = function () {

                        scope.newRole = scope._createRoleModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, scope.newRole);
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
                                    scope._resetRoleInArray(roleDataObj);
                                })
                            },
                            function (reject) {

                                console.log(reject);
                                throw 'saveRolesToSystem Request Failed: ' + reject.error[0].message
                            }
                        );
                    };

                    scope._revertAllRoles = function() {

                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.revertRecord)
                    };

                    scope._removeRoles = function (rolesDataArr) {

                        rolesDataArr = rolesDataArr || scope.roles;

                        scope._removeRolesFromSystem(rolesDataArr).then(
                            function (result) {
                                angular.forEach(result.record, function (roleDataObj) {
                                    scope._removeRolesData(roleDataObj)
                                });
                                scope.$emit(scope.es.emit.removeUsersSuccess);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'AccessManagement Roles Request Error: ' + reject.error[0].message;
                            }
                        )
                    };

                    // Part of fix export
                    scope._exportRoles = function() {
                        console.log('Export Roles');
                        // scope._exportUsersData()
                    };

                    // Part of user import
                    scope._importRoles = function() {
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

                    scope.$on(accessManagementEventsService.recordEvents.emit.openRecordSuccess, function (e, roleDataObj) {

                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.openRecordSingle, roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.closeRecordSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.recordEvents.broadcast.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.removeRecordSuccess, function (e, roleDataObj) {

                        scope._removeRolesData(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.createRecordSuccess, function (e, roleDataObj) {

                        scope._addUIProperties(roleDataObj);
                        scope._addRole(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.emit.saveRecordSuccess, function (e, roleDataObj) {


                    })

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


                    // INIT DEF
                    scope.init = function () {

                        scope.userCopy = scope._copyRecord(scope.user);
                    };


                    // PUBLIC API
                    scope.openRecord = function () {

                        scope._openRecord();
                    };

                    scope.closeRecord = function () {

                        scope._closeRecord();
                    };

                    scope.saveRecord = function () {

                        scope._saveRecord();
                    };

                    scope.removeRecord = function () {

                        scope._removeRecord();
                    };

                    scope.revertRecord = function () {

                        scope._revertRecord();
                    };

                    scope.selectRecord = function () {

                        scope._selectRecord();
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

                    scope._saveRecordToSystem = function (userDataObj) {

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

                    scope._removeRecordFromSystem = function (userDataObj) {

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

                    scope._revertRecordData = function () {

                        scope.user = scope._copyRecord(scope.userCopy);
                    };

                    scope._setRecordSelected = function () {

                        scope.user.dfUISelected = !scope.user.dfUISelected;
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._openRecord = function() {

                        scope.active = true;
                        scope.$emit(scope.es.emit.openRecordSuccess, scope.user);
                    };

                    scope._closeRecord = function () {

                        scope.$emit(scope.es.emit.closeRecordSuccess);
                    };

                    scope._saveRecord = function() {

                        scope._saveRecordToSystem(scope.user).then(
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
                                throw 'Save Record Failed'
                            }
                        );
                    };

                    scope._removeRecord = function () {

                        scope._removeRecordFromSystem(scope.user).then(
                            function (result) {
                                scope.$emit(scope.es.emit.removeRecordSuccess, result);
                                scope.closeRecord();
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );

                    }

                    scope._revertRecord = function () {

                        scope._revertRecordData();
                        scope['user-edit-' + scope.user.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.emit.revertRecordSuccess);
                    };

                    scope._selectRecord = function() {

                        scope._setRecordSelected();
                        scope.$emit(scope.es.emit.selectRecordSuccess)
                    };


                    // HANDLE MESSAGES
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

                    scope.init = function () {

                        scope.roleCopy = scope._copyRecord(scope.role);
                    };


                    // PUBLIC API
                    scope.openRecord = function () {

                        scope._openRecord();
                    };

                    scope.closeRecord = function () {

                        scope._closeRecord();
                    };

                    scope.saveRecord = function () {

                        scope._saveRecord();
                    };

                    scope.removeRecord = function () {

                        scope._removeRecord();
                    };

                    scope.revertRecord = function () {

                        scope._revertRecord();
                    };

                    scope.selectRecord = function () {

                        scope._selectRecord();
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

                    scope._saveRecordToSystem = function (roleDataObj) {

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

                    scope._removeRecordFromSystem = function (roleDataObj) {

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

                    scope._revertRecordData = function () {

                        scope.role = scope._copyRecord(scope.roleCopy);
                    };

                    scope._setRecordSelected = function () {

                        scope.role.dfUISelected = !scope.role.dfUISelected;
                    };



                    // COMPLEX IMPLEMENTATION
                    scope._openRecord = function () {

                        scope.active = true;
                        scope.$emit(scope.es.emit.openRecordSuccess, scope.role);
                    };

                    scope._closeRecord = function () {

                        scope.$emit(scope.es.emit.closeRecordSuccess);
                    };

                    scope._saveRecord = function () {

                        scope._saveRecordToSystem(scope.role).then(
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
                                throw 'AccessManagement Roles Error: ' + reject.error[0].message
                            }
                        );
                    };

                    scope._removeRecord = function () {

                        scope._removeRecordFromSystem(scope.role).then(
                            function (result) {
                                scope.$emit(scope.es.emit.removeRecordSuccess, result);
                                scope.closeRecord();
                            },
                            function (reject) {

                                throw 'AccessManagement Roles Error: ' + reject.error[0].message
                            }
                        );
                    }

                    scope._revertRecord = function () {

                        scope._revertRecordData();
                        scope['role-edit-' + scope.role.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.emit.revertRecordSuccess);
                    };

                    scope._selectRecord = function () {

                        scope._setRecordSelected();
                        scope.$emit(scope.es.emit.selectRecordSuccess)
                    };



                    // HANDLE MESSAGES
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

                    scope.$on(accessManagementEventsService.rolesEvents.broadcast.saveAllRolesSuccess, function (e) {

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

                        scope._toggleUserSelected(userDataObj);
                    };

                    scope.assignRole = function () {

                        scope.$broadcast(scope.es.broadcast.assignRole);
                    };

                    scope.unassignRole = function () {

                        scope._unassignRole();
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

                    // Toggle user to be modified
                    scope._toggleUserSelectedData = function(userDataObj) {
                        userDataObj.dfUISelected = !userDataObj.dfUISelected
                    };




                    // COMPLEX IMPLEMENTATION
                    // Function to toggle user selected
                    scope._toggleUserSelected = function (userDataObj) {

                        scope._toggleUserSelectedData(userDataObj);
                    };

                    // Function to assign the role
                    scope._assignRole = function () {

                        // Tell the main parent Directive Controller to save the selected users with the current role.
                        scope.$emit(scope.es.emit.assignUsersRole, scope._getSelectedUsersWithOutRole());
                    };

                    // Function to unassign the role
                    scope._unassignRole = function () {

                        // Tell the main parent Directive Controller to save the selected users with the current role removed
                        scope.$emit(scope.es.emit.unassignUsersRole, scope._getSelectedUsersWithRole())
                    };




                    // HANDLE MESSAGES


                    // @todo Prompt or unselect selected users on record close.

                    // @todo Run role assign and unassign on record save.



                    // WATCHERS AND INIT
                    var watchUsers = scope.$watchCollection('users', function (newValue, oldValue) {
                        scope.massAssignUsers = angular.copy(scope.users);
                        scope.__sortUsers(scope.massAssignUsers);
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

                        if (scope._confirmUnsavedClose()) {
                            scope._closeRecord();
                        }
                    };

                    scope.createRecord = function () {

                        scope._createRecord();
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


                    // COMPLEX IMPLEMETATION
                    scope._closeRecord = function () {

                        scope['create-user'].$setPristine();
                        scope.$emit(scope.es.emit.closeRecordSuccess);
                    };

                    scope._createRecord = function () {

                        scope._createUserRecord().then(
                            function (result) {

                                scope['create-user'].$setPristine();
                                scope.$emit(scope.es.emit.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.emit.createRecordError, error);
                            });
                    };


                    // HANDLE MESSAGES
                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, userDataObj) {

                        if (userDataObj.id === null) {
                            scope.active = true;
                            scope.user = angular.copy(scope.newUser);
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
                scope: true,
                link: function (scope, elem, attrs) {

                    scope.es = accessManagementEventsService.recordEvents;

                    scope.active = false;
                    scope.singleRoleActive = false;


                    // PUBLIC API
                    scope.closeRecord = function () {

                        scope._closeRecord();
                    };

                    scope.createRecord = function () {

                        scope._createRecord();
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
                    scope._closeRecord = function () {

                        if (scope._confirmUnsavedClose()) {
                            scope['create-role'].$setPristine();
                            scope.$emit(scope.es.emit.closeRecordSuccess);
                        }
                    };

                    scope._createRecord = function () {

                        scope._createRoleRecord().then(
                            function (result) {

                                scope['create-role'].$setPristine();
                                scope.$emit(scope.es.emit.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.emit.createRecordError, error);
                            });
                    };

                    scope.$on(scope.es.broadcast.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.broadcast.openRecordSingle, function (e, roleDataObj) {

                        if (roleDataObj.id === null) {
                            scope.active = true;
                            scope.role = angular.copy(scope.newRole);
                        }
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
                    saveUsers: 'save:users',
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
            rolesEvents: {
                broadcast: {
                    removeRoles: 'remove:roles',
                    toggleAllRoles: 'select:all',
                    saveRoles: 'save:Roles',
                    createRole: 'create:role',
                    exportRoles: 'export:roles',
                    importRoles: 'import:roles',
                    saveAllRolesSuccess: 'save:roles:success'
                },
                emit: {
                    getRolesSuccess: 'get:roles:success',
                    getRolesError: 'get:roles:error',
                    removeRolesSuccess: 'remove:roles:success',
                    removeRolesError: 'remove:roles:error',
                    saveAllRolesSuccess: 'save:roles:success',
                    saveAllRolesError: 'save:roles:error',
                    createRoleSuccess: 'create:role:success',
                    createRoleError: 'create:role:error'
                }
            },
            recordEvents: {
                broadcast: {
                    openRecordSingle: 'open:record:single',
                    closeRecordSingle: 'close:record:single',
                    openRecord: 'open:record',
                    removeRecord: 'remove:record',
                    revertRecord: 'revert:record',
                    selectRecord: 'select:record',
                    saveRecord: 'save:record',
                    closeRecord: 'close:record',
                    createRecord: 'create:record'
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


