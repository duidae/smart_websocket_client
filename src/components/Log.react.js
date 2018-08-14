import React from 'react';
import WebsocketStore from '../stores/WebsocketStore';
import styles from '../assets/styles/components/log.css';
import buttonStyles from '../assets/styles/components/button.css'

var Log = React.createClass({
  getInitialState() {
    return {
      content: this.props.content
    }
  },

  componentDidMount() {
    WebsocketStore.listen(this._onChange);
  },

  componentWillUnmount() {
    WebsocketStore.unlisten(this._onChange);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextState.content === this.state.content);
  },

  _onChange(state) {
    this.setState({
      content: state.data
    });
  },

  _onClear() {
    this.setState({
      content: ''
    });
  },

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.control}>
         <label className={styles.label}>Log: </label>
         <button type="button" className={buttonStyles.buttonClear} onClick={this._onClear}>Clear</button>
         <input className={styles.input} type="checkbox">Decode with protocol buffer</input>
        </div>
        <textarea className={styles.textarea} value={this.state.content} readOnly={true} editorProps={{$blockScrolling: Infinity}}></textarea>
      </div>
    );
  }
});

export default Log;