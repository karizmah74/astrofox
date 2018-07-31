import { remote } from 'electron';

export const {
    APP_NAME,
    APP_VERSION,
    APP_PATH,
    USER_DATA_PATH,
    TEMP_PATH,
    FFMPEG_PATH,
    APP_CONFIG_FILE,
    LICENSE_FILE,
} = remote.getGlobal('env');
