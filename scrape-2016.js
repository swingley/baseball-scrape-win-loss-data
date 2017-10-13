'use strict'
const fs = require('fs')
const Xray = require('x-ray')
const xray = new Xray()

const seasons = 'seasons.json'
const out = 'results-2016.json'
const years = ['2016'];
let current = 0
let seasonData
let teams
let teamResults = [];

const scrapeTeamResults = (team) => {
  let teamInfo = seasonData[team][years[0]]
  let results = teamInfo.seasonUrl
  let lastDot = results.lastIndexOf('.')
  let resultsUrl = results.slice(0, lastDot) + '-schedule-scores.shtml'
  console.log('getting games for:  ', team, current);
  let teamResult = {
    name: teamInfo.name,
    league: teamInfo.league,
    games: +teamInfo.games,
    wins: +teamInfo.wins,
    losses: +teamInfo.losses,
    abbreviation: team
  }
  xray(resultsUrl, 'table#team_schedule tr', [{
    game: 'td:nth-child(2)',
    home: 'td:nth-child(6)',
    result: 'td:nth-child(8)',
    record: 'td:nth-child(12)'
  }])((err, obj) => {
    if ( err ) {
      console.log('error getting games', err);
    }
    let result = []
    let tally = 0
    let winsHome = 0
    let lossesHome = 0
    let winsRoad = 0
    let lossesRoad = 0
    obj = obj.slice(0, 162); // Ignore playoffs
    obj.forEach((game) => {
      let change = (game.result.slice(0, 1).toLowerCase() === 'w') ? 1 : -1
      tally += change
      result.push(tally)
      if ( game.home ) {
        (change == 1) ? winsHome += 1 : lossesHome += 1
      } else {
        (change ==1) ? winsRoad += 1 : lossesRoad += 1
      }
    })
    teamResult.winsHome = winsHome
    teamResult.lossesHome = lossesHome
    teamResult.winsRoad = winsRoad
    teamResult.lossesRoad = lossesRoad
    teamResult.results = result
    teamResults.push(teamResult);

    current += 1
    if ( current < teams.length ) {
      setTimeout(() => {
        scrapeTeamResults(teams[current])
      }, 500)
    } else {
      fs.writeFile(out, JSON.stringify(teamResults), (err) => {
        if ( err ) {
          console.log('error writing ', out)
        }
        console.log('wrote results')
      })
    }
  })
}

fs.readFile(seasons, (err, data) => {
  seasonData = JSON.parse(data);
  teams = Object.keys(seasonData);
  scrapeTeamResults(teams[current]);
})
