/* global SP:true, console:false, _:false */

SP.ensure("SP.geometry");
SP.geometry.Box = function (point1, point2) {
    if (! (this instanceof SP.geometry.Box)) {
        throw new Error("Attempted to call a constructor as a function. Must use 'new' eg 'new SP.geometry.Box()'.");
    }
    if (! (point1 instanceof SP.geometry.Point) || ! (point2 instanceof SP.geometry.Point)) {
        throw "Expecting two SP.geometry.Point objects, got " + point1 + " and " + point2;
    }

    var privatePoint1 = point1;
    var privatePoint2 = point2;

    var listeners = [];
    this.listen = function (callback) {
        listeners.push(callback);
        setTimeout(function () { callback(this); }.bind(this), 0);
    }.bind(this);
    var fire = function () {
        var i;
        for (i = 0; i < listeners.length; i++) {
            var result = listeners[i](this);
            if (result) {
                return result;
            }
        }
        for (i = 0; i < restricted.length; i++) {
            restrict(restricted[i]);
        }
    }.bind(this);

    privatePoint1.listen(fire);
    privatePoint2.listen(fire);

    var extractPoints = function (obj) {
        var points = [];
        if (typeof obj.getPoint === "function") {
            points.push(obj.getPoint());
        }
        if (typeof obj.getPoints === "function") {
            points = points.concat(obj.getPoints());
        }
        return points;
    };

    var state = null;

    var restrict = function (point) {
        if (state !== "rotate" && state !== "scale") {
            if (! (point instanceof SP.geometry.Point)) {
                throw "Expecting a SP.geometry.Point object, got " + point;
            }
            if (!this.contains(point)) {
                var x = point.getX();
                var y = point.getY();
                var left = this.getLeft();
                var right = this.getRight();
                var top = this.getTop();
                var bottom = this.getBottom();
                if (x < left) {
                    point.setX(left);
                    return true;
                } else if (x > right) {
                    point.setX(right);
                    return true;
                }
                if (y < top) {
                    point.setY(top);
                    return true;
                } else if (y > bottom) {
                    point.setY(bottom);
                    return true;
                }
            }
        }
    }.bind(this);

    var restricted = [];

    this.restrict = function (point) {
        if (! (point instanceof SP.geometry.Point)) {
            var subpoints = extractPoints(point);
            if (subpoints.length) {
                for (var i = 0; i < subpoints.length; i++) {
                    this.restrict(subpoints[i]);
                }
                return true;
            } else {
                throw "Expecting a SP.geometry.Point object, got " + point;
            }
        }
        point.listen(restrict);
        restricted.push(point);
        return this;
    }.bind(this);

    this.rotateRelative = function (degrees) {
        if (degrees < 0) {
            degrees %= 360;
            degrees += 360;
        }
        if (degrees > 360) {
            degrees = degrees % 360;
        }
        if (degrees % 90) {
            throw "Angles other than 90' are not yet supported in SP.geometry.Box.rotateRelative(), got " + degrees;
        }
        if (degrees > 90) {
            for (var i = degrees / 90; i > 0; i--) {
                this.rotateRelative(90);
            }
            return;
        }
        if (degrees === 90) {
            state = "rotate";
            var height = this.getHeight();
            _.forEach(restricted, function (point) {
                var origX = point.getX();
                var origY = point.getY();
                point.setX(height - origY);
                point.setY(origX);
            });
            var width = this.getWidth();
            var top = this.getTop();
            var left = this.getLeft();
            this.setRight(top + height);
            this.setBottom(left + width);
            state = null;
        }
    }.bind(this);

    this.scaleRelative = function (multiple) {
        var originX = this.getLeft();
        var originY = this.getTop();
        state = "scale";
        _.forEach(restricted, function (point) {
            point.setX(((point.getX() - originX) * multiple) + originX);
            point.setY(((point.getY() - originY) * multiple) + originY);
        });
        var width = this.getWidth();
        var height = this.getHeight();
        this.setRight(originX + width * multiple);
        this.setBottom(originY + height * multiple);
        state = null;
    };

    this.getPoints = function () {
        return [privatePoint1, privatePoint2];
    };

    this.getLeft = function () {
        return Math.min(privatePoint1.getX(), privatePoint2.getX());
    };

    this.getLeftPoint = function () {
        return privatePoint1.getX() < privatePoint2.getX() ? privatePoint1 : privatePoint2;
    };

    this.setLeft = function (left) {
        this.getLeftPoint().setX(left);
        return this;
    }.bind(this);

    this.getRight = function () {
        return Math.max(privatePoint1.getX(), privatePoint2.getX());
    }.bind(this);

    this.getRightPoint = function () {
        return privatePoint1.getX() > privatePoint2.getX() ? privatePoint1 : privatePoint2;
    }.bind(this);

    this.setRight = function (right) {
        this.getRightPoint().setX(right);
        return this;
    }.bind(this);

    this.getTop = function () {
        return Math.min(privatePoint1.getY(), privatePoint2.getY());
    }.bind(this);

    this.getTopPoint = function () {
        return privatePoint1.getY() < privatePoint2.getY() ? privatePoint1 : privatePoint2;
    }.bind(this);

    this.setTop = function (top) {
        this.getTopPoint().setY(top);
        return this;
    }.bind(this);

    this.getBottom = function () {
        return Math.max(privatePoint1.getY(), privatePoint2.getY());
    }.bind(this);

    this.getBottomPoint = function () {
        return privatePoint1.getY() > privatePoint2.getY() ? privatePoint1 : privatePoint2;
    }.bind(this);

    this.setBottom = function (bottom) {
        this.getBottomPoint().setY(bottom);
        return this;
    }.bind(this);

    this.getWidth = function () {
        return this.getRight() - this.getLeft();
    }.bind(this);

    this.getHeight = function () {
        return this.getBottom() - this.getTop();
    }.bind(this);

    this.setPosition = function (x, y, x2, y2) {
        privatePoint1.setX(x);
        privatePoint1.setY(y);
        privatePoint2.setX(x2);
        privatePoint2.setY(y2);
        return this;
    }.bind(this);

    this.contains = function (point) {
        if (! (point instanceof SP.geometry.Point)) {
            throw new Error("Expecting an instance of SP.geometry.Point");
        }
        var x = point.getX();
        var y = point.getY();
        return x >= this.getLeft() && x <= this.getRight() && y <= this.getBottom() && y >= this.getTop();
    };

    this.destroy = function (deep, andRemove) {
        console.log("DESTROY (" + (deep ? "deep" : "") + (andRemove ? "andRemove" : "") + "): " + this);
        if (deep) {
            privatePoint1.destroy(deep, andRemove);
            privatePoint2.destroy(deep, andRemove);
        }
    };
};
SP.geometry.Box.prototype.toString = function () {
    return "SP.geometry.Box[[" + this.getLeft() + "," + this.getTop() + "],[" + this.getRight() + "," + this.getBottom() + "]]";
};
