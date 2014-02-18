/* global SP:true, $:false, console:false */

SP.ensure("SP.ui");
SP.ui.Dragbox = function (box, options) {
    if (! (this instanceof SP.ui.Dragbox)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.ui.Box()'.");
    }
    if (! (box instanceof SP.ui.Box)) {
        throw "Expecting a SP.ui.Box object, got " + box;
    }

    var privateUiBox = box;
    var privateGeometryBox = privateUiBox.getGeometryBox();
    var privateElement = box.getElement();
    var state = null;

    $(privateElement).addClass("sp-ui-dragbox");

    var listeners = [];
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function () {
        var $privateElement = $(privateElement);
        $privateElement.css({
            width: this.getWidth(),
            height: this.getHeight(),
            position: "absolute",
            top: this.getTop(),
            left: this.getLeft()
        });
        for (var i = 0; i < listeners.length; i++) {
            var result = listeners[i](this);
            if (result) {
                return result;
            }
        }
    }.bind(this);

    this.handleStart = function (/** /event, ui/**/) {
        state = "dragging";
    };

    this.handleDrag = function (event, ui) {

        // Collect dimensions and points
        var width = this.getWidth(),
            height = this.getHeight(),
            topPoint = this.getTopPoint(),
            leftPoint = this.getLeftPoint(),
            bottomPoint = $(this.getPoints()).not([topPoint])[0],
            rightPoint = $(this.getPoints()).not([leftPoint])[0];

        // Set the top left points
        topPoint.setY(ui.position.top);
        leftPoint.setX(ui.position.left);

        // Now set the bottom right points based off the top left ones
        rightPoint.setX(leftPoint.getX() + width);
        bottomPoint.setY(topPoint.getY() + height);

        // Correct top left again, if we're trying to push outside a container
        if (this.getWidth() < width) {
            leftPoint.setX(rightPoint.getX() - width);
        }
        if (this.getHeight() < height) {
            topPoint.setY(bottomPoint.getY() - height);
        }

    }.bind(this);

    this.handleStop = function (event, ui) {
        state = null;
        this.handleDrag({}, ui);
    }.bind(this);

    // Set up config
    var defaults = {
        topoffset: 0,
        leftoffset: 0,
        start: this.handleStart,
        drag: this.handleDrag,
        stop: this.handleStop,
        helper: "clone"
    };
    var config = $.extend(defaults, options ? options : {});

    $(privateElement).draggable(config);

    this.getGeometryBox = function () { return privateGeometryBox; };

    this.getUiBox = function () { return privateUiBox; };

    this.getElement = function () { return privateUiBox.getElement(); };

    this.getPoints = function () { return privateGeometryBox.getPoints(); };

    this.setPosition = function (x, y, x2, y2) { privateGeometryBox.setPosition(x, y, x2, y2); return this; }.bind(this);

    this.setTop = function (newValue) { privateGeometryBox.setTop(newValue); return this; }.bind(this);
    this.setBottom = function (newValue) { privateGeometryBox.setBottom(newValue); return this; }.bind(this);
    this.setLeft = function (newValue) { privateGeometryBox.setLeft(newValue); return this; }.bind(this);
    this.setRight = function (newValue) { privateGeometryBox.setRight(newValue); return this; };

    this.getTop = function () { return privateGeometryBox.getTop(); };
    this.getBottom = function () { return privateGeometryBox.getBottom(); };
    this.getLeft = function () { return privateGeometryBox.getLeft(); };
    this.getRight = function () { return privateGeometryBox.getRight(); };

    this.getTopPoint = function () { return privateGeometryBox.getTopPoint(); };
    this.getBottomPoint = function () { return privateGeometryBox.getBottomPoint(); };
    this.getLeftPoint = function () { return privateGeometryBox.getLeftPoint(); };
    this.getRightPoint = function () { return privateGeometryBox.getRightPoint(); };

    this.getWidth = function () { return privateGeometryBox.getWidth(); };

    this.getHeight = function () { return privateGeometryBox.getHeight(); };

    this.contains = function () { return privateGeometryBox.contains.apply(privateGeometryBox, arguments); };

    this.restrict = function () { return privateGeometryBox.restrict.apply(privateGeometryBox, arguments); };

    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        $(privateElement).draggable({});
        $(privateElement).draggable("destroy");
        if (deep) {
            privateUiBox.destroy(deep, andRemove);
        }
    };

    privateUiBox.listen(fire);
};
SP.ui.Dragbox.prototype = Object.create(SP.ui.Box.prototype);
SP.ui.Dragbox.prototype.toString = function () {
    return "SP.ui.Dragbox[" + this.getUiBox() + "]";
};
