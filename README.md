#angular-vm-ready

An Angular 1.x factory for a test utility which determines whether a controller view-model is ready 

## Installation

Requires [browserify](http://browserify.org/) or similar npm-based build system.

In the command line:

```
npm install angular-vm-ready --save
```

In your angular composition:

```javascript
angular.module('myModule', [])
  .factory('vmReady', require('angular-vm-ready'));
```

## Usage

```javascript
function controller($scope) {

  // TODO

}
```

