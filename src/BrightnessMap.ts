/**
 * Pass in a picture url and output an array as generative art base or filter
 * @class
 * @param {string} iamgeURL - the url of the map picture
 * @param {number} width - offscreen render width
 * @param {number} height - offscreen render height
 */
interface FILTERS {
  grain: number;
  threshold: number;
}

class BrightnessMap {
  private imageURL: string;
  private width: number;
  private height: number;
  constructor(imageURL: string, width: number, height: number) {
    this.imageURL = imageURL;
    this.width = width;
    this.height = height;
  }

  /**
   * Gets brightness map pixels array of different graininess after filter out dim pixels
   * @param {{graniness: number, threshold: number}} filter - Grain(spacing), luminance threshold (Rec. 601)
   * @returns Promise object represents brightness map pixels array
   */
  getBrightnessMap(filter: FILTERS): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this._drawOffscreenContext().then(ctx => {
        let filteredPixelArray: {
          x: number;
          y: number;
          r: number;
          g: number;
          b: number;
          a: number;
          l: number;
        }[] = [];

        const PixelDensity = 2;
        for (let y = 0; y < this.height * PixelDensity; y += filter.grain) {
          for (let x = 0; x < this.width * PixelDensity; x += filter.grain) {
            const pixel = ctx.getImageData(x, y, 1, 1);
            const data = pixel.data;
            const _r = data[0];
            const _g = data[1];
            const _b = data[2];
            const _a = data[3];
            const _luminance = _r * 0.299 + _g * 0.587 + _b * 0.114; //Rec. 601

            if (_luminance > filter.threshold) {
              const dot = {
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
  }

  /**
   * Draws offscreen context
   * @returns Promise object represents offscreen context
   */
  _drawOffscreenContext(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this._loadImage(this.imageURL).then(image => {
        const canvas = new OffscreenCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, this.width, this.height);
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(0, 0, 100, 100);
        resolve(ctx);
      });
    });

    return promise;
  }

  /**
   * Loads image
   * @param {string} url
   * @returns {Promise} Promise object represents the image
   */
  _loadImage(url: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const _image = new Image(this.width, this.height);
      _image.onload = () => {
        resolve(_image);
      };
      _image.src = url;
    });

    return promise;
  }

  /**
   * Gets pixels array
   * @returns {Promise} Promise object represents pixels array
   */
  _getPixelsArray(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.getImageData().then(imageData => {
        resolve(imageData.data);
      });
    });

    return promise;
  }

  /**
   * Gets image data
   * @returns {Promise} Promise Object represents image data
   */
  getImageData(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this._drawOffscreenContext().then(ctx => {
        const _imageData = ctx.getImageData(0, 0, this.width, this.height);
        resolve(_imageData);
      });
    });

    return promise;
  }
}

export default BrightnessMap;
