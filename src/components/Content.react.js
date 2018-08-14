import React from 'react';
import WebsocketActions from '../actions/WebsocketActions'
import WebsocketStore from '../stores/WebsocketStore'
import ContentStore from '../stores/ContentStore'
import styles from '../assets/styles/components/content.css'
import buttonStyles from '../assets/styles/components/button.css'

var Content = React.createClass({
  getInitialState() {
    var contentStore = ContentStore.getState();
    return {
      contentStore: contentStore
    }
  },

  componentDidMount() {
    WebsocketStore.listen(this._onChange);
  },

  componentWillUnmount() {
    WebsocketStore.unlisten(this._onChange);
  },

  _onClick(){
    WebsocketActions.sendData(this.state.contentStore);
  },

  _onClear(){
    this.state.contentStore.eventName = '';
    this.state.contentStore.eventId = '';
    this.state.contentStore.payload = '';
    this.setState({
      contentStore: this.state.contentStore
    })
    WebsocketActions.requestDataChanged('');
  },

  _onChange(state) {
    this.setState({
      contentStore: this.state.contentStore
    })
  },

  _onCheck(){
    this.state.contentStore.useProtobuf = !this.state.contentStore.useProtobuf;
    this.setState({
      contentStore: this.state.contentStore
    })
  },

  _onEventNameChange(event){
    this.state.contentStore.eventName = event.target.value;
    this.setState({
      contentStore: this.state.contentStore
    })
  },

  _onEventIdChange(event){
    this.state.contentStore.eventId = event.target.value;
    this.setState({
      contentStore: this.state.contentStore
    })
  },

  _onPayloadChange(event){
    this.state.contentStore.payload = event.target.value;
    this.setState({
      contentStore: this.state.contentStore
    })
  },

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.control}>
         <label className={styles.label}>Edit a message to send:</label>
        </div>
        <div>
          <label className={styles.label}>Event name:</label><input value={this.state.contentStore.eventName} onChange={this._onEventNameChange}/>
        </div>
        <div>
          <label className={styles.label}>Event id:</label><input value={this.state.contentStore.eventId} onChange={this._onEventIdChange}/>
        </div>
        <div>
          <label className={styles.label}>Event payload:</label>
          <button type="button" className={buttonStyles.button} onClick={this._onClick}>Send</button>
          <button type="button" className={buttonStyles.buttonClear} onClick={this._onClear}>Clear</button>
          <input className={styles.input} type="checkbox" checked={this.state.contentStore.useProtobuf} onChange={this._onCheck}>Encode with protocol buffer</input>
        </div>
        <div>
          <textarea className={styles.textarea} value={this.state.contentStore.payload} onChange={this._onPayloadChange}></textarea>
        </div>
      </div>
    );
  }
});

export default Content;