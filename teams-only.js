'use strict';
const fs = require('fs');
const Xray = require('x-ray');
const xray = new Xray();

const what = 'http://www.baseball-reference.com/teams/'; 
const out = 'teams.json';

xray(what, 'table#active tr', [{
  name: 'td.franchise_names a',
  url: 'td.franchise_names a@href'
}])((err, obj) => {
  obj.forEach((o) => {
    o.three = o.url.split('teams')[1].replace(/\//g, '');
  });
  if ( err ) { console.log('xray error:  ' + err); return; }

  fs.writeFile(out, JSON.stringify(obj, null, 2), (err) => {
    if ( err ) { console.log('write failed', err); }
  });
});
