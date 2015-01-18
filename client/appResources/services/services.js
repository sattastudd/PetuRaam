'use strict';

define(
		[ 'angular', '../require/route-config' ],
		function(angular, routeConfig, lazyDirectives) {
			return angular
					.module(
							'khanaShanaApp',
							[ 'ngRoute', 'khanaShanaDirectives', 'ui.bootstrap'],
							function($compileProvider, $controllerProvider) {
								routeConfig.setCompileProvider($compileProvider);
								routeConfig.setControllerProvider($controllerProvider);
							})
		});