'use strict'
const fs = require('fs')
const Xray = require('x-ray')
const xray = new Xray()

const start = 'http://www.baseball-reference.com/teams/'

const getTeamUrls = (out, callback) => {
  fs.readFile(out, (err, result) => {
    if ( err ) { 
      console.log('no file, using xray...')
      xray(start, 'table#active tr', [{
        name: 'td.franchise_names a',
        url: 'td.franchise_names a@href'
      }])((err, obj) => {
        if ( err ) { return callback(err) }

        fs.writeFile(out, JSON.stringify(obj, null, 2), (err) => {
          if ( err ) { return callback(err) }
        
          return callback(null, out)
        })
      })
    }
    return callback(null, out);
  })
}

const getTeamSeasons = (teams, seasons, callback) => {
  fs.readFile(teams, (err, result) => {
    result = JSON.parse(result)
    const seasonInfo = {}
    result.forEach((team) => {
      let abbreviation = team.url.split('teams/')[1].replace('/', '')
      seasonInfo[abbreviation] = { all: team.url }
    });
    const teams = Object.keys(seasonInfo)
    // Go get team season info one at a time.
    let counter = 0
    
    const xraySeasons = (franchise) => {
      console.log('getting seasons...', franchise.all)
      xray(franchise.all, 'table#franchise_years tbody tr', [{
        year: 'td:nth-child(2)',
        seasonUrl: 'td:nth-child(2) a@href',
        name: 'td:nth-child(3)',
        league: 'td:nth-child(4)',
        games: 'td:nth-child(5)',
        wins: 'td:nth-child(6)',
        losses: 'td:nth-child(7)'
      }])((err, obj) => {
        if ( err ) { 
          console.log('err getting a season:  ', err) 
        }

        obj.forEach((r) => {
          franchise[r.year] = r
        })

        counter += 1
        if ( counter < teams.length ) {
          // Wait half a second to get next teams.
          setTimeout(() => {
            xraySeasons(seasonInfo[teams[counter]])
          }, 500)
        } else {
          fs.writeFile(seasons, JSON.stringify(seasonInfo, null, 2), (err) => {
            if ( err ) { 
              console.log('error writing season info:  ', err) 
              callback(err)
            }
            console.log('wrote season info:  ', seasons)
            callback(null, seasons)
          })
        }
      })
    }
    xraySeasons(seasonInfo[teams[counter]])
  })
}

module.exports = {
  getTeamUrls: getTeamUrls,
  getTeamSeasons: getTeamSeasons
}