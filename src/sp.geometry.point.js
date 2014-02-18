/* global SP:true, console:false */

SP.ensure("SP.geometry");
SP.geometry.Point = function (x,y) {
    if (! (this instanceof SP.geometry.Point)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.geometry.Point()'.");
    }

    if (Number.isNaN(parseFloat(x, 10)) || Number.isNaN(parseFloat(y, 10))) {
        throw new Error("Expected two numbers in SP.geometry.Point, got " + x + " and " + y);
    }
    // Store positions
    var privateX = x;
    var privateY = y;
    // Allow other objects to listen to updates
    var listeners = [];
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function () {
        for (var i = 0; i < listeners.length; i++) {
            var result = listeners[i](this);
            if (result) {
                return result;
            }
        }
    }.bind(this);

    this.getX = function () {
        return privateX;
    };

    this.getY = function () {
        return privateY;
    };

    this.setX = function (x) {
        if (Number.isNaN(x)) {
            throw new Error("Expected a number in SP.geometry.Point.setX(), got " + x);
        }
        privateX = x;
        fire();
        return this;
    }.bind(this);

    this.setY = function (y) {
        if (Number.isNaN(y)) {
            throw new Error("Expected a number in SP.geometry.Point.setX(), got " + y);
        }
        privateY = y;
        fire();
        return this;
    }.bind(this);

    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        x = null;
        privateX = null;
        y = null;
        privateY = null;
    };
};
SP.geometry.Point.prototype.toString = function () {
    return "SP.geometry.Point[" + this.getX() + "," + this.getY() + "]";
};





/* global SP:true */

SP.ensure("SP.geometry");
SP.geometry.Boundpoint = function (x,y) {
    if (! (this instanceof SP.geometry.Boundpoint)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.geometry.Boundpoint()'.");
    }
    if (! (x instanceof SP.geometry.Point) || ! (y instanceof SP.geometry.Point)) {
        throw "Expecting two SP.geometry.Point objects, got " + x + " and " + y;
    }

    SP.geometry.Point.call(this, x.getX(), y.getY());

    var privateXPoint = x;
    var privateYPoint = y;

    privateXPoint.listen(function (point) {
        if (point.getX() !== this.getX()) {
            this.setX(point.getX());
        }
    }.bind(this));

    privateYPoint.listen(function(point) {
        if (point.getY() !== this.getY()) {
            this.setY(point.getY());
        }
    }.bind(this));

    // About to override stuff. Keep copies of the original methods from Point.
    var parent = {};
    parent.listen = this.listen;
    parent.setX = this.setX;
    parent.setY = this.setY;

    // Allow other objects to listen to updates
    var listeners = [];
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function () {
        for (var i = 0; i < listeners.length; i++) {
            var result = listeners[i](this);
            if (result) {
                return result;
            }
        }
    }.bind(this);

    this.setX = function (x) {
        parent.setX(x);
        if (privateXPoint.getX() !== x) {
            privateXPoint.setX(x);
        }
        fire();
        return this;
    }.bind(this);

    this.setY = function (y) {
        parent.setY(y);
        if (privateYPoint.getY() !== y) {
            privateYPoint.setY(y);
        }
        fire();
        return this;
    }.bind(this);

    this.destroy = function (deep, andRemove) {
        if (deep) {
            privateXPoint.destroy(deep, andRemove);
            privateYPoint.destroy(deep, andRemove);
        }
    };
};
SP.geometry.Boundpoint.prototype = Object.create(SP.geometry.Point.prototype);
SP.geometry.Boundpoint.prototype.toString = function () {
    return "SP.geometry.Boundpoint[" + this.getX() + "," + this.getY() + "]";
};
