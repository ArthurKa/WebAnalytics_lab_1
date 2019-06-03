const fs = require('fs');
const { Ok, Err } = require('pratica');
const { MongoClient } = require('mongodb');

const config = 'mongodb://localhost:27017';
const collectionName = 'logs';

module.exports.parseLogs = async () => {
  const logsRaw = fs.readFileSync('./logs/access_log').toString();
  const parsedLogs = parseLogs(logsRaw);

  const client = await MongoClient.connect(config, { useNewUrlParser: true });

  const logsCollection = client.db('lab1').collection(collectionName);
  logsCollection.insertMany(parsedLogs);

  client.close();
};


function isLineValid(log) {
  const hasRemoteHost = data => data.remoteHost ? Ok(data) : Err('remoteHost is not present');
  const hasRequestTime = data => data.requestTime ? Ok(data) : Err('requestTime is not present');
  const hasRequestLine = data => data.requestLine ? Ok(data) : Err('requestLine is not present');
  const hasStatusCode = data => data.statusCode ? Ok(data) : Err('statusCode is not present');
  const hasResponseSize = data => data.responseSize ? Ok(data) : Err('responseSize is not present');

  const res = hasRemoteHost(log)
    .chain(hasRequestTime)
    .chain(hasRequestLine)
    .chain(hasStatusCode)
    .chain(hasResponseSize)
    .cata({
      Ok: () => true,
      Err: () => false
    });

  return res;
}
function parseLogs(logsRaw) {
  const logsByLine = logsRaw.split('\n')
  const logsParsed = [];

  for (const line of logsByLine) {
    const log = {};

    log.remoteHost = line.match(/.+?(?=\s-\s-)/g);
    log.requestTime = line.match(/(\[.+\d\])/g);
    log.requestLine = line.match(/".+"/g);
    log.statusCode = line.match(/(?<=(".+"\s))\d{3}/g);
    log.responseSize = line.match(/(?<=(".+"\s\d{3}\s))(\d+|-)/g);

    if (!isLineValid(log)) continue;

    logsParsed.push({
      remoteHost: log.remoteHost[0],
      requestTime: log.requestTime[0],
      requestLine: log.requestLine[0],
      statusCode: log.statusCode[0],
      responseSize: log.responseSize[0],
    });
  }

  return logsParsed;
}

if (!module.parent) {
  module.exports.parseLogs();
}