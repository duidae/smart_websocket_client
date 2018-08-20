import React from 'react';
import HistoryActions from '../actions/HistoryActions';
import styles from '../assets/styles/components/history.css';


var HistoryItem = React.createClass({
  propTypes: {
    request: React.PropTypes.object
  },

  _onClick() {
    HistoryActions.loadRequest(this.props.request);
  },

  _onDestroyClick() {
    HistoryActions.destroyRequest(this.props.request.id);
  },

  render() {
    var request = this.props.request;

    return (
      <li className={styles.itemContainer}>
        <label className={styles.item} onClick={this._onClick}>Message #{request.id}</label>
        <button className={styles.destroy} type="button" onClick={this._onDestroyClick}></button>
      </li>
    );
  }
});

export default HistoryItem;
