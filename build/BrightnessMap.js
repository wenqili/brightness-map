"use strict";
exports.__esModule = true;
var BrightnessMap = /** @class */ (function () {
    function BrightnessMap(imageURL, width, height) {
        this.imageURL = imageURL;
        this.width = width;
        this.height = height;
    }
    /**
     * Gets brightness map pixels array of different graininess after filter out dim pixels
     * @param {{graniness: number, threshold: number}} filter - Grain(spacing), luminance threshold (Rec. 601)
     * @returns Promise object represents brightness map pixels array
     */
    BrightnessMap.prototype.getBrightnessMap = function (filter) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            _this._drawOffscreenContext().then(function (ctx) {
                var filteredPixelArray = [];
                var PixelDensity = 2;
                for (var y = 0; y < _this.height * PixelDensity; y += filter.grain) {
                    for (var x = 0; x < _this.width * PixelDensity; x += filter.grain) {
                        var pixel = ctx.getImageData(x, y, 1, 1);
                        var data = pixel.data;
                        var _r = data[0];
                        var _g = data[1];
                        var _b = data[2];
                        var _a = data[3];
                        var _luminance = _r * 0.299 + _g * 0.587 + _b * 0.114; //Rec. 601
                        if (_luminance > filter.threshold) {
                            var dot = {
                                x: x,
                                y: y,
                                r: _r,
                                g: _g,
                                b: _b,
                                a: _a,
                                l: _luminance
                            };
                            filteredPixelArray.push(dot);
                        }
                    }
                }
                resolve(filteredPixelArray);
            });
        });
        return promise;
    };
    /**
     * Draws offscreen context
     * @returns Promise object represents offscreen context
     */
    BrightnessMap.prototype._drawOffscreenContext = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            _this._loadImage(_this.imageURL).then(function (image) {
                var canvas = new OffscreenCanvas(_this.width, _this.height);
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, _this.width, _this.height);
                // ctx.fillStyle = 'blue';
                // ctx.fillRect(0, 0, 100, 100);
                resolve(ctx);
            });
        });
        return promise;
    };
    /**
     * Loads image
     * @param {string} url
     * @returns {Promise} Promise object represents the image
     */
    BrightnessMap.prototype._loadImage = function (url) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var _image = new Image(_this.width, _this.height);
            _image.onload = function () {
                resolve(_image);
            };
            _image.src = url;
        });
        return promise;
    };
    /**
     * Gets pixels array
     * @returns {Promise} Promise object represents pixels array
     */
    BrightnessMap.prototype._getPixelsArray = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            _this.getImageData().then(function (imageData) {
                resolve(imageData.data);
            });
        });
        return promise;
    };
    /**
     * Gets image data
     * @returns {Promise} Promise Object represents image data
     */
    BrightnessMap.prototype.getImageData = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            _this._drawOffscreenContext().then(function (ctx) {
                var _imageData = ctx.getImageData(0, 0, _this.width, _this.height);
                resolve(_imageData);
            });
        });
        return promise;
    };
    return BrightnessMap;
}());
exports["default"] = BrightnessMap;
