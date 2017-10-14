const ajaxRequest = require('ajax-request');

function PhilipsTV(options) {
  this.ip = options.ip;
  this.port = options.port || 1925;
  this.rootPath = options.rootPath || '1';
}

PhilipsTV.prototype.getBaseUrl = function() {
  return `http://${this.ip}:${this.port}/${this.rootPath}`;
};

PhilipsTV.prototype.getAmbilightData = function() {
  return new Promise((resolve, reject) => {
    ajaxRequest({
      method: 'GET',
      url: this.getBaseUrl() + '/ambilight/measured'
    }, function (error, response, body) {
      if ( error ) {
        return reject(error);
      }

      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
};

PhilipsTV.prototype.getAmbilightMode = function() {
  return new Promise((resolve, reject) => {
    ajaxRequest({
      method: 'GET',
      url: this.getBaseUrl() + '/ambilight/mode'
    }, function (error, response, body) {
      if ( error ) {
        return reject(error);
      }

      try {
        const data = JSON.parse(body);
        resolve(data.current);
      } catch (error) {
        reject(error);
      }
    });
  });
};

PhilipsTV.prototype.setAmbilightMode = function(mode) {
  const availableModes = ['internal', 'manual', 'expert'];
  if ( availableModes.indexOf(mode) === -1 ) {
    throw Error('Unsupported mode: ', mode);
  }
  return new Promise((resolve, reject) => {
    ajaxRequest({
      method: 'POST',
      url: this.getBaseUrl() + '/ambilight/mode',
      data: {
        'current': mode
      }
    }, function (error, response, body) {
      if ( error ) {
        return reject(error);
      }

      resolve();
    }).catch(console.error);
  });
};

PhilipsTV.prototype.getSysInfo = function() {
  return new Promise((resolve, reject) => {
    ajaxRequest({
      method: 'GET',
      url: this.getBaseUrl() + '/system'
    }, function (error, response, body) {
      if ( error ) {
        return reject(error);
      }

      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = PhilipsTV;
