import React from 'react';
import HistoryStore from '../stores/HistoryStore';
import styles from '../assets/styles/components/log.css';

var Log = React.createClass({
  getInitialState() {
    return HistoryStore.getState();
  },

  componentDidMount() {
    HistoryStore.listen(this._onChange);
  },

  componentWillUnmount() {
    HistoryStore.unlisten(this._onChange);
  },

  _onChange(state) {
    this.setState(state);
  },

  render() {
    let log = '';
    for(let i = 0; i < this.state.requests.length; i++) {
      log += ('[' + this.state.requests[i].type + ' #' + this.state.requests[i].id + '] ' + this.state.requests[i].data + '\n');
    }

    return (
      <div className={styles.root}>
        <div className={styles.control}>
         <label className={styles.label}>Log: (decoding with protocol buffer by default)</label>
        </div>
        <textarea className={styles.textarea} value={log} readOnly={true} editorProps={{$blockScrolling: Infinity}}></textarea>
      </div>
    );
  }
});

export default Log;