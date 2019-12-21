const api = require('./api');
const mqtt = require('./mqtt');
const fs = require('fs');
const PlejdService = require('./ble');

async function main() {
  //const rawData = fs.readFileSync('/data/plejd.json');
  const rawData = fs.readFileSync('plejd.json');
  const config = JSON.parse(rawData);

  const plejdApi = new api.PlejdApi(config.site, config.username, config.password);
  const client = new mqtt.MqttClient(config.mqttBroker, config.mqttUsername, config.mqttPassword);

  plejdApi.once('loggedIn', () => {
    plejdApi.getCryptoKey((cryptoKey) => {
      const devices = plejdApi.getDevices();

      client.on('connected', () => {
        console.log('plejd-mqtt: connected to mqtt.');
        client.discover(devices);
      });

      client.init();

      // init the BLE interface
      const plejd = new PlejdService(cryptoKey, true);
      plejd.on('authenticated', () => {
        console.log('plejd: connected via bluetooth.');
      });

      // subscribe to changes from Plejd
      plejd.on('stateChanged', (deviceId, command) => {
        client.updateState(deviceId, command);
      });

      // subscribe to changes from HA
      client.on('stateChanged', (deviceId, command) => {
        if (command.state === 'ON') {
          plejd.turnOn(deviceId, command);
        }
        else {
          plejd.turnOff(deviceId, command);
        }
      });
    });
  });

  plejdApi.login();
}

main();