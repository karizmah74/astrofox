import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/interface/Button';
import Checkmark from 'components/interface/Checkmark';
import Spinner from 'components/interface/Spinner';
import styles from './AppUpdates.less';

export default class AppUpdates extends React.Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    constructor(props, context) {
        super(props);

        this.appUpdater = context.app.updater;
    }

    componentDidMount() {
        const {
            checking,
            downloading,
            downloadComplete,
            installing,
        } = this.appUpdater;

        this.appUpdater.on('update', this.updateStatus, this);

        if (!checking && !downloading && !downloadComplete && !installing) {
            // Let css animation complete
            setTimeout(() => {
                this.appUpdater.checkForUpdates();
            }, 1000);
        }
    }

    componentWillUnmount() {
        this.appUpdater.off('update', this.updateStatus, this);
    }

    installUpdate = () => {
        this.appUpdater.quitAndInstall();
    }

    downloadUpdate = () => {
        this.appUpdater.downloadUpdate();
    }

    updateStatus = () => this.forceUpdate();

    getMessage() {
        const {
            error,
            downloading,
            downloadComplete,
            installing,
            checked,
            hasUpdate,
            versionInfo,
        } = this.appUpdater;

        let message = 'Checking for updates...';

        if (error) {
            message = 'Unable to check for updates.';
        }
        else if (downloading) {
            message = 'Downloading update...';
        }
        else if (downloadComplete) {
            const { version } = versionInfo;
            message = `A new update (${version}) is ready to install.`;
        }
        else if (installing) {
            message = 'Installing update...';
        }
        else if (hasUpdate) {
            const { version } = versionInfo;
            message = `A new update (${version}) is available to download and install.`;
        }
        else if (checked) {
            message = 'You have the latest version.';
        }

        return message;
    }

    getIcon() {
        const {
            checked,
            hasUpdate,
        } = this.appUpdater;

        return checked && !hasUpdate ?
            <Checkmark className={styles.icon} size={30} /> :
            <Spinner className={styles.icon} size={30} />;
    }

    render() {
        const {
            onClose,
        } = this.props;
        const {
            installing,
            downloading,
            downloadComplete,
            hasUpdate,
        } = this.appUpdater;

        let installButton;
        let downloadButton;
        let closeText = 'Close';

        if (downloadComplete && !installing) {
            installButton = <Button text="Restart and Install Now" onClick={this.installUpdate} />;
            closeText = 'Install Later';
        }

        if (hasUpdate && !downloading && !downloadComplete) {
            downloadButton = <Button text="Download Now" onClick={this.downloadUpdate} />;
        }

        return (
            <div>
                <div className={styles.message}>
                    {this.getIcon()}
                    {this.getMessage()}
                </div>
                <div className={styles.buttons}>
                    {installButton}
                    {downloadButton}
                    <Button
                        className={styles.button}
                        text={closeText}
                        onClick={onClose}
                    />
                </div>
            </div>
        );
    }
}
