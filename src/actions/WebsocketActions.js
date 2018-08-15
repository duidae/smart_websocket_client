import alt from '../alt';
import * as constants from '../sources/WebsocketSource';
import WebsocketSource from '../sources/WebsocketSource';

class WebsocketActions {
  initWebsocket() {
    WebsocketSource.on(constants.OPEN_EVENT, this.actions.websocketOpened);
    WebsocketSource.on(constants.CLOSE_EVENT, this.actions.websocketClosed);
    WebsocketSource.on(constants.MESSAGE_EVENT, this.actions.websocketReceived);
    WebsocketSource.on(constants.EXCEPTION_EVENT, this.actions.websocketFailed);
    WebsocketSource.on(constants.ERROR_EVENT, this.actions.websocketFailed);
    WebsocketSource.on(constants.SENT_EVENT, this.actions.dataSent);
  }

  openWebsocket(address) {
    try {
      WebsocketSource.connect(address);
    } catch (e) {
      this.actions.websocketFailed(e.message);
    }
  }

  closeWebsocket() {
    WebsocketSource.close();
  }

  sendData(contentStore) {
    WebsocketSource.send(contentStore);
  }

  dataSent(request) {
    this.dispatch(request);
  }

  websocketClosed() {
    this.dispatch();
  }

  websocketOpened() {
    this.dispatch();
  }

  websocketFailed(message) {
    if(__DEV__) {
      console.log(message);
    }
    this.dispatch(message);
  }

  websocketReceived(respond) {
    if(__DEV__) {
      console.log(respond.data);
    }
    this.dispatch(respond);
  }

  addressChanged(address) {
    this.dispatch(address);
  }

  requestDataChanged(data) {
    this.dispatch(data);
  }
}

export default alt.createActions(WebsocketActions);
