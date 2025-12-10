/* eslint-disable no-undef */
/*
  NetworkManager - Handles peer-to-peer connections using PeerJS
  Manages both host and client connections for online multiplayer games
  Note: Peer is a global object from PeerJS CDN included in index.html
*/

export class NetworkManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.isHost = false;
  }

  // Initialize peer and set up for hosting or connecting
  init(isHost, onConnected) {
    this.isHost = isHost;
    this.peer = new Peer();

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    if (isHost) {
      this.peer.on('open', (id) => {
        console.log('Host ID:', id);
        this.peer.on('connection', (conn) => {
          this.setupConnection(conn, onConnected);
        });
      });
    }
  }

  // Connect to a host using their ID
  connect(hostId, onConnected) {
    if (!this.peer) {
      this.peer = new Peer();
    }

    this.peer.on('open', () => {
      this.connection = this.peer.connect(hostId);
      this.setupConnection(this.connection, onConnected);
    });
  }

  // Set up connection event handlers
  setupConnection(conn, callback) {
    this.connection = conn;

    this.connection.on('open', () => {
      console.log('Connected');
      if (callback) callback();
    });

    this.connection.on('data', (data) => {
      this.handleData(data);
    });

    this.connection.on('error', (err) => {
      console.error('Connection error:', err);
    });

    this.connection.on('close', () => {
      console.log('Connection closed');
    });
  }

  // Send data to the other peer
  send(type, payload) {
    if (this.connection && this.connection.open) {
      this.connection.send({ type, payload });
    }
  }

  // Handle incoming data from peer
  handleData(data) {
    const { type, payload } = data;

    // Dispatch based on type - handlers should be registered in App.js
    if (window.__networkHandlers && window.__networkHandlers[type]) {
      window.__networkHandlers[type](payload);
    }
  }

  // Generate a 4-character alphanumeric code from Peer ID
  generateId() {
    if (!this.peer || !this.peer.id) return '';
    return this.peer.id.substring(0, 4).toUpperCase();
  }

  // Get the peer ID (for joining)
  getPeerId() {
    return this.peer ? this.peer.id : '';
  }

  // Close the connection
  disconnect() {
    if (this.connection) {
      this.connection.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }
}
