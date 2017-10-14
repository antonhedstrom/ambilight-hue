const cache = require('memory-cache');

const Store = require('./services/store');

/*
Cache for storing the mapping between Light IDs and Ambilight Panel (which part of the TV to track)
*/

// Monkey patch put method since we also want to store this as a file.
const oldSetMethod = cache.put;

cache.put = function(key, val) {
  const allData = cache.exportJson();
  allData[key] = val;
  // Store in file async...
  Store.setData('lights-mapping', data).then(data => {
    return;
  }, err => {
    console.log(`Failed to write lights-mapping to disk.`);
  });

  return oldSetMethod.apply(this, arguments);
};

// Alias
cache.set = cache.put;

module.exports = cache;
