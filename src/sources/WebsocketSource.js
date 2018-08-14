import assign from 'object-assign'
import EventEmitter from 'events'

import CARTA from "carta-protobuf";
import ContentStore from '../stores/ContentStore';

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
    let eventData;
    if(contentStore.useProtobuf) { // encode protobuf here
      eventData = '=== under construction ===';
      /*
      let eventData = new Uint8Array(32 + 4 + payload.byteLength);
      eventData.set(this.stringToUint8Array(eventName, 32));
      eventData.set(new Uint8Array(new Uint32Array([eventId]).buffer), 32);
      eventData.set(payload, 36);
      */
    }
    else {
      eventData = contentStore.eventName + contentStore.eventId + contentStore.payload;
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
    self.emit(MESSAGE_EVENT, event.data)
  }
}

export default new WebsocketSource();