/**
 * Author: Sebastian Schepis
 * Date: 2020-01-21
 * License: Private
 * Description eth event processor
 * No part of this code may be used without explicit permission
 * from the author
 */
import {readFileSync, writeFileSync} from 'fs';

// hyper-simple config manager. config file name is hardcoded
// call the method to get a config object, write and read the config
// object like any other object, then call the save method to save
export default function config(d?: any) {
  if (d) {
    try {
      writeFileSync('./.epdata', JSON.stringify(d || {}));
    } catch (e) {
      console.log('could not write config data');
    }
  }
  class Config {
    constructor() {
      try {
        Object.assign(
          this,
          JSON.parse((readFileSync('./.epdata') || {}).toString())
        );
      } catch (e) {
        console.log('could not read config data');
      }
    }
    save() {
      config(this);
    }
  }
  return new Config();
}
