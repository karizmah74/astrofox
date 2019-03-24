import React, { Component } from 'react';
import { events } from 'app/global';
import { ignoreEvents } from 'utils/react';
import About from 'components/window/About';
import AppUpdates from 'components/window/AppUpdates';
import Dialog from 'components/window/Dialog';
import ModalWindow from 'components/window/ModalWindow';
import Overlay from 'components/window/Overlay';
import ControlPicker from 'components/window/ControlPicker';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import AppSettings from 'components/settings/AppSettings';
import CanvasSettings from 'components/settings/CanvasSettings';
import VideoSettings from 'components/settings/VideoSettings';
import ControlDock from 'components/panels/ControlDock';
import MenuBar from 'components/nav/MenuBar';
import Player from 'components/audio/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import menuConfig from 'config/menu.json';
import fontOptions from 'config/fonts.json';
import styles from './App.less';

export const AppContext = React.createContext();

export default class App extends Component {
  state = {
    statusBarText: '',
    modals: [],
    reactor: null,
    showControlDock: true,
    showPlayer: true,
    showReactor: false,
  };

  componentDidMount() {
    const { app } = this.props;

    app.init();

    events.on('error', this.showErrorDialog);

    events.on('pick-control', this.loadControlPicker);

    events.on('audio-tags', this.loadAudioTags);

    events.on('menu-action', this.handleMenuAction);

    events.on('unsaved-changes', this.handleUnsavedChanges);

    events.on('reactor-edit', this.showReactor);

    events.on('has-app-update', this.showCheckForUpdates);

    app.startRender();
  }

  handleMenuAction = action => {
    const { app } = this.props;

    switch (action) {
      case 'new-project':
        app.newProject();
        break;

      case 'open-project':
        app.openProject();
        break;

      case 'save-project':
        app.saveProject(app.projectFile);
        break;

      case 'save-project-as':
        app.saveProject(null);
        break;

      case 'load-audio':
        app.openAudioFile();
        break;

      case 'save-image':
        app.saveImage();
        break;

      case 'save-video':
        this.showModal(<VideoSettings onStart={this.startVideoRender} />, {
          title: 'Save Video',
          buttons: false,
        });
        break;

      case 'edit-canvas':
        this.showModal(<CanvasSettings />, { title: 'Canvas', buttons: false });
        break;

      case 'edit-settings':
        this.showModal(<AppSettings />, { title: 'Settings', buttons: false });
        break;

      case 'zoom-in':
        app.stage.setZoom(1);
        break;

      case 'zoom-out':
        app.stage.setZoom(-1);
        break;

      case 'zoom-reset':
        app.stage.setZoom(0);
        break;

      case 'view-control-dock':
        this.setState(({ showControlDock }) => ({ showControlDock: !showControlDock }));
        break;

      case 'view-player':
        this.setState(({ showPlayer }) => ({ showPlayer: !showPlayer }));
        break;

      case 'check-for-updates':
        this.showCheckForUpdates();
        break;

      case 'about':
        this.showModal(<About />, { title: false, buttons: false });
        break;

      case 'exit':
        app.exit();
        break;
    }
  };

  handleUnsavedChanges = callback => {
    const { app } = this.props;

    this.showDialog(
      {
        message: 'Do you want to save project changes before closing?',
      },
      {
        title: 'Unsaved Changes',
        buttons: ['Yes', 'No', 'Cancel'],
      },
      button => {
        if (button === 'Yes') {
          app.saveProject(app.projectFile, callback);
        } else if (button === 'No') {
          callback();
        }
      },
    );
  };

  showModal = (content, props) => {
    if (this.dialogShown) return;

    this.setState(({ modals }) => ({
      modals: modals.concat([
        <ModalWindow
          key={modals.length}
          onClose={() => this.hideModal()}
          buttons={['OK']}
          {...props}
        >
          {content}
        </ModalWindow>,
      ]),
    }));
  };

  hideModal = callback => {
    this.setState(({ modals }) => {
      modals.pop();
      return { modals };
    }, callback);
  };

  showDialog = ({ icon, message }, props, callback) => {
    if (this.dialogShown) return;

    this.showModal(<Dialog icon={icon} message={message} />, {
      onClose: button => {
        this.hideModal();
        this.dialogShown = false;
        if (callback) callback(button);
      },
      ...props,
    });

    this.dialogShown = true;
  };

  showErrorDialog = message => {
    this.showDialog({
      title: 'Error',
      icon: 'icon-warning',
      message,
    });
  };

  showCheckForUpdates = () => {
    if (this.updatesShown) return;

    this.updatesShown = true;

    const onClose = () => {
      this.hideModal();
      this.updatesShown = false;
    };

    this.showModal(<AppUpdates />, { title: 'Updates', buttons: false, onClose });
  };

  showReactor = reactor => {
    this.setState(() => ({
      reactor,
      showReactor: reactor,
    }));
  };

  startVideoRender = ({ videoFile, audioFile, ...options }) => {
    const { app } = this.props;

    this.hideModal(() => {
      app.saveVideo(videoFile, audioFile, options);
    });
  };

  loadControlPicker = (type, callback) => {
    this.showModal(<ControlPicker type={type} onControlPicked={callback} />, {
      title: 'Add Control',
      buttons: ['Close'],
    });
  };

  loadAudioTags = ({ artist, title }) => {
    if (artist) {
      // eslint-disable-next-line
      const trim = str => str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

      this.setState({ statusBarText: `${trim(artist)} - ${trim(title)}` });
    }
  };

  render() {
    const { app } = this.props;
    const { showPlayer, showControlDock, showReactor, reactor, statusBarText, modals } = this.state;

    return (
      <AppContext.Provider value={app}>
        <div
          className={styles.container}
          role="presentation"
          onDrop={ignoreEvents}
          onDragOver={ignoreEvents}
        >
          <Preload />
          <TitleBar />
          <MenuBar items={menuConfig} onMenuAction={this.handleMenuAction} />
          <div className={styles.body}>
            <div className={styles.viewport}>
              <Stage />
              <Player visible={showPlayer} />
              <ReactorControl visible={showReactor} reactor={reactor} />
            </div>
            <ControlDock visible={showControlDock} />
          </div>
          <StatusBar text={statusBarText} />
          <Overlay>{modals}</Overlay>
        </div>
      </AppContext.Provider>
    );
  }
}

const Preload = () => (
  <div className={styles.preload}>
    {fontOptions.map((item, index) => (
      <div key={index} style={{ fontFamily: item }}>
        {item}
      </div>
    ))}
  </div>
);
