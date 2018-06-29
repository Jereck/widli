const app = angular.module("adminApp", ["ngRoute"]);

app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl : "/admin/dashboard.ejs"
    })
    .when("/upload", {
        templateUrl : "/admin/upload.ejs"
    });
});