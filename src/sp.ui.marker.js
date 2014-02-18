/* global SP:true, $:false, console:false */

SP.ensure("SP.ui");
SP.ui.Marker = function (point, element, options) {
    if (! (this instanceof SP.ui.Marker)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.ui.Marker()'.");
    }

    // Whine about invalid arguments
    if (! (point instanceof SP.geometry.Point)) {
        throw "Expecting an instance of SP.geometry.Point in SP.ui.Marker, got " + point;
    }
    if (! SP.isElement(element)) {
        throw "Expecting an element as an argument in SP.ui.Marker, got " + element;
    }

    // Privates!
    var privatePoint = point; /* @var privatePoint SP.geometry.Point */
    var privateElement = element;
    var listeners = [];

    $(privateElement).addClass("sp-ui-marker");

    // Set up config
    var defaults = {
        topoffset: 0,
        leftoffset: 0
    };
    var config = $.extend(defaults, options ? options : {});

    // Listen structure
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function (point) {
        $(element).css({
            position: 'absolute',
            top: point.getY() - config.topoffset,
            left: point.getX() - config.leftoffset
        });
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](this);
        }
    }.bind(this);
    privatePoint.listen(fire);

    this.getX = privatePoint.getX;
    this.getY = privatePoint.getY;
    this.getPoint = function () {
        return privatePoint;
    };

    this.getElement = function () {
        return privateElement;
    };

    // Clean up after ourselves.
    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        $(privateElement).removeClass("sp-ui-marker");
        if (andRemove) {
            $(privateElement).remove();
        }
        if (deep) {
            privatePoint.destroy(deep, andRemove);
        }
    }.bind(this);
};
SP.ui.Marker.prototype.toString = function () {
    return "SP.ui.Marker[" + this.getPoint()  + "]";
};


SP.ui.Handle = function (point, element, options) {
    if (! (this instanceof SP.ui.Handle)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.ui.Handle()'.");
    }

    // Whine about invalid arguments
    if (! (point instanceof SP.geometry.Point)) {
        throw "Expecting an instance of SP.geometry.Point in SP.ui.Handle, got " + point;
    }
    if (! SP.isElement(element)) {
        throw "Expecting an element as an argument in SP.ui.Handle, got " + element;
    }

    SP.ui.Marker.call(this, point, element);

    // Privates!
    var privatePoint = this.getPoint(); /* @var privatePoint SP.geometry.Point */
    var privateElement = this.getElement();
    var state = null;
    var listeners = [];

    $(privateElement).addClass("sp-ui-handle");

    this.handleStart = function (/** /event, ui/**/) {
        state = "dragging";
    };

    this.handleDrag = function (event, ui) {
        privatePoint.setX(ui.position.left + config.leftoffset);
        privatePoint.setY(ui.position.top + config.topoffset);
    };

    this.handleStop = function (event, ui) {
        state = null;
        privatePoint.setX(ui.position.left + config.leftoffset);
        privatePoint.setY(ui.position.top + config.topoffset);
    };

    // Set up config
    var defaults = {
        topoffset: 0,
        leftoffset: 0,
        start: this.handleStart,
        drag: this.handleDrag,
        stop: this.handleStop
    };
    var config = $.extend(defaults, options ? options : {});

    // Listen structure
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function (point) {
        //if (!state) {
            $(element).css({
                position: 'absolute',
                top: point.getY() - config.topoffset,
                left: point.getX() - config.leftoffset
            });
        //}
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](this);
        }
    }.bind(this);
    privatePoint.listen(fire);

    $(privateElement).draggable(config);

    // Clean up after ourselves.
    var _destroy = this.destroy;
    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        $(privateElement).draggable();
        $(privateElement).draggable("destroy");
        $(privateElement).removeClass("sp-ui-handle");
        if (andRemove) {
            $(privateElement).remove();
        }
        if (deep) {
            privatePoint.destroy(deep, andRemove);
            _destroy(deep, andRemove);
        }
    }.bind(this);
};
SP.ui.Handle.prototype = Object.create(SP.ui.Marker.prototype);
SP.ui.Handle.prototype.toString = function () {
    return "SP.ui.Handle[" + this.getPoint()  + "]";
};
