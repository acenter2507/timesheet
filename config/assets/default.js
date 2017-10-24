'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/font-awesome/css/font-awesome.css',
        'public/lib/angular-toastr/dist/angular-toastr.css',
        'public/lib/angular-loading-bar/build/loading-bar.css',
        'public/lib/ng-img-crop/compile/unminified/ng-img-crop.css',
        'public/lib/ng-dialog/css/ngDialog.min.css',
        'public/lib/ng-dialog/css/ngDialog-theme-default.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.3.20/angular-locale_ja-jp.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/underscore/underscore.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/moment/min/locales.min.js',
        'public/lib/moment-timezone/builds/moment-timezone.min.js',
        'public/lib/angular-moment/angular-moment.min.js',
        'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
        'public/lib/ng-dialog/js/ngDialog.min.js',
        'public/lib/angular-loading-bar/build/loading-bar.js',
        'public/lib/ng-img-crop/compile/unminified/ng-img-crop.js',
        'public/lib/angular-scroll/angular-scroll.js',
        'public/lib/angular-elastic/elastic.js',
        'public/lib/angular-breadcrumb/dist/angular-breadcrumb.js',
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
