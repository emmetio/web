import endorphin from 'endorphin';
// @ts-ignore Importing app UI
import * as EmApp from './components/em-app/em-app.html';
import EmmetStore from './store';

endorphin('em-app', EmApp, {
    target: document.body,
    store: new EmmetStore()
});
