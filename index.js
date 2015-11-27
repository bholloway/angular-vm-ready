var assign = require('lodash.assign');

/**
 * An Angular 1.x factory for a test utility which determines whether a controller view-model is ready.
 * @ngInject
 * @returns {function} A factory for a test method
 */
function angularVmReadyFactory($timeout) {

  /**
   * Create a test mether that will check whether the view-model is ready.
   * @param {object} vm The object containing the fields to be observed
   * @param {string|Array.<string>} fields A list of view model fields that need to be truthy
   * @returns {function():boolean} A function that checks whether the vm is ready and sets the flag where given
   */
  return function angularVmReady(vm, fields) {
    var fieldList   = [].concat(fields).filter(isString),
        flag        = false,
        delayAssert = NaN,
        delayNegate = NaN,
        logger      = noop,
        lastChange  = 0,
        timeout;

    var self = assign(testReady, {
      withLogger     : withLogger,
      withFlag       : withFlag,
      withAssertDelay: withAssertDelay,
      withNegateDelay: withNegateDelay
    });
    return self;

    /**
     * Poll whether the view-model is ready.
     * @returns {boolean} True where all specified fields are truthy, else False
     */
    function testReady() {
      var remaining = fieldList.filter(testValueIsFalsey).map(quote).join(', '),
          isReady   = !remaining.length,
          isChange  = !lastChange || ((lastChange > 0) !== isReady);

      // log progress
      if (!isReady) {
        var obtained = fieldList.filter(testValueIsTruthy).map(quote).join(', ');
        logger((obtained.length ? ('obtained ' + obtained + ' ') : '') + 'still waiting on', remaining);
      }

      // any change in readiness
      if (isChange) {

        // log completion
        if (isReady) {
          logger('view-model ready');
        }

        // assign optional VM flag
        $timeout.cancel(timeout);
        if (isReady) {
          timeout = !flag ? null : isNaN(delayAssert) ? assert() : $timeout(assert, delayAssert);
          lastChange = +1;
        }
        else {
          timeout = !flag ? null : isNaN(delayNegate) ? negate() : $timeout(negate, delayAssert);
          lastChange = -1;
        }
      }

      // return status
      return isReady;
    }

    /**
     * Add a logger that will output debug information.
     * @param {function|null} value A logger method or null to clear
     * @returns {function} Self
     */
    function withLogger(value) {
      if (!!value && (typeof value !== 'function')) {
        throw new Error('expected function');
      }
      logger = value || noop;
      return self;
    }

    /**
     * Specify a view-model field that will track the readiness value.
     * @param {string|null} value A view-model field to assign
     * @returns {function} Self
     */
    function withFlag(value) {
      if (!!value && (typeof value !== 'string')) {
        throw new Error('expected string');
      }
      flag = value || false;
      return self;
    }

    /**
     * Specify a delay for assertion of the view-model readiness flag.
     * @param {number} value A possibly zero delay or NaN or negative for synchronous
     * @returns {function} Self
     */
    function withAssertDelay(value) {
      if (typeof value !== 'number') {
        throw new Error('expected number');
      }
      delayAssert = (value < 0) ? NaN : value;
      return self;
    }

    /**
     * Specify a delay for negation of the view-model readiness flag.
     * @param {number} value A possibly zero delay or NaN or negative for synchronous
     * @returns {function} Self
     */
    function withNegateDelay(value) {
      if (typeof value !== 'number') {
        throw new Error('expected number');
      }
      delayNegate = (value < 0) ? NaN : value;
      return self;
    }

    function noop() {
    }

    function assert() {
      if (logger) {
        logger('assert flag view-model flag "' + flag + '"');
      }
      vm[flag] = true;
    }

    function negate() {
      if (logger) {
        logger('negate flag view-model flag "' + flag + '"');
      }
      vm[flag] = false;
    }

    function testValueIsTruthy(field) {
      return !!vm[field];
    }

    function testValueIsFalsey(field) {
      return !vm[field];
    }

    function quote(value) {
      return '"' + value + '"';
    }

    function isString(value) {
      return (typeof value === 'string');
    }
  };
}

module.exports = angularVmReadyFactory;