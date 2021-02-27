const fs = require('fs');

class Configuration {
  static _options = null;
  static _addonInfo = null;

  static getOptions() {
    if (!Configuration._options) {
      Configuration._hydrateCache();
    }
    return Configuration._options;
  }

  static getAddonInfo() {
    if (!Configuration._addonInfo) {
      Configuration._hydrateCache();
    }
    return Configuration._addonInfo;
  }

  static _hydrateCache() {
    const rawData = fs.readFileSync('/data/options.json');
    const config = JSON.parse(rawData);

    const defaultRawData = fs.readFileSync('/plejd/config.json');
    const defaultConfig = JSON.parse(defaultRawData);

    Configuration._options = { ...defaultConfig.options, ...config };
    Configuration._addonInfo = {
      name: defaultConfig.name,
      version: defaultConfig.version,
      slug: defaultConfig.slug,
      description: defaultConfig.description,
      url: defaultConfig.url,
      arch: defaultConfig.arch,
      startup: defaultConfig.startup,
      boot: defaultConfig.boot,
      host_network: defaultConfig.host_network,
      host_dbus: defaultConfig.host_dbus,
      apparmor: defaultConfig.apparmor,
    };

    // eslint-disable-next-line no-console
    console.log('Config:', {
      ...Configuration._options,
      username: '---scrubbed---',
      password: '---scrubbed---',
      mqttPassword: '---scrubbed---',
    });
  }
}

module.exports = Configuration;
