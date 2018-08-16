import React from 'react';
import HistoryStore from '../stores/HistoryStore';
import HistoryActions from '../actions/HistoryActions';
import styles from '../assets/styles/components/log.css';

var Log = React.createClass({
  getInitialState() {
    return HistoryStore.getState();
  },

  componentDidMount() {
    HistoryStore.listen(this._onChange);
    HistoryActions.setupDatabase();
  },

  componentWillUnmount() {
    HistoryStore.unlisten(this._onChange);
  },

  _onChange(state) {
    this.setState({
      requests: state.requests
    });
  },

  render() {
    let log = '';
    for(let i = 0; i < this.state.requests.length; i++) {
      log += (this.state.requests[i].id + ' ' + this.state.requests[i].type + ' ' + this.state.requests[i].data + '\n');
    }

    return (
      <div className={styles.root}>
        <div className={styles.control}>
         <label className={styles.label}>Log: </label>
         <input className={styles.input} type="checkbox">Decode with protocol buffer</input>
        </div>
        <textarea className={styles.textarea} value={log} readOnly={true} editorProps={{$blockScrolling: Infinity}}></textarea>
      </div>
    );
  }
});

export default Log;