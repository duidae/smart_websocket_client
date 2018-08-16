import React from 'react';
import WebsocketStore from '../stores/WebsocketStore'
import styles from '../assets/styles/components/messages.css'
import _ from 'lodash'

var Messages = React.createClass({
  getInitialState() {
    return {
      messages: []
    }
  },

  componentDidMount() {
    WebsocketStore.listen(this._onChange);
  },

  componentWillUnmount() {
    WebsocketStore.unlisten(this._onChange);
  },

  _onChange(state) {
    this.setState({
      messages: state.errorMessage
    });
  },

  render() {
    var list = [];
    var className = styles.error;

    if(_.isArray(this.state.messages)) {
      this.state.messages.forEach(function(item, index) {
        list.push(<li key={index} className={styles.message}>{item}</li>);
      })
    } else if(this.state.messages) {
      list.push(<li key={0} className={styles.message}>{this.state.messages}</li>);
    }

    if(list.length === 0) {
      className = styles.info;
      list.push(<li key={0} className={styles.message}>Everything is ok, ready to go!</li>)
    }

    return (
      <ul className={className}>
        {list}
      </ul>
    );
  }
});

export default Messages;
