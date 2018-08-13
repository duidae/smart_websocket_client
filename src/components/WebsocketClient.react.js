import React from 'react';

import AddressBar from './AddressBar.react';
import Content from './Content.react';
import Log from './Log.react';
import Messages from './Messages.react';
import styles from '../assets/styles/components/websocketClient.css';

var WebsocketClient = React.createClass({
  render() {
    return (
      <div className={styles.root}>
        <div className={styles.content}>
          <Messages />
          <AddressBar />
          <Content />
          <Log />
        </div>
      </div>
    );
  }
});

export default WebsocketClient;