'use strict';


angular.module('dfModuleInstaller', ['ngRoute','ngDreamFactory'])
    .constant('MODINST_ROUTER_PATH', '/module-installer')
    .constant('MODINST_ASSET_PATH', 'admin_components/dreamfactory-module-installer/')
    .config(['$routeProvider', 'MODINST_ROUTER_PATH', 'MODINST_ASSET_PATH',
        function ($routeProvider, MODINST_ROUTER_PATH, MODINST_ASSET_PATH) {

            $routeProvider.when(MODINST_ROUTER_PATH, {
                templateUrl: MODINST_ASSET_PATH + 'views/main.html'
            });
        }])
    .controller('ModuleInstallerCtrl', ['$scope', [function () {


    }]])
    .directive('moduleInstaller', ['MODINST_ASSET_PATH', 'DreamFactory', 'ModuleInstallerCollection',
        function (MODINST_ASSET_PATH, DreamFactory, ModuleInstallerCollection) {

            return {

                restrict: 'E',
                controller: function ($scope) {

                    // Store DreamFactory Service on $scope so
                    // all child directives have access to it
                    $scope.DreamFactory = DreamFactory;

                    // Store ModuleInstallerCollection on $scope so
                    // all child directives have access
                    $scope.ModuleInstallerCollection = ModuleInstallerCollection;


                    $scope.$on('get:modules', function (e) {

                        return ModuleInstallerCollection.getModules();
                    });


                },
                templateUrl: MODINST_ASSET_PATH + 'views/module-installer.html',
                link: function (scope, elem, attrs) {

                }
            }
        }])
    .directive('moduleList', ['MODINST_ASSET_PATH', function (MODINST_ASSET_PATH) {

        return {

            restrict: 'E',
            require: '^?ModuleInstaller',
            scope: {},
            templateUrl: MODINST_ASSET_PATH +'views/module-list.html',
            link: function (scope, elem, attrs) {


            }
        };


    }])
    .directive('moduleUploader', ['MODINST_ASSET_PATH', function (MODINST_ASSET_PATH) {

        return {

            restrict: 'E',
            require: '^?ModuleInstaller',
            scope: {},
            templateUrl: MODINST_ASSET_PATH + 'views/module-uploader.html',
            link: function (scope, elem, attrs) {


            }
        };
    }])
    .service('ModuleInstallerCollection', [function () {

        var counter = 0;
        var modulesData = {
            length: 4,

            0: {
                installerId: 0,
                name: 'Installer',
                path: '/module-installer'
            },
            1: {
                installerId: 1,
                name: 'Access',
                path: '/access-management'
            },
            2: {
                installerId: 2,
                name: 'Applications',
                path: '/applications'
            },
            3: {
                installerId: 3,
                name: 'User',
                path: '/user-management'
            }
        };

        function _incrementCounter() {

            counter++
        }

        function _decrementCounter() {

            counter--
        }

        function _getCounter() {

            return counter;
        }


        function _getModules() {

            return modulesData;
        }

        function _addModule(module) {

            modulesData[module.installerId] = module;
            modulesData.length++
        }

        function _removeModule(id) {

            delete modulesData[id];
            modulesData.length--;
        }


        return {

            getModules: function () {

                return _getModules();
            },

            addModule: function (module) {

                module['installerId'] = _getCounter();
                _addModule(module);
                _incrementCounter();
            },

            removeModule: function (moduleId) {

                _removeModule(moduleId);
            }
        }
    }]);