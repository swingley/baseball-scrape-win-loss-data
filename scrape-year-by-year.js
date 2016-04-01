'use strict'
const fs = require('fs')
const path = require('path')
const Xray = require('x-ray')
const xray = new Xray()

const seasons = 'seasons.json'
const outFolder = path.join(__dirname, 'team-data')
fs.mkdirSync(outFolder)
let currentTeam = 0
let currentYear = 0
let seasonData
let teams
let teamResults = [];
let years

const scrapeYears = (team, info, callback) => {
  let results = info.seasonUrl
  let lastDot = results.lastIndexOf('.')
  let resultsUrl = results.slice(0, lastDot) + '-schedule-scores.shtml'
  let currentAbbreviation = results.split('/teams/')[1].split('/')[0]
  console.log('\tgetting games for:  ', currentAbbreviation, years[currentYear]);
  let teamResult = {
    name: info.name,
    league: info.league,
    games: +info.games,
    wins: +info.wins,
    losses: +info.losses,
    abbreviation: currentAbbreviation || team,
    year: years[currentYear]
  }
  xray(resultsUrl, 'table#team_schedule tr', [{
    gameNumber: 'td:nth-child(2)',
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
    // Filter out playoff games, if they're included.
    obj = obj.filter((game) => {
      return +game.gameNumber
    })
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

    currentYear += 1
    if ( currentYear < years.length ) {
      setTimeout(() => {
        let nextSeason = seasonData[team][years[currentYear]]
        scrapeYears(team, nextSeason, callback)
      }, Math.random() * 1000)
    } else {
      write(team + '.json', JSON.stringify(teamResults), (err, data) => {
        if ( err ) {
          console.log('error writing ', filename, err)
        } else {
          console.log('wrote results')
        }
        currentYear = 0
        teamResults.length = 0
        callback(null)
      })
    }
  })
}

const write = (filename, data, callback) => {
  fs.writeFile(outFolder + '/' + filename, data, callback)
}

const scrapeTeamResults = (team) => {
  console.log('Starting...', team)
  years = Object.keys(seasonData[team]).filter((y) => +y)
  let firstSeason = seasonData[team][years[currentYear]]
  scrapeYears(team, firstSeason, (err) => {
    console.log('...finished ', team)
    currentTeam += 1;
    if ( currentTeam < teams.length ) {
      scrapeTeamResults(teams[currentTeam])
    } else {
      console.log('\n\nFinished getting data for all teams.')
    }
  })
}

fs.readFile(seasons, (err, data) => {
  seasonData = JSON.parse(data);
  fs.readdir('team-data', (err, data) => {
    // Skip teams if there's already a file for that team.
    let existing = data.filter((f) => f.indexOf('.json') > -1)
    existing = existing.map((f) => f.split('.')[0])
    teams = Object.keys(seasonData);
    teams = teams.filter((t) => existing.indexOf(t) === -1)
    scrapeTeamResults(teams[currentTeam])
  })
})
