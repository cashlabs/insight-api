'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var rootPath = path.normalize(__dirname + '/..'),
  env,
  db,
  port,
  b_port,
  p2p_port;

var packageStr = fs.readFileSync(rootPath + '/package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || (getUserHome() + '/.insight');
var dotdir, rpcuser, rpcpass;

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3001';
  sslport = '3000';
  b_port = '8332';
  p2p_port = '8333';
  dotdir = '/.bitcoin/';
  rpcuser = 'bitcoinrpc';
} else if (process.env.INSIGHT_NETWORK === 'testnet') {
  env = 'testnet';
  db = home + '/testnet';
  port = '8000'; // 3001 on prod
  // sslport = '3000'; // on prod
  b_port = '18332';
  p2p_port = '18333';
  dotdir = '/.bitcoin/';
  rpcuser = 'bitcoinrpc';
  rpcpass = 'GCa3syfc5boPb5tCKSyVNmh1YXKNoa6cVwyUu4r1NP6d';
} else if (process.env.INSIGHT_NETWORK === 'dogelive') {
  env = 'dogelive';
  db = home;
  port = '8001';
  sslport = '8000';
  b_port = '22555';
  p2p_port = 'R2256';
  dotdir = '/.dogecoin/';
  rpcuser = 'dogecoinrpc';
} else if (process.env.INSIGHT_NETWORK === 'dogetest') {
  env = 'dogetest';
  db = home + '/testnet';
  port = '8000';
  // sslport = '3000'; // on prod
  b_port = '44555';
  p2p_port = '44556';
  dotdir = '/.dogecoin/';
  rpcuser = 'dogecoinrpc';
  rpcpass = 'CAF74RYfPh9Um4eQ5CfYgxQmv6GtKAYq5DbYY17Aq6GR';
} else if (process.env.INSIGHT_NETWORK === 'ltclive') {
  env = 'ltclive';
  db = home;
  port = '8001';
  sslport = '8000';
  b_port = '9332';
  p2p_port = '9333';
  dotdir = '/.litecoin';
  rpcuser = 'litecoinrpc';
} else if (process.env.INSIGHT_NETWORK === 'ltctest') {
  env = 'ltctest',
  db = home + '/testnet';
  port = '8000';
  // sslport = '3000'; // on prod
  b_port = '19332';
  p2p_port = '19333';
  dotdir = '/.litecoin/';
  rpcuser = 'litecoinrpc';
  rpcpass = 'D4V5U6Av2cedHYTwco6V9jYJTVYc5r8vUM8Tpf25nvNZ';
} else if (process.env.INSIGHT_NETWORK === 'demlive') {
  env = 'demlive';
  db = home;
  port = '4000';
  b_port = '6666';
  p2p_port = '5556';
  dotdir = '/.eMark/';
  rpcuser = 'eMarkrpc';
} else if (process.env.INSIGHT_NETWORK === 'demtest') {
  env = 'demtest';
  db = home + '/testnet';
  port = '8000';
  b_port = '16666';
  p2p_port = '15556';
  dotdir = '/.eMark/';
  rpcuser = 'eMarkrpc';
  rpcpass = '8duKjf6K1BomAbxDGgUou2weahXHqRGtqrvL7NzDnUMW';
}
port = parseInt(process.env.INSIGHT_PORT) || port;


switch (process.env.NODE_ENV) {
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
  if (isLinux) dataDir = process.env.HOME + dotdir;
}
// dataDir += network === 'dogetest' ? 'testnet3' : '';
if (network === 'testnet' || network === 'dogetest' || network === 'ltctest' ) {
  dataDir += 'testnet3';
} else if (network === 'demtest') {
  dataDir += 'testnet2';
}

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;

var enableMonitor = process.env.ENABLE_MONITOR === 'true';
var enableCleaner = process.env.ENABLE_CLEANER === 'true';
var enableMailbox = process.env.ENABLE_MAILBOX === 'true';
var enableRatelimiter = process.env.ENABLE_RATELIMITER === 'true';
var loggerLevel = process.env.LOGGER_LEVEL || 'info';
var enableHTTPS = process.env.ENABLE_HTTPS === 'true';

if (!fs.existsSync(db)) {
  mkdirp.sync(db);
}

module.exports = {
  enableMonitor: enableMonitor,
  monitor: require('../plugins/config-monitor.js'),
  enableCleaner: enableCleaner,
  cleaner: require('../plugins/config-cleaner.js'),
  enableMailbox: enableMailbox,
  mailbox: require('../plugins/config-mailbox.js'),
  enableRatelimiter: enableRatelimiter,
  ratelimiter: require('../plugins/config-ratelimiter.js'),
  loggerLevel: loggerLevel,
  enableHTTPS: enableHTTPS,
  version: version,
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: {
    protocol:  process.env.BITCOIND_PROTO || 'http',
    user: process.env.BITCOIND_USER || rpcuser,
    pass: process.env.BITCOIND_PASS || rpcpass,
    host: process.env.BITCOIND_HOST || '127.0.0.1',
    port: process.env.BITCOIND_PORT || b_port,
    p2pHost: process.env.BITCOIND_P2P_HOST || process.env.BITCOIND_HOST || '127.0.0.1',
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
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
