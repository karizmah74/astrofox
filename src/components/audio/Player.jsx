import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import AudioWaveform from 'components/audio/AudioWaveform';
import Oscilloscope from 'components/audio/Oscilloscope';
import Icon from 'components/interface/Icon';
import { RangeInput } from 'lib/inputs';
import { events } from 'core/Global';
import { formatTime } from 'utils/format';
import iconSoundBars from 'svg/icons/sound-bars.svg';
import iconSoundWaves from 'svg/icons/sound-waves.svg';
import iconRepeat from 'svg/icons/cycle.svg';
import iconPlay from 'svg/icons/play.svg';
import iconStop from 'svg/icons/stop.svg';
import iconPause from 'svg/icons/pause.svg';
import iconVolume1 from 'svg/icons/volume.svg';
import iconVolume2 from 'svg/icons/volume2.svg';
import iconVolume3 from 'svg/icons/volume3.svg';
import iconVolume4 from 'svg/icons/volume4.svg';
import styles from './Player.less';

const PROGRESS_MAX = 1000;

export default class Player extends PureComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            playing: false,
            looping: false,
            progressPosition: 0,
            progressBuffering: false,
            seekPosition: 0,
            duration: 0,
            showWaveform: true,
            showOsc: false,
        };

        this.app = context.app;
    }

    componentDidMount() {
        const { player } = this.app;
        const { progressBuffering } = this.state;

        player.on('load', () => {
            this.setState({ duration: player.getDuration() });

            this.waveform.loadAudio(this.app.player.getAudio());
        });

        player.on('tick', () => {
            if (player.isPlaying() && !progressBuffering) {
                const pos = player.getPosition();

                this.setState({ progressPosition: pos });
            }
        });

        player.on('play', () => {
            this.setState({ playing: player.isPlaying() });
        });

        player.on('pause', () => {
            this.setState({ playing: player.isPlaying() });
        });

        player.on('stop', () => {
            this.setState({
                playing: player.isPlaying(),
                progressPosition: 0,
                seekPosition: 0,
            });
        });

        player.on('seek', () => {
            const pos = player.getPosition();

            this.setState({ progressPosition: pos, seekPosition: pos });
        });

        events.on('render', (data) => {
            if (this.spectrum) {
                this.spectrum.draw(data);
            }

            if (this.oscilloscope) {
                this.oscilloscope.draw(data);
            }
        });
    }

    onPlayButtonClick = () => {
        this.app.player.play();
    }

    onStopButtonClick = () => {
        this.app.player.stop();
    }

    onLoopButtonClick = () => {
        this.setState((prevState) => {
            this.app.player.setLoop(!prevState.looping);

            return { looping: !prevState.looping };
        });
    }

    onWaveformClick = (progressPosition) => {
        this.app.player.seek(progressPosition);
    }

    onWaveformSeek = (seekPosition) => {
        this.setState({ seekPosition });
    }

    onWaveformButtonClick = () => {
        this.setState(prevState => ({ showWaveform: !prevState.showWaveform }));
    }

    onOscButtonClick = () => {
        this.setState(prevState => ({ showOsc: !prevState.showOsc }));
    }

    onVolumeChange = (value) => {
        this.app.player.setVolume(value);
    }

    onProgressChange = (progressPosition) => {
        this.app.player.seek(progressPosition);

        this.setState({ progressPosition, seekPosition: 0, progressBuffering: false });
    }

    onProgressUpdate = (seekPosition) => {
        this.setState({ seekPosition, progressBuffering: true });
    }

    render() {
        const { visible } = this.props;
        const {
            playing,
            duration,
            progressPosition,
            seekPosition,
            looping,
            showWaveform,
            showOsc,
        } = this.state;

        return (
            <div className={classNames({ [styles.hidden]: !visible })}>
                <AudioWaveform
                    ref={e => (this.waveform = e)}
                    progressPosition={progressPosition}
                    seekPosition={seekPosition}
                    visible={showWaveform && duration}
                    onClick={this.onWaveformClick}
                    onSeek={this.onWaveformSeek}
                />
                <div className={styles.player}>
                    <div className={styles.buttons}>
                        <PlayButton playing={playing} onClick={this.onPlayButtonClick} />
                        <StopButton onClick={this.onStopButtonClick} />
                    </div>
                    <VolumeControl onChange={this.onVolumeChange} />
                    <ProgressControl
                        value={progressPosition * PROGRESS_MAX}
                        onChange={this.onProgressChange}
                        onUpdate={this.onProgressUpdate}
                        disabled={!duration}
                    />
                    <TimeInfo
                        currentTime={duration * (seekPosition || progressPosition)}
                        totalTime={duration}
                    />
                    <ToggleButton
                        icon={iconSoundBars}
                        title="Waveform"
                        active={showWaveform}
                        onClick={this.onWaveformButtonClick}
                    />
                    <ToggleButton
                        icon={iconSoundWaves}
                        title="Oscilloscope"
                        active={showOsc}
                        onClick={this.onOscButtonClick}
                    />
                    <ToggleButton
                        icon={iconRepeat}
                        title="Repeat"
                        active={looping}
                        onClick={this.onLoopButtonClick}
                    />
                </div>
                {
                    showOsc &&
                    <Oscilloscope ref={e => (this.oscilloscope = e)} />
                }
            </div>
        );
    }
}

Player.defaultProps = {
    visible: true,
};

Player.contextTypes = {
    app: PropTypes.object,
};

class VolumeControl extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: 100,
            mute: false,
        };
    }

    onChange = (name, value) => {
        this.props.onChange(value / 100);

        this.setState({ value, mute: false });
    }

    onClick = () => {
        this.setState((prevState, props) => {
            props.onChange(prevState.mute ? prevState.value / 100 : 0);

            return { mute: !prevState.mute };
        });
    }

    render() {
        const { value, mute } = this.state;
        let icon;

        if (value < 10 || mute) {
            icon = iconVolume4;
        }
        else if (value < 25) {
            icon = iconVolume3;
        }
        else if (value < 75) {
            icon = iconVolume2;
        }
        else {
            icon = iconVolume1;
        }

        return (
            <div className={styles.volume}>
                <div
                    role="presentation"
                    className={styles.speaker}
                    onClick={this.onClick}
                >
                    <Icon className={styles.icon} glyph={icon} />
                </div>
                <div className={styles.slider}>
                    <RangeInput
                        name="volume"
                        min={0}
                        max={100}
                        value={mute ? 0 : value}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }
}

class ProgressControl extends PureComponent {
    render() {
        const { value, disabled, onChange, onUpdate } = this.props;

        return (
            <div className={styles.progress}>
                <RangeInput
                    name="progress"
                    min={0}
                    max={PROGRESS_MAX}
                    value={value}
                    buffered
                    onChange={(name, newValue) => onChange(newValue / PROGRESS_MAX)}
                    onUpdate={(name, newValue) => onUpdate(newValue / PROGRESS_MAX)}
                    disabled={disabled}
                />
            </div>
        );
    }
}

const PlayButton = ({ playing, title, onClick }) => (
    <div
        role="presentation"
        className={classNames({
            [styles.button]: true,
            [styles.playButton]: !playing,
            [styles.pauseButton]: playing,
        })}
        onClick={onClick}
    >
        <Icon className={styles.icon} glyph={playing ? iconPause : iconPlay} title={title} />
    </div>
);

const StopButton = ({ title, onClick }) => (
    <div
        role="presentation"
        className={classNames(styles.button, styles.stopButton)}
        onClick={onClick}
    >
        <Icon className={styles.icon} glyph={iconStop} title={title} />
    </div>
);

const ToggleButton = ({
    active, title, icon, onClick,
}) => (
    <div
        role="presentation"
        className={classNames({
            [styles.toggleButton]: true,
            [styles.toggleButtonActive]: active,
        })}
        onClick={onClick}
    >
        <Icon className={styles.icon} glyph={icon} title={title} width={20} height={20} />
    </div>
);

const TimeInfo = ({ currentTime, totalTime }) => (
    <div className={styles.timeInfo}>
        <span className={classNames(styles.timePart, styles.currentTime)}>
            {formatTime(currentTime)}
        </span>
        <span className={classNames(styles.timePart, styles.timeSplit)} />
        <span className={classNames(styles.timePart, styles.totalTime)}>
            {formatTime(totalTime)}
        </span>
    </div>
);
