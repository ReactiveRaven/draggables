/* global SP:true, $:false, _:false, console:false */

SP.ensure("SP.ui");
SP.ui.Areaselect = function (box, handles) {
    if (! (this instanceof SP.ui.Areaselect)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.ui.Areaselect()'.");
    }
    var i;

    if (! (box instanceof SP.ui.Box)) {
        throw "Expecting a SP.ui.Box object, got " + box;
    }
    if (! _.isArray(handles)) {
        throw "Expecting an array of `SP.ui.Handle`s, got " + handles;
    }
    for (i = 0; i < handles.length; i++) {
        if (! (handles[i] instanceof SP.ui.Handle)) {
            throw "Expecting all objects in handles array to be instances of SP.ui.Handle, found " + handles[i];
        }
    }

    var privateUiBox = box;
    var privateHandles = handles;
    var privatePoints = [];
    var privateElements = [];

    privateElements.push(box.getElement());

    privatePoints.concat(box.getPoints());
    _.forEach(privateHandles, function (handle) {
        privatePoints.push(handle.getPoint());
        privateElements.push(handle.getElement());
    });

    this.getUiBox = function () {
        return privateUiBox;
    };

    $(privateElements).addClass("sp-ui-areaselect");

    this.getElements = function () {
        return privateElements;
    };

    var listeners = [];
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function (obj) {
        if (locked) {
            if (obj instanceof SP.geometry.Point) {
                var index = _.indexOf(privatePoints, obj);
                if (index > -1) {
                    if (obj.getX() !== lockedCoordinates[index].x) {
                        obj.setX(lockedCoordinates[index].x);
                    }
                    if (obj.getY() !== lockedCoordinates[index].y) {
                        obj.setY(lockedCoordinates[index].y);
                    }
                }
            }
        }
        for (var i = 0; i < listeners.length; i++) {
            var result = listeners[i](this);
            if (result) {
                return result;
            }
        }
    }.bind(this);

    var locked = false;
    var lockedCoordinates = [];

    this.lock = function () {
        locked = true;
        _.forEach(privatePoints, function (point, index) {
            lockedCoordinates[index] = {
                x: point.getX(),
                y: point.getY()
            };
        });
        _.forEach(privateHandles, function (handle) {
            $(handle.getElement()).draggable("disable");
        });
        if (privateUiBox instanceof SP.ui.Dragbox) {
            $(privateUiBox.getElement()).draggable("disable");
        }
    };

    this.unlock = function () {
        locked = false;
        _.forEach(privateHandles, function (handle) {
            $(handle.getElement()).draggable("enable");
        });
        if (privateUiBox instanceof SP.ui.Dragbox) {
            $(privateUiBox.getElement()).draggable("enable");
        }
    };

    _.forEach(privatePoints, function (point) {
        point.listen(fire);
    });

    this.setPosition = function (x, y, x2, y2) { privateUiBox.setPosition(x, y, x2, y2); return this; }.bind(this);
    this.setTop = function (newValue) { return privateUiBox.setTop(newValue); };
    this.setBottom = function (newValue) { return privateUiBox.setBottom(newValue); };
    this.setLeft = function (newValue) { return privateUiBox.setLeft(newValue); };
    this.setRight = function (newValue) { return privateUiBox.setRight(newValue); };

    this.getTop = function () { return privateUiBox.getTop(); };
    this.getBottom = function () { return privateUiBox.getBottom(); };
    this.getLeft = function () { return privateUiBox.getLeft(); };
    this.getRight = function () { return privateUiBox.getRight(); };
    this.getTopPoint = function () { return privateUiBox.getTopPoint(); };
    this.getBottomPoint = function () { return privateUiBox.getBottomPoint(); };
    this.getLeftPoint = function () { return privateUiBox.getLeftPoint(); };
    this.getRightPoint = function () { return privateUiBox.getRightPoint(); };
    this.getWidth = function () { return privateUiBox.getWidth(); };
    this.getHeight = function () { return privateUiBox.getHeight(); };

    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        this.unlock();
        if (deep) {
            privateUiBox.destroy(privateHandles, andRemove);
            _.forEach(handles, function (handle) {
                handle.destroy(deep, andRemove);
            });
        }
    };
};
SP.ui.Areaselect.prototype.toString = function () {
    return "SP.ui.Areaselect[" + this.getUiBox() + "]";
};
