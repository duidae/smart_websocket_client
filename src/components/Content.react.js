import React from 'react';
import WebsocketActions from '../actions/WebsocketActions'
import WebsocketStore from '../stores/WebsocketStore'
import ContentStore from '../stores/ContentStore'
import styles from '../assets/styles/components/content.css'
import buttonStyles from '../assets/styles/components/button.css'

var Content = React.createClass({
  getInitialState() {
    return ContentStore.getState();
  },

  componentDidMount() {
    WebsocketStore.listen(this._onChange);
  },

  componentWillUnmount() {
    WebsocketStore.unlisten(this._onChange);
  },

  _onClick(){
    WebsocketActions.sendData(this.state);
  },

  _onClear(){
    this.state.eventName = '';
    this.state.eventId = '';
    this.state.payload = '';
    this.setState(this.state)
    WebsocketActions.requestDataChanged('');
  },

  _onChange(state) {
    this.setState(state)
  },

  _onCheck(state){
    this.state.useProtobuf = !this.state.useProtobuf;
    this.setState(state)
  },

  _onEventNameChange(event){
    this.state.eventName = event.target.value;
    this.setState(this.state)
  },

  _onEventIdChange(event){
    this.state.eventId = event.target.value;
    this.setState(this.state)
  },

  _onPayloadChange(event){
    this.state.payload = event.target.value;
    this.setState(this.state)
  },

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.control}>
         <label className={styles.label}>Edit a message to send:</label>
        </div>
        <div>
          <label className={styles.label}>Event name:</label><input value={this.state.eventName} onChange={this._onEventNameChange}/>
        </div>
        <div>
          <label className={styles.label}>Event id:</label><input value={this.state.eventId} onChange={this._onEventIdChange}/>
        </div>
        <div>
          <label className={styles.label}>Event payload:</label>
          <button type="button" className={buttonStyles.button} onClick={this._onClick}>Send</button>
          <button type="button" className={buttonStyles.buttonClear} onClick={this._onClear}>Clear</button>
          <input className={styles.input} type="checkbox" checked={this.state.useProtobuf} onChange={this._onCheck}>Encode with protocol buffer</input>
        </div>
        <div>
          <textarea className={styles.textarea} placeholder="Enter payload here..." value={this.state.payload} onChange={this._onPayloadChange}></textarea>
        </div>
      </div>
    );
  }
});

export default Content;