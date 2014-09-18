'use strict';

var path = require('path'),
    fs = require('fs'),
    rootPath = path.normalize(__dirname + '/..'),
    env,
    db,
    port,
    b_port,
    p2p_port;


function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || ( getUserHome()  + '/.insight' );

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3000';
  b_port = '8332';
  p2p_port = '8333';
} else if (process.env.INSIGHT_NETWORK === 'testnet') {
  env = 'testnet';
  db = home + '/testnet';
  port = '3001';
  b_port = '44555';
  p2p_port = '44556';
} else if (process.env.INSIGHT_NETWORK === 'dogetest') {
  env = 'dogetest';
  db = home + '/testnet';
  port = '8000';
  b_port = '44555';
  p2p_port = '44556';
}

switch(process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'testnet';

var dataDir = '';//process.env.BITCOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\Bitcoin\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/Bitcoin/';
  if (isLinux) dataDir = process.env.HOME + '/.dogecoin/';
}
// dataDir += network === 'dogetest' ? 'testnet3' : '';
if (network === 'testnet' || network === 'dogetest' || network === 'ltctest' ) {
  dataDir += 'testnet3';
}


if (! fs.existsSync(db)){

  console.log('## ERROR ##\n\tDB Directory "%s" not found. \n\tCreate it, move your old DB there or set the INSIGHT_DB environment variable.\n\tNOTE: In older insight-api versions, db was stored at <insight-root>/db', db);
  process.exit(-1);
}

module.exports = {
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: {
    protocol:  process.env.BITCOIND_PROTO || 'http',
    user: process.env.BITCOIND_USER || 'dogecoinrpc',
    pass: process.env.BITCOIND_PASS || 'CAF74RYfPh9Um4eQ5CfYgxQmv6GtKAYq5DbYY17Aq6GR',
    host: process.env.BITCOIND_HOST || '127.0.0.1',
    port: process.env.BITCOIND_PORT || b_port,
    p2pPort: process.env.BITCOIND_P2P_PORT || p2p_port,
    dataDir: dataDir,
    // DO NOT CHANGE THIS!
    disableAgent: true
  },
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  }
};
