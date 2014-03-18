'use strict';

angular.module('adminApp')
    .controller('NavigationCtrl', ['$scope', 'ModuleInstallerCollection',
        function ($scope, ModuleInstallerCollection) {

            $scope.links = ModuleInstallerCollection.getModules();
        }])
    .controller('MainCtrl', ['$scope', '$location',
        function ($scope, $location) {


            $scope.$on('user:login:success', function(e) {

                $location.url('/access-management')
            })
        }]);
