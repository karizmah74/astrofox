import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Control, Option, Label } from 'components/controls/Control';
import Icon from 'components/interface/Icon';
import { BoxInput, NumberInput, RangeInput, ButtonInput, ButtonGroup } from 'components/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'view/global';
import {
  AngleDoubleLeft,
  AngleDoubleRight,
  ChevronDown,
  Minus,
  Plus,
  ArrowsHorizontal,
} from 'view/icons';
import styles from './ReactorControl.less';

const REACTOR_BARS = 64;

const outputOptions = [
  { title: 'Subtract', icon: Minus },
  { title: 'Add', icon: Plus },
  { title: 'Reverse', icon: AngleDoubleLeft },
  { title: 'Forward', icon: AngleDoubleRight },
  { title: 'Cycle', icon: ArrowsHorizontal },
];

export default class ReactorControl extends PureComponent {
  static defaultProps = {
    barWidth: 8,
    barHeight: 100,
    barSpacing: 1,
    reactor: null,
    visible: false,
  };

  componentDidMount() {
    const { barWidth, barHeight, barSpacing } = this.props;

    this.spectrum = new CanvasBars(
      {
        width: REACTOR_BARS * (barWidth + barSpacing),
        height: barHeight,
        barWidth,
        barSpacing,
        shadowHeight: 0,
        color: '#775FD8',
        backgroundColor: '#FF0000',
      },
      this.spectrumCanvas,
    );

    this.output = new CanvasMeter(
      {
        width: 20,
        height: barHeight,
        color: '#775FD8',
        origin: 'bottom',
      },
      this.outputCanvas,
    );

    events.on('render', this.draw, this);
  }

  componentWillUnmount() {
    events.off('render', this.draw, this);
  }

  handleChange = (name, value) => {
    if (['selection', 'outputMode'].includes(name)) {
      this.updateReactor(name, value);
    } else {
      this.updateParser(name, value);
    }
  };

  draw = () => {
    const { reactor } = this.props;

    if (reactor) {
      const { fft, output } = reactor.getResult();

      this.spectrum.render(fft);
      this.output.render(output);
    }
  };

  updateReactor = (name, value) => {
    const { reactor, barWidth, barHeight, barSpacing } = this.props;
    const obj = { [name]: value };

    if (name === 'selection') {
      const { x, y, width, height } = value;
      const maxWidth = REACTOR_BARS * (barWidth + barSpacing);
      const maxHeight = barHeight;

      obj.range = {
        x1: x / maxWidth,
        x2: (x + width) / maxWidth,
        y1: y / maxHeight,
        y2: (y + height) / maxHeight,
      };
    }

    reactor.update(obj);

    this.forceUpdate();
  };

  updateParser = (name, value) => {
    const { reactor } = this.props;

    if (reactor) {
      reactor.parser.update({ [name]: value });
      this.forceUpdate();
    }
  };

  hideReactor = () => {
    events.emit('reactor-edit', null);
  };

  render() {
    const { reactor, barWidth, barHeight, barSpacing, visible } = this.props;

    return (
      <div
        className={classNames({
          [styles.reactor]: true,
          [styles.hidden]: !visible,
        })}
      >
        {reactor && <Header path={reactor.properties.displayName.split('/')} />}
        <div className={styles.display}>
          <div className={styles.controls}>
            <Controls reactor={reactor} onChange={this.handleChange} />
          </div>
          <div className={styles.spectrum}>
            <canvas
              ref={e => (this.spectrumCanvas = e)}
              width={REACTOR_BARS * (barWidth + barSpacing)}
              height={barHeight}
            />
            <BoxInput
              ref={e => (this.box = e)}
              name="selection"
              value={reactor ? reactor.properties.selection : {}}
              minWidth={barWidth}
              minHeight={barWidth}
              maxWidth={REACTOR_BARS * (barWidth + barSpacing)}
              maxHeight={barHeight}
              onChange={this.handleChange}
            />
          </div>
          <div className={styles.output}>
            <canvas ref={e => (this.outputCanvas = e)} width={20} height={barHeight} />
          </div>
        </div>
        <Icon
          className={styles.closeIcon}
          glyph={ChevronDown}
          title="Hide Panel"
          onClick={this.hideReactor}
        />
      </div>
    );
  }
}

const Header = ({ path }) => (
  <div className={styles.header}>
    {path.map((item, index) => (
      <span key={index} className={styles.node}>
        {item}
      </span>
    ))}
  </div>
);

const Controls = ({ reactor, onChange }) => {
  const { maxDecibels, smoothingTimeConstant } = reactor ? reactor.parser.properties : {};
  const { outputMode } = reactor ? reactor.properties : {};

  return (
    <Control className={styles.control}>
      <Option className={styles.option}>
        <Label text="Output Mode" className={styles.label} />
        <ButtonGroup>
          {outputOptions.map(({ icon, title }, index) => (
            <ButtonInput
              key={index}
              icon={icon}
              title={title}
              active={outputMode === title}
              onClick={() => onChange('outputMode', title)}
            />
          ))}
        </ButtonGroup>
      </Option>
      <Option className={styles.option}>
        <Label text="Max dB" className={styles.label} />
        <NumberInput
          name="maxDecibels"
          value={maxDecibels}
          width={40}
          min={-40}
          max={0}
          step={1}
          onChange={onChange}
        />
        <RangeInput
          name="maxDecibels"
          value={maxDecibels}
          min={-40}
          max={0}
          step={1}
          onChange={onChange}
        />
      </Option>
      <Option className={styles.option}>
        <Label text="Smoothing" className={styles.label} />
        <NumberInput
          name="smoothingTimeConstant"
          value={smoothingTimeConstant}
          width={40}
          min={0}
          max={0.99}
          step={0.01}
          onChange={onChange}
        />
        <RangeInput
          name="smoothingTimeConstant"
          value={smoothingTimeConstant}
          min={0}
          max={0.99}
          step={0.01}
          onChange={onChange}
        />
      </Option>
    </Control>
  );
};
