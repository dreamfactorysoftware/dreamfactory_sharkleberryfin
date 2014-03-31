'use strict';

angular.module('adminApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngDreamFactory',
        'dfModuleInstaller',
        'dfAccessManagement',
        'dfUserManagement'
    ])
    //.constant('DSP_URL', 'https://dsp-mnmandato.cloud.dreamfactory.com')
    //.constant('DSP_URL', 'https://next.cloud.dreamfactory.com')
    .constant('DSP_URL', 'http://localhost:8081')

    .constant('DSP_API_KEY', 'admin')
    .config(['$routeProvider', function($routeProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise('/');

    }]);
