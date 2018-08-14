import alt from '../alt';

class ContentStore {
  constructor() {
    this.useProtobuf = true;
    this.eventName = 'REGISTER_VIEWER';
    this.eventId = '0';
    this.payload = '';
  }
}

export default alt.createStore(ContentStore, 'ContentStore');