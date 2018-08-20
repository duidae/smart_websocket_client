import alt from '../alt';

const MAX_MESSAGE = 150;

var historyDb = {};

class HistoryActions {
  setupDatabase() {
    var self = this;

    var loadRequestItems = function(tx, rs) {
      var requests = [];

      for(var i = 0; i < rs.rows.length; i++) {
        requests.push(rs.rows.item(i));
      }

      self.actions.requestsLoaded(requests);
    };

    historyDb.open = function() {
      var dbSize = 10 * 1024 * 1024; // 10MB
      historyDb.db = openDatabase('Message', '1', 'Request history', dbSize);
    };

    historyDb.onError = function(tx, e) {
      if(__DEV__) {
        console.log('database error', e.message);
      }
    };

    historyDb.onInsertSuccess = function(request) {
      return function(fx, r) {
        request.id = r.insertId;
        self.actions.requestAdded(request);
      }
    };

    historyDb.onDeleteSuccess = function(requestId) {
      return function() {
        self.actions.requestDestroyed(requestId);
      }
    };

    historyDb.createTable = function() {
      var db = historyDb.db;
      db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS " +
        "msg(id INTEGER PRIMARY KEY ASC, address TEXT, type TEXT, data TEXT)", []);
      })
    };

    historyDb.addRequest = function(request) {
      var db = historyDb.db;
      db.transaction(function(tx){
        tx.executeSql("INSERT INTO msg(address, type, data) VALUES (?,?,?)",
          [request.address, request.type, request.data],
          historyDb.onInsertSuccess(request),
          historyDb.onError);
      });
    };

    historyDb.deleteRequest = function(requestId) {
      var db = historyDb.db;
      db.transaction(function(tx){
        tx.executeSql("DELETE FROM msg WHERE id=?",
          [requestId],
          historyDb.onDeleteSuccess(requestId),
          historyDb.onError);
      });
    };

    historyDb.getAllRequestItems = function(successCallback) {
      var db = historyDb.db;
      db.transaction(function(tx) {
        tx.executeSql(`SELECT * FROM msg ORDER BY id DESC LIMIT ${MAX_MESSAGE}`, [], successCallback,
          historyDb.onError);
      });
    };

    historyDb.onClearSuccess = function() {
      self.actions.requestsLoaded([]);
    };

    historyDb.clear = function() {
      var db = historyDb.db;
      db.transaction(function(tx) {
        tx.executeSql("DELETE FROM msg", [], historyDb.onClearSuccess,
          historyDb.onError);
      });
    };

    historyDb.open();
    historyDb.createTable();
    historyDb.getAllRequestItems(loadRequestItems);
  }


  addRequest(request) {
    historyDb.addRequest(request);
  }

  clearRequests() {
    historyDb.clear();
  }

  requestAdded(request) {
    this.dispatch(request);
  }

  requestsLoaded(requests) {
    this.dispatch(requests);
  }

  loadRequest(request) {
    this.dispatch(request);
  }

  destroyRequest(requestId) {
    historyDb.deleteRequest(requestId);
  }

  requestDestroyed(requestId) {
    this.dispatch(requestId);
  }
}

export default alt.createActions(HistoryActions);
