/* global SP:true, $:false, console:false */

SP.ensure("SP.ui");
SP.ui.Box = function (box, element) {
    if (! (this instanceof SP.ui.Box)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.ui.Box()'.");
    }
    if (! (box instanceof SP.geometry.Box)) {
        throw "Expecting a SP.geometry.Box object, got " + box;
    }
    if (! SP.isElement(element)) {
        throw "Expecting an element as an argument in SP.ui.Box, got " + element;
    }

    var privateBox = box;
    var privateElement = element;

    $(element).addClass("sp-ui-box");

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


    this.getGeometryBox = function () {
        return privateBox;
    };

    this.getElement = function () {
        return privateElement;
    };

    this.setPosition = function (x, y, x2, y2) { privateBox.setPosition(x, y, x2, y2); return this; }.bind(this);
    this.setTop = function (newValue) { privateBox.setTop(newValue); return this; }.bind(this);
    this.setBottom = function (newValue) { privateBox.setBottom(newValue); return this; }.bind(this);
    this.setLeft = function (newValue) { privateBox.setLeft(newValue); return this; }.bind(this);
    this.setRight = function (newValue) { privateBox.setRight(newValue); return this; }.bind(this);

    this.getTop = function () { return privateBox.getTop(); };
    this.getBottom = function () { return privateBox.getBottom(); };
    this.getLeft = function () { return privateBox.getLeft(); };
    this.getRight = function () { return privateBox.getRight(); };

    this.getTopPoint = function () { return privateBox.getTopPoint(); };
    this.getBottomPoint = function () { return privateBox.getBottomPoint(); };
    this.getLeftPoint = function () { return privateBox.getLeftPoint(); };
    this.getRightPoint = function () { return privateBox.getRightPoint(); };

    this.getPoints = function () { return privateBox.getPoints(); };

    this.getWidth = function () { return privateBox.getWidth(); };
    this.getHeight = function () { return privateBox.getHeight(); };

    this.contains = function () { return privateBox.contains.apply(privateBox, arguments); };

    this.restrict = function () { return privateBox.restrict.apply(privateBox, arguments); };

    privateBox.listen(fire);

    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        if (andRemove) {
            $(privateElement).remove();
        }
        if (deep) {
            privateBox.destroy(deep, andRemove);
        }
    };
};
SP.ui.Box.prototype.toString = function () {
    return "SP.ui.Box[" + this.getGeometryBox() + "]";
};
