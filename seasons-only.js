'use strict';
const scrapers = require('./scrapers');

const out = 'teams.json'
const seasons = 'seasons.json'

scrapers.getTeamUrls(out, (err, result) => {
  if ( err ) { console.log('getTeamUrls err', err) }
  console.log('got teams:  ', result)
  
  scrapers.getTeamSeasons(out, seasons, (err, result) => {
    if ( err ) { console.log('getTeamSeasons err', err) }
    console.log('got seasons:  ', seasons);
  })
})
