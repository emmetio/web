import endorphin from 'endorphin';
// @ts-ignore Importing app UI
import * as EmApp from './components/em-app/em-app.html';

endorphin('em-app', EmApp, { target: document.body });
