import alt from '../alt';

class ContentStore {
  constructor() {
    this.useProtobuf = true;
    this.eventName = 'REGISTER_VIEWER_ACK';
    this.eventId = '0';
    this.payload = '';
  }
}

export default alt.createStore(ContentStore, 'ContentStore');