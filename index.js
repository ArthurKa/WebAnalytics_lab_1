const fs = require('fs');
const { parseLogs } = require('./parseLogs');
const { MongoClient } = require('mongodb');

const config = 'mongodb://localhost:27017';
const collectionName = 'logs';

(async () => {
  const client = await MongoClient.connect(config, { useNewUrlParser: true });
  const logsCollection = client.db('lab1').collection(collectionName);

  await logsCollection.deleteMany();

  await parseLogs();

  const log = await logsCollection.find().toArray();

  changeDate(log);

  detect(log);

  client.close();
})();

function detect(log) {
  let startTime = log[0].requestTime;
  let endTime = new Date(startTime.getTime() + (60000));
  const lastTime = log[log.length - 1].requestTime;

  let top = [];

  while (startTime < lastTime) {

    startTime = new Date(startTime.getTime() + 5000);
    endTime = new Date(endTime.getTime() + 5000);

    const fiveMinuteSlice = log.filter((e) => startTime <= e.requestTime && e.requestTime < endTime );

    if (!fiveMinuteSlice.length) continue;

    const grouped = groupBy(fiveMinuteSlice, e => e.remoteHost);

    topHandler(top, grouped);
  }

  top.sort((a, b) => b.operationsPerInterval - a.operationsPerInterval);

  fs.writeFileSync('./topFive.txt', JSON.stringify(top.slice(0, 5), null, 2));
  fs.writeFileSync('./top.txt', JSON.stringify(top, null, 2));
}
function topHandler(top, cur) {
  if (!top.length) {
    for (const [key, value] of cur.entries()) {
      top.push({
        remoteHost: key,
        operationsPerInterval: value.length,
      });
    }
  } else {
    for (const [key, value] of cur.entries()) {
      if (!top.find(e => e.remoteHost === key)) {
        top.push({
          remoteHost: key,
          operationsPerInterval: value.length,
        });
      } else {
        for (let i = 0; i < top.length; i++) {
          if (top[i].remoteHost === key && top[i].operationsPerInterval < value.length) {
            top[i].operationsPerInterval = value.length;
          }
        }
      }
    }
  }

}
function topHandler2(topFive, cur) {
  for (const [key, value] of cur.entries()) {
    topFive.push({
      remoteHost: key,
      operationsPerInterval: value.length,
    });
  }

  if (topFive.length > 5) {
    topFive = topFive.sort((a, b) => b.operationsPerInterval - a.operationsPerInterval).slice(0, 5);
  }
  return topFive;
}
function changeDate(log) {
  for (let i = 0; i < log.length; i++) {
    const time = log[i].requestTime.replace(/\[| -0800\]/g, '');

    const arr = time.split('/');
    arr[2] = arr[2].split(':');

    log[i].requestTime = new Date(`${arr[2][0]}-${arr[1]}-${arr[0]}-${arr[2][1]}:${arr[2][2]}:${arr[2][3]}`);
  }
}
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}
