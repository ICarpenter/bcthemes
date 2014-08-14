angular.module('Bctheme', ['Bctheme.templates', 'ui.bootstrap'])
    .config(function ($locationProvider, $anchorScrollProvider) {
        $locationProvider.html5Mode(true);
        $anchorScrollProvider.disableAutoScrolling();
    });
