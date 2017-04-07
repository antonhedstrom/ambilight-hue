
const filePath = './data/';
const storeId = 'hue-ambiligt';
const store = require('json-fs-store')(filePath);

module.exports = {
  setData: function setData(key, value) {
    return new Promise((resolve, reject) => {
      this.getData().then((data) => {
        if (!data.id) {
          data.id = storeId;
        }
        data[key] = value;
        store.add(data, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }).catch(reject);
    });
  },
  getData: key => new Promise((resolve, reject) => {
    store.load(storeId, (err, object) => {
      // err if JSON parsing failed
      if (err) {
        if (key) {
          reject();
        } else {
          resolve({});
        }
      } else if (key) {
        if (object && object[key] !== undefined) {
          resolve(object[key]);
        } else {
          reject(new Error('Key doesn\'t exists'));
        }
      } else {
        resolve(object);
      }
    });
  }),
};
