'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-toastr/dist/angular-toastr.min.css',
        'public/lib/angular-loading-bar/build/loading-bar.min.css',
        'public/lib/ng-img-crop/compile/minified/ng-img-crop.css',
        'public/lib/ng-dialog/css/ngDialog.min.css',
        'public/lib/ng-dialog/css/ngDialog-theme-default.min.css',
        'public/lib/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css',
        'public/lib/ng-tags-input/ng-tags-input.min.css'
      ],
      js: [
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/angular-file-upload.min.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};
