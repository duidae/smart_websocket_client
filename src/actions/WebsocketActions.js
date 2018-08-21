import alt from '../alt';
import * as constants from '../sources/WebsocketSource';
import WebsocketSource from '../sources/WebsocketSource';

import {CARTA} from 'carta-protobuf';

var self;

class WebsocketActions {
  constructor() {
    self = this;
  }

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
    // handling payload data, encode with protobuf or not
    let eventData = '';
    if(contentStore.useProtobuf === true) { // encode protobuf here
      eventData = self._encodeEvent(contentStore.eventName, contentStore.eventId, contentStore.payload);
    }
    else {
      eventData = contentStore.eventName + ' ' + contentStore.eventId + ' ' + contentStore.payload;
    }

    // send data via WebsocketSource
    WebsocketSource.send(eventData);

    // debug message
    if(__DEV__) {
      console.log('Encode using protobuf:', contentStore.useProtobuf);
      console.log('Eventname:', contentStore.eventName);
      console.log('EventId:', contentStore.eventId);
      console.log('Payload:', contentStore.payload);
      console.log('[Client sent]: ', eventData);
    }
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
    // debug message
    if(__DEV__) {
      console.log(respond.data);
      //console.log(self._messageHandler(respond));
    }
    this.dispatch(self._messageHandler(respond));
  }

  addressChanged(address) {
    this.dispatch(address);
  }

  requestDataChanged(data) {
    this.dispatch(data);
  }

  _encodeEvent(eventName, eventId, payload) {
    let encodedMessage = '';

    if (eventName === "REGISTER_VIEWER") {
      encodedMessage = CARTA.RegisterViewer.encode(payload).finish();
    }
    else if (eventName === "FILE_LIST_REQUEST") {
      encodedMessage = CARTA.FileListRequest.encode(payload).finish();
    }
    else if (eventName === "FILE_INFO_REQUEST") {
      encodedMessage = CARTA.FileInfoRequest.encode(payload).finish();
    }
    else if (eventName === "OPEN_FILE") {
      encodedMessage = CARTA.OpenFile.encode(payload).finish();
    }
    else if (eventName === "CLOSE_FILE") {
      encodedMessage = CARTA.CloseFile.encode(payload).finish();
    }
    else if (eventName === "SET_IMAGE_VIEW") {
      encodedMessage = CARTA.SetImageView.encode(payload).finish();
    }
    else {
      console.log(`Unsupported event response ${eventName}`);
    }

    let eventData = '';
    eventData = new Uint8Array(32 + 4 + encodedMessage.byteLength);
    eventData.set(self._stringToUint8Array(eventName, 32));
    eventData.set(new Uint8Array(new Uint32Array([eventId]).buffer), 32);
    eventData.set(encodedMessage, 36);
    return eventData;
  }

  _stringToUint8Array(str, padLength) {
    const bytes = new Uint8Array(padLength);
    for (let i = 0; i < Math.min(str.length, padLength); i++) {
        const charCode = str.charCodeAt(i);
        bytes[i] = (charCode <= 0xFF ? charCode : 0);
    }
    return bytes;
  }

  _messageHandler(respond) {
    if (respond.data.byteLength < 40) {
        console.log("Unknown event format");
        return {
          address: respond.address,
          type: respond.type,
          data: 'Unknown event format'
        };
    }

    const eventName = self._getEventName(new Uint8Array(respond.data, 0, 32));
    const eventId = new Uint32Array(respond.data, 32, 1)[0];
    const eventData = new Uint8Array(respond.data, 36);

    try {
      let parsedMessage;
      if (eventName === "REGISTER_VIEWER_ACK") {
        parsedMessage = CARTA.RegisterViewerAck.decode(eventData);
      }
      else if (eventName === "FILE_LIST_RESPONSE") {
        parsedMessage = CARTA.FileListResponse.decode(eventData);
      }
      else if (eventName === "FILE_INFO_RESPONSE") {
        parsedMessage = CARTA.FileInfoResponse.decode(eventData);
      }
      else if (eventName === "OPEN_FILE_ACK") {
        parsedMessage = CARTA.OpenFileAck.decode(eventData);
      }
      else if (eventName === "RASTER_IMAGE_DATA") {
        parsedMessage = CARTA.RasterImageData.decode(eventData);
      }
      else if (eventName === "REGION_HISTOGRAM_DATA") {
        parsedMessage = CARTA.RegionHistogramData.decode(eventData);
      }
      else {
        parsedMessage = 'Unsupported event response';
      }
        
      return {
        address: respond.address,
        type: respond.type,
        data: eventName + ' ' + eventId + ' ' + parsedMessage
      };
    } catch (e) {
      console.log(e);
      
      return {
        address: respond.address,
        type: respond.type,
        data: 'decode exception: ' + e 
      };
    }
  }

  _getEventName(byteArray) {
    if (!byteArray || byteArray.length < 32) {
        return "";
    }
    const nullIndex = byteArray.indexOf(0);
    if (nullIndex >= 0) {
        byteArray = byteArray.slice(0, byteArray.indexOf(0));
    }
    return String.fromCharCode.apply(null, byteArray);
  }
}

export default alt.createActions(WebsocketActions);
