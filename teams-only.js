'use strict';
const fs = require('fs');
const Xray = require('x-ray');
const xray = new Xray();

const what = 'https://www.baseball-reference.com/teams/';
const out = 'teams.json';

xray(what, 'table#teams_active tbody tr:not(.partial_table)', [{
  name: 'td[data-stat=franchise_name] a',
  url: 'td[data-stat=franchise_name] a@href'
}])((err, obj) => {
  obj.forEach((o) => {
    o.three = o.url.split('teams')[1].replace(/\//g, '');
  });
  if ( err ) { console.log('xray error:  ' + err); return; }

  fs.writeFile(out, JSON.stringify(obj, null, 2), (err) => {
    if ( err ) { console.log('write failed', err); }
  });
});
