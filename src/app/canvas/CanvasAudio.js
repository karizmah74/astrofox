/* eslint-disable react/require-render-return */
import Component from 'core/Component';
import CanvasBars from 'canvas/CanvasBars';

export default class CanvasAudio extends Component {
  static defaultOptions = {
    bars: 100,
  };

  constructor(options, canvas) {
    super(options);

    this.bars = new CanvasBars(options, canvas);
    this.results = new Float32Array(this.options.bars);
  }

  getCanvas() {
    return this.bars.canvas;
  }

  parseAudioBuffer(buffer) {
    const { results } = this;
    const size = buffer.length / results.length;
    const step = ~~(size / 10) || 1;

    // Process each channel
    for (let c = 0; c < buffer.numberOfChannels; c += 1) {
      const data = buffer.getChannelData(c);

      // Process each bar
      for (let i = 0; i < results.length; i += 1) {
        const start = ~~(i * size);
        const end = ~~(start + size);
        let max = 0;

        // Find max value within range
        for (let j = start; j < end; j += step) {
          const val = data[j];
          if (val > max) {
            max = val;
          } else if (-val > max) {
            max = -val;
          }
        }

        if (c === 0 || max > results[i]) {
          results[i] = max;
        }
      }
    }

    return results;
  }

  render(data) {
    this.bars.render(this.parseAudioBuffer(data));
  }
}
