import assign from 'object-assign'
import EventEmitter from 'events'

import {CARTA} from 'carta-protobuf';

export const OPEN_EVENT = 'open';
export const CLOSE_EVENT = 'close';
export const ERROR_EVENT = '_error'; //event cannot just be 'error', or the EventEmitter will raise an error.
export const MESSAGE_EVENT = 'message';
export const EXCEPTION_EVENT = 'exception';
export const SENT_EVENT = 'sent';

var self;

class WebsocketSource {
  constructor() {
    assign(this, EventEmitter.prototype);
    this.connection = null;
    self = this;
  }

  connect(address) {
    this.connection = new WebSocket(address);
    this.connection.onclose = this._onClose;
    this.connection.onopen = this._onOpen;
    this.connection.onerror = this._onError;
    this.connection.onmessage = this._onMessage;

    return this;
  }

  send(contentStore) {
    let eventData = '';
    if(contentStore.useProtobuf) { // encode protobuf here
      //eventData = contentStore.eventName + ' ' + contentStore.eventId + ' ' + '=== protobuf under construction ===';
      eventData = this._encodeEvent(contentStore.eventName, contentStore.eventId, contentStore.payload);
    }
    else {
      eventData = contentStore.eventName + ' ' + contentStore.eventId + ' ' + contentStore.payload;
    }
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      if(__DEV__) {
        console.log('Using protobuf:', contentStore.useProtobuf);
        console.log('Eventname:', contentStore.eventName);
        console.log('EventId:', contentStore.eventId);
        console.log('Payload:', contentStore.payload);
        console.log('[Client sent]: ', eventData);
      }
      this.emit(SENT_EVENT, {
        address: this.connection.url,
        type: "Client sent",
        data: eventData
      });
      this.connection.send(eventData);
    } else {
      self.emit(EXCEPTION_EVENT, 'The websocket has not connected to the server');
    }
  }

  close() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  _reset() {
   this.close();
  }

  _onOpen() {
    self.emit(OPEN_EVENT);
  }

  _onClose() {
    self.emit(CLOSE_EVENT);
  }

  _onError(event) {
    this._reset();
    self.emit(ERROR_EVENT, 'Can not connect to ' + event.target.url);
  }

  _onMessage(event) {
    self.emit(MESSAGE_EVENT, {
      address: event.target.url,
      type: "Server respond",
      data: event.data
    });
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
    eventData.set(this._stringToUint8Array(eventName, 32));
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
}

export default new WebsocketSource();