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
                            limit: $scope.rs.recordsLimit
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
                            function (result) {
                                $scope.apps = $scope._addUIProperties(result.record);
                            },
                            function (reject) {

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

                    $scope.$on($scope.es.openModuleNavigation, function (e) {

                        $scope._toggleModuleNavigation();
                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.assignRole, function (e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.saveUsers, usersDataArr);
                    });

                    $scope.$on(accessManagementEventsService.assignMassUsersEvents.unassignRole, function (e, usersDataArr) {

                        $scope.$broadcast(accessManagementEventsService.usersEvents.saveUsers, usersDataArr);
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

                    scope._revertAllUsers = function () {

                        scope.$broadcast(accessManagementEventsService.userEvents.revertRecord)
                    };

                    scope._createUser = function () {

                        scope.newUser = scope._createUserModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.openRecordSingle, scope.newUser);
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

                    scope.$on(scope.es.saveUsers, function (e, usersDataObj) {

                        scope._saveUsers(usersDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.openRecordSuccess, function (e, userDataObj) {

                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.openRecordSingle, userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.closeRecordSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.recordEvents.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.removeRecordSuccess, function (e, userDataObj) {

                        scope._removeUsersData(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.saveRecordSuccess, function (e, userDataObj) {

                        scope._resetUserInArray(userDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.createRecordSuccess, function (e, userDataObj) {

                        scope._addUIProperties(userDataObj);
                        scope._addUser(userDataObj);
                    });


                    // WATCHERS AND INITIALIZATION


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
                    scope.active = false;
                    scope.id = 'roles';
                    scope.toggleAllRolesBool = false;
                    scope.limit = accessManagementRulesService.recordsLimit;
                    scope.topLevelNavigation = true;
                    scope.newRole = {};


                    // PUBLIC API
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

                        console.log(objsToSave);


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

                        scope.newRole = scope._createRoleModel();
                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.openRecordSingle, scope.newRole);
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

                    scope._revertAllRoles = function () {

                        scope.$broadcast(scope.es.revertAllRoles)
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

                    scope.$on(accessManagementEventsService.recordEvents.openRecordSuccess, function (e, roleDataObj) {

                        scope.topLevelNavigation = false;
                        scope.$broadcast(accessManagementEventsService.recordEvents.openRecordSingle, roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.closeRecordSuccess, function (e) {

                        scope.topLevelNavigation = true;
                        scope.$broadcast(accessManagementEventsService.recordEvents.closeRecordSingle);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.removeRecordSuccess, function (e, roleDataObj) {

                        scope._removeRolesData(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.createRecordSuccess, function (e, roleDataObj) {

                        scope._addUIProperties(roleDataObj);
                        scope._addRole(roleDataObj);
                    });

                    scope.$on(accessManagementEventsService.recordEvents.saveRecordSuccess, function (e, roleDataObj) {


                    })

                    // WATCHERS AND INITIALIZATION


                }
            }
        }])
/**
 *
 * Creates a user display object with a list and edit mode.
 *
 * @constant MODAUTH_ASSET_PATH
 * @service accessMangementEventsService
 * @service accessManagementRulesService
 * @service $q
 * @service DreamFactory
 */
    .directive('editUser', ['$q', 'MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', 'DreamFactory',
        function ($q, MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, DreamFactory) {
            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/edit-user.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    /**
                     * Short name for accessManagementEventsService.recordEvents
                     * @type {service}
                     */
                    scope.es = accessManagementEventsService.recordEvents;

                    /**
                     * Toggles view active in template
                     * @type {boolean}
                     */
                    scope.active = false;

                    /**
                     * Toggles view hidden when another role is active
                     * @type {boolean}
                     */
                    scope.singleUserActive = false;

                    /**
                     * Stores a copy of the role for the revert function
                     * @type {object}
                     */
                    scope.userCopy = {};

                    /**
                     * Store the form name
                     * @type {string}
                     */
                    scope.formName = 'user-edit-' + scope.user.id;


                    /**
                     * Copies the user for revert
                     */
                    scope.init = function () {

                        scope.userCopy = scope._copyRecord(scope.user);
                    };


                    // PUBLIC API
                    /*
                     The Public Api section is meant to interact with the template.
                     Each function calls it's private complement to actually do the work.
                     It's a little bit more overhead but we get a few things out of it.
                     1. We have a clean interface with an underlying implementation that can be changed easily
                     2. We can setup hooks for pre and post processing if we choose to.
                     */

                    /**
                     * Interface for opening a record
                     */
                    scope.openRecord = function () {

                        // Call complex implementation
                        scope._openRecord();
                    };

                    /**
                     * Interface for closing a record
                     */
                    scope.closeRecord = function () {

                        // Call complex implementation
                        scope._closeRecord();
                    };

                    /**
                     * Interface for saving a record
                     */
                    scope.saveRecord = function () {

                        // Call complex implementation
                        scope._saveRecord();
                    };

                    /**
                     * Interface for removing a record
                     */
                    scope.removeRecord = function () {

                        // Call complex implementation
                        scope._removeRecord();
                    };

                    /**
                     * Interface for reverting a record
                     */
                    scope.revertRecord = function () {

                        // Call complex implementation
                        scope._revertRecord();
                    };

                    /**
                     * Interface for selecting a record
                     */
                    scope.selectRecord = function () {

                        // Call complex implementation
                        scope._selectRecord();
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
                     * Wrapper for DreamFactory SDK function
                     *
                     * @param userDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
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

                    /**
                     * Wrapper for DreamFactory SDK function
                     *
                     * @param userDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
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

                    /**
                     * Get config auto close value
                     *
                     * @returns {boolean}
                     * @private
                     */
                    scope._checkAutoClose = function () {

                        return !!accessManagementRulesService.autoCloseUserDetail;

                    };

                    /**
                     * Check for unsaved changes.
                     * Sets scope.role.dfUIUnsaved
                     *
                     * @private
                     */
                    scope._checkUnsavedChanges = function () {

                        if (scope['user-edit-' + scope.user.id].$dirty) {
                            scope.user.dfUIUnsaved = true;
                        } else {
                            scope.user.dfUIUnsaved = false;
                        }
                    };

                    /**
                     * Create an angular copy
                     *
                     * @param roleDataObj
                     * @returns {roleDataObj}
                     * @private
                     */
                    scope._copyRecord = function (userDataObj) {

                        return angular.copy(userDataObj);
                    };

                    /**
                     * Sets the current user to the most recent copy of itself
                     *
                     * @private
                     */
                    scope._revertRecordData = function () {

                        scope.user = scope._copyRecord(scope.userCopy);
                    };

                    /**
                     * Toggle dfUISelected property on scope.user
                     *
                     * @private
                     */
                    scope._setRecordSelected = function () {

                        scope.user.dfUISelected = !scope.user.dfUISelected;
                    };


                    // COMPLEX IMPLEMENTATION
                    /*
                     The Complex Implementation section is where almost all of the heavy lifting
                     is done.  When the user requests an action through the Public Api...these
                     functions are the counterparts that make it happen.  For the most part we
                     try to use our Private Api to perform most of the functions.  However, sometimes
                     it just doesn't make sense to have a function set a value for us.
                     */

                    /**
                     * Sets active property to true.
                     *
                     * @emit openRecordSuccess
                     * @emitData scope.user
                     * @private
                     */
                    scope._openRecord = function () {

                        scope.active = true;
                        scope.$emit(scope.es.openRecordSuccess, scope.user);
                    };

                    /**
                     * Closes record
                     *
                     * @emit closeRecordSucess
                     * @private
                     */
                    scope._closeRecord = function () {

                        scope.$emit(scope.es.closeRecordSuccess);
                    };

                    /**
                     * Saves the User record
                     *
                     * @throws AccessManagement User Error
                     * @private
                     */
                    scope._saveRecord = function () {

                        scope._saveRecordToSystem(scope.user).then(
                            function (result) {

                                scope['user-edit-' + scope.user.id].$setPristine();
                                scope._checkUnsavedChanges();
                                scope.user = result;
                                scope.userCopy = result;

                                if (scope._checkAutoClose()) {
                                    scope.closeRecord();
                                }

                                scope.$emit(scope.es.saveRecordSuccess, result);
                            },
                            function (reject) {
                                console.log(reject);
                                throw 'Save Record Failed'
                            }
                        );
                    };

                    /**
                     * Removes record
                     *
                     * @throws AccessManagement User Error
                     * @private
                     */
                    scope._removeRecord = function () {

                        scope._removeRecordFromSystem(scope.user).then(
                            function (result) {
                                scope.$emit(scope.es.removeRecordSuccess, result);
                                scope.closeRecord();
                            },
                            function (reject) {
                                console.log(reject);
                            }
                        );

                    }

                    /**
                     * Reverts record to load or most recent saved state
                     *
                     * @private
                     */
                    scope._revertRecord = function () {

                        scope._revertRecordData();
                        scope['user-edit-' + scope.user.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.$emit(scope.es.revertRecordSuccess);
                    };

                    /**
                     * Selects record
                     *
                     * @emit selectRecordSuccess
                     * @private
                     */
                    scope._selectRecord = function () {

                        scope._setRecordSelected();
                        scope.$emit(scope.es.selectRecordSuccess)
                    };


                    // HANDLE MESSAGES
                    /*
                     The Handle Messages section does just that.  Here we handle inter-directive
                     communications.  **NOTE** We store our event names in the accessManagementEventsService
                     as they will appear in multiple places and if we choose to rename an event for any reason
                     we will only have to do so in one place.
                     */
                    /**
                     * Checks if this is the record the parent requests opened
                     */
                    scope.$on(scope.es.openRecordSingle, function (e, userDataObj) {

                        if (userDataObj.id !== scope.user.id) {
                            scope.singleUserActive = true;
                        }
                    });

                    /**
                     * Closes the record on parent request
                     */
                    scope.$on(scope.es.closeRecordSingle, function (e) {

                        scope._checkUnsavedChanges();
                        scope.singleUserActive = false;
                        scope.active = false;
                    });

                    /**
                     * Sets record to saved state on parent request
                     */
                    scope.$on(scope.es.saveRecord, function (e) {

                        scope['user-edit-' + scope.user.id].$setPristine();
                        scope._checkUnsavedChanges();
                        scope.userCopy = scope._copyRecord(scope.user);
                    });

                    /**
                     * Clean up when destroyed
                     */
                    scope.$on('$destroy', function () {

                    });


                    // INIT AND WATCHERS
                    /**
                     * Fire the init function
                     */
                    scope.init();
                }
            }
        }])
/**
 *
 * Creates a role display object with a list and edit mode.
 *
 * @constant MODAUTH_ASSET_PATH
 * @service accessMangementEventsService
 * @service accessManagementRulesService
 * @service $q
 * @service DreamFactory
 */
    .directive('editRole', ['MODAUTH_ASSET_PATH', 'accessManagementEventsService', 'accessManagementRulesService', '$q', 'DreamFactory',
        function (MODAUTH_ASSET_PATH, accessManagementEventsService, accessManagementRulesService, $q, DreamFactory) {

            return {
                restrict: 'E',
                templateUrl: MODAUTH_ASSET_PATH + 'views/edit-role.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    /**
                     * Short name for accessManagementEventsService.recordEvents
                     * @type {service}
                     */
                    scope.es = accessManagementEventsService.recordEvents;


                    /**
                     * Toggles view active in template
                     * @type {boolean}
                     */
                    scope.active = false;

                    /**
                     * Toggles view hidden when another role is active
                     * @type {boolean}
                     */
                    scope.singleRoleActive = false;

                    /**
                     * Stores a copy of the role for the revert function
                     * @type {object}
                     */
                    scope.roleCopy = {};

                    /**
                     * Store the form name
                     * @type {string}
                     */
                    scope.formName = 'role-edit-' + scope.role.id;


                    /**
                     * Copies the role for revert
                     */
                    scope.init = function () {

                        scope.roleCopy = scope._copyRecord(scope.role);
                    };


                    // PUBLIC API
                    /*
                        The Public Api section is meant to interact with the template.
                        Each function calls it's private complement to actually do the work.
                        It's a little bit more overhead but we get a few things out of it.
                        1. We have a clean interface with an underlying implementation that can be changed easily
                        2. We can setup hooks for pre and post processing if we choose to.
                    */

                    /**
                     * Interface for opening a record
                     */
                    scope.openRecord = function () {

                        // Call complex implementation
                        scope._openRecord();
                    };

                    /**
                     * Interface for closing a record
                     */
                    scope.closeRecord = function () {

                        // Call complex implementation
                        scope._closeRecord();
                    };

                    /**
                     * Interface for saving a record
                     */
                    scope.saveRecord = function () {

                        // Call complex implementation
                        scope._saveRecord();
                    };

                    /**
                     * Interface for removing a record
                     */
                    scope.removeRecord = function () {

                        // Call complex implementation
                        scope._removeRecord();
                    };

                    /**
                     * Interface for reverting a record
                     */
                    scope.revertRecord = function () {

                        // Call complex implementation
                        scope._revertRecord();
                    };

                    /**
                     * Interface for selecting a record
                     */
                    scope.selectRecord = function () {

                        // Call complex implementation
                        scope._selectRecord();
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
                     * Wrapper for DreamFactory SDK function
                     *
                     * @param roleDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._saveRecordToSystem = function (roleDataObj) {

                        // Create a deferred object
                        var defer = $q.defer();

                        // Call DreamFactory SDK method
                        DreamFactory.api.system.updateRole(
                            scope._makeRequest(roleDataObj, '*'),
                            function (data) {

                                // resolve promise
                                defer.resolve(data);
                            },
                            function (error) {

                                // reject promise
                                defer.reject(error);
                            }
                        );

                        // return promise
                        return defer.promise;
                    };

                    /**
                     * Wrapper for DreamFactory SDK function
                     *
                     * @param roleDataObj
                     * @returns {promise|Promise.promise|exports.promise|Q.promise}
                     * @private
                     */
                    scope._removeRecordFromSystem = function (roleDataObj) {

                        // Create a deferred object
                        var defer = $q.defer();

                        // Call DreamFactory SDK method
                        DreamFactory.api.system.deleteRole(
                            scope._makeRequest(roleDataObj, '*'),
                            function (data) {

                                // resolve promise
                                defer.resolve(data);
                            },
                            function (error) {

                                // reject promise
                                defer.reject(error);
                            }
                        );

                        // return promise
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

                        // check if form is $dirty
                        if (scope['role-edit-' + scope.role.id].$dirty) {

                            // it is.  Set dfUIUnsaved property
                            scope.role.dfUIUnsaved = true;
                        } else {

                            // it's not.  Set dfUIUnsaved property
                            scope.role.dfUIUnsaved = false;
                        }
                    };

                    /**
                     * Create an angular copy
                     *
                     * @param roleDataObj
                     * @returns {roleDataObj}
                     * @private
                     */
                    scope._copyRecord = function (roleDataObj) {

                        return angular.copy(roleDataObj);
                    };

                    /**
                     * Sets the current role to the most recent copy of itself
                     *
                     * @private
                     */
                    scope._revertRecordData = function () {

                        scope.role = scope._copyRecord(scope.roleCopy);
                    };

                    /**
                     * Toggle dfUISelected property on scope.role
                     *
                     * @private
                     */
                    scope._setRecordSelected = function () {

                        scope.role.dfUISelected = !scope.role.dfUISelected;
                    };


                    // COMPLEX IMPLEMENTATION
                    /*
                        The Complex Implementation section is where almost all of the heavy lifting
                        is done.  When the user requests an action through the Public Api...these
                        functions are the counterparts that make it happen.  For the most part we
                        try to use our Private Api to perform most of the functions.  However, sometimes
                        it just doesn't make sense to have a function set a value for us.
                     */

                    /**
                     * Sets active property to true.
                     *
                     * @emit openRecordSuccess
                     * @emitData scope.role
                     * @private
                     */
                    scope._openRecord = function () {

                        // Set active to true
                        scope.active = true;

                        // Emit message to parent to ask other roles to hide.
                        scope.$emit(scope.es.openRecordSuccess, scope.role);
                    };

                    /**
                     * Closes record
                     *
                     * @emit closeRecordSucess
                     * @private
                     */
                    scope._closeRecord = function () {

                        // Emit message to parent to show other records
                        scope.$emit(scope.es.closeRecordSuccess);
                    };

                    /**
                     * Saves the Role record
                     *
                     * @throws AccessManagement Roles Error
                     * @private
                     */
                    scope._saveRecord = function () {

                        // Pass in our role to save to the system
                        // this will return a promise that we have to handle
                        scope._saveRecordToSystem(scope.role).then(

                            // Success
                            function (result) {

                                // Broadcast a message to child directives that we are saving
                                // and they should run their save routines
                                scope.$broadcast(scope.es.saveRecord);

                                // Set the form to pristine
                                scope['role-edit-' + scope.role.id].$setPristine();

                                // check if the form is pristine
                                // if so sets dfUIUnsaved property to false
                                scope._checkUnsavedChanges();

                                // Update the local copies of the record
                                scope.role = result;

                                // use _copyRecord so we don;t just get a reference
                                scope.copyRole = scope._copyRecord(result);


                                // Should we auto close
                                if (scope._checkAutoClose()) {

                                    // we should
                                    scope.closeRecord();
                                }

                                // Let the parents know we were successful
                                scope.$emit(scope.es.saveRecordSuccess, result);
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
                    scope._removeRecord = function () {

                        // Pass our role to the remove function
                        // and handle the returned promise
                        scope._removeRecordFromSystem(scope.role).then(

                            // Success
                            function (result) {

                                // Let the parent know we were successful in removing ourselves
                                scope.$emit(scope.es.removeRecordSuccess, result);

                                // The record no longer exists so it should be closed.
                                scope.closeRecord();
                            },

                            // Error
                            function (reject) {

                                throw 'AccessManagement Roles Error: ' + reject.error[0].message
                            }
                        );
                    }

                    /**
                     * Reverts record to load or most recent saved state
                     *
                     * @private
                     */
                    scope._revertRecord = function () {

                        // set the working scope.role to the backup scope.roleCopy
                        scope._revertRecordData();

                        // Let the children directives know they should run their
                        // revert routines
                        scope.$broadcast(scope.es.revertRecord);

                        // set the form to a pristine state
                        scope['role-edit-' + scope.role.id].$setPristine();

                        // check to make sure the form is pristine
                        // if so set scope.role.dfUIUnsaved to false
                        scope._checkUnsavedChanges();
                    };


                    /**
                     * Selects record
                     *
                     * @emit selectRecordSuccess
                     * @private
                     */
                    scope._selectRecord = function () {

                        // toggle the records select status
                        scope._setRecordSelected();
                    };


                    // HANDLE MESSAGES
                    /*
                        The Handle Messages section does just that.  Here we handle inter-directive
                        communications.  **NOTE** We store our event names in the accessManagementEventsService
                        as they will appear in multiple places and if we choose to rename an event for any reason
                        we will only have to do so in one place.
                     */
                    /**
                     * Checks if this is the record the parent requests opened
                     */
                    scope.$on(scope.es.openRecordSingle, function (e, roleDataObj) {

                        // if the role's id that is to be edited matches this role's id
                        if (roleDataObj.id !== scope.role.id) {

                            // set true
                            // Everyone else will be false by default
                            scope.singleRoleActive = true;
                        }
                    });

                    /**
                     * Closes the record on parent request
                     */
                    scope.$on(scope.es.closeRecordSingle, function (e) {

                        // check to make sure the form is pristine
                        // if so set scope.role.dfUIUnsaved to false
                        scope._checkUnsavedChanges();

                        // set these to false
                        // we are no longer the active role for editing
                        scope.singleRoleActive = false;
                        scope.active = false;
                    });

                    /**
                     * Sets record to saved state on parent request
                     */
                    scope.$on(accessManagementEventsService.rolesEvents.saveAllRolesSuccess, function (e) {

                        // Broadcast a message to child directives that we are saving
                        // and they should run their save routines
                        scope.$broadcast(scope.es.saveRecord);

                        // Set the form to pristine
                        scope['role-edit-' + scope.role.id].$setPristine();

                        // check if the form is pristine
                        // if so this sets dfUIUnsaved property to false
                        scope._checkUnsavedChanges();

                        // Update the local copies of the record
                        scope.role = result;

                        // use _copyRecord so we don;t just get a reference
                        scope.copyRole = scope._copyRecord(result);
                    });

                    /**
                     * Reverts role to load or most recent saved state
                     */
                    scope.$on(accessManagementEventsService.rolesEvents.revertAllRoles, function(e) {

                        // Call revert routine
                        scope._revertRecord();
                    });

                    /**
                     * Clean up when destroyed
                     */
                    scope.$on('$destroy', function () {

                    });


                    // INIT AND WATCHERS
                    /**
                     * Fire the init function
                     */
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
                require: '^form',
                templateUrl: MODAUTH_ASSET_PATH + 'views/mass-assign-users.html',
                scope: true,
                link: function (scope, elem, attrs, form) {

                    scope.totalSelectedUsers = 0;

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

                        scope._assignRole();
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
                            if (obj.role_id != scope.role.id) {

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
                    scope._getSelectedUsersWithOutRole = function () {

                        var selectedUsers = [];

                        angular.forEach(scope.usersWithOutRole, function (obj) {

                            if (obj.dfUISelected) {
                                obj.dfUIUnsaved = true;
                                obj.role_id = scope.role.id;
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

                    scope.$on('$destroy', function(e) {
                        watchUsers.call();
                        watchSelected.call();
                    });


                    // HANDLE MESSAGES

                    // Listen for parent to save record
                    scope.$on(accessManagementEventsService.recordEvents.saveRecord, function(e) {

                        // check if we have and users selected
                        if (scope.totalSelectedUsers > 0) {

                            // we do so run the role asign/unassign functions
                            scope._assignRole();
                            scope._unassignRole();
                        }
                    });

                    // Listen for parent to revert the record
                    scope.$on(accessManagementEventsService.recordEvents.revertRecord, function(e) {

                        // Message received so loop through the users
                        angular.forEach(scope.massAssignUsers, function(obj) {

                            // if we find one that is selected
                            if (obj.dfUISelected) {

                                // toggle the selection
                                scope._toggleUserSelected(obj);
                            }
                        })
                    });


                    // WATCHERS AND INIT

                    // watch scope.users from the top module
                    var watchUsers = scope.$watchCollection('users', function (newValue, oldValue) {

                        // make a local copy of the users
                        scope.massAssignUsers = angular.copy(newValue);

                        // sort the users into two groups.
                        // Ones that have the current role and ones that don't
                        scope.__sortUsers(scope.massAssignUsers);
                    });

                    // watch the totalSelectedUsers value
                    var watchSelected = scope.$watch('totalSelectedUsers', function (newValue, oldValue) {

                        // If it changes and its not equal to 0
                        if (newValue !== 0) {

                            // we set the form to dirty because it will trigger the
                            // role editor to do what it needs to with the dfUIUnsaved
                            // state on save/revert
                            form.$setDirty();

                            // we also set the dfUIUnsaved to trigger the UI unsaved state
                            // basically turn the role record orange in the UI
                            scope.dfUIUnsaved = true;
                        }
                    });
                }
            }
        }])
    .directive('selectApp', ['MODAUTH_ASSET_PATH', function (MODAUTH_ASSET_PATH) {
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


                    // COMPLEX IMPLEMENTATION
                    scope._closeRecord = function () {

                        scope['create-user'].$setPristine();
                        scope.$emit(scope.es.closeRecordSuccess);
                    };

                    scope._createRecord = function () {

                        scope._createUserRecord().then(
                            function (result) {

                                scope['create-user'].$setPristine();
                                scope.$emit(scope.es.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.createRecordError, error);
                            });
                    };


                    // HANDLE MESSAGES
                    scope.$on(scope.es.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.openRecordSingle, function (e, userDataObj) {

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
                            scope.$emit(scope.es.closeRecordSuccess);
                        }
                    };

                    scope._createRecord = function () {

                        scope._createRoleRecord().then(
                            function (result) {

                                scope['create-role'].$setPristine();
                                scope.$emit(scope.es.createRecordSuccess, result.record[0]);
                                scope.closeRecord();
                            },
                            function (reject) {

                                console.log(reject);
                                scope.$emit(scope.es.createRecordError, error);
                            });
                    };

                    scope.$on(scope.es.closeRecordSingle, function (e) {

                        scope.active = false;
                    });

                    scope.$on(scope.es.openRecordSingle, function (e, roleDataObj) {

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
            recordEvents: {
                openRecordSingle: 'open:record:single',
                closeRecordSingle: 'close:record:single',
                openRecord: 'open:record',
                removeRecord: 'remove:record',
                revertRecord: 'revert:record',
                selectRecord: 'select:record',
                saveRecord: 'save:record',
                closeRecord: 'close:record',
                createRecord: 'create:record',
                openRecordSuccess: 'open:record:success',
                closeRecordSuccess: 'close:record:success',
                saveRecordSuccess: 'save:record:success',
                removeRecordSuccess: 'remove:record:success',
                revertRecordSuccess: 'revert:record:success',
                createRecordSuccess: 'create:record:success',
                createRecordError: 'create:record:error',
                selectRecordSuccess: 'select:record:success'

            },
            selectRolesEvents: {

            },
            assignMassUsersEvents: {
                assignRole: 'assign:role',
                unassignRole: 'unassign:role'
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


