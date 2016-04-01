Downloads info from baseball-reference.com:  

  1. a list of teams
  2. seasons for each team
  3. game-by-game results for each team for each season

How this works:  

  1. teams-only.js gets teams, writes teams.json
  2. seasons-only.js get seasons, writes seasons.json
  3. scrape-year-by-year.js writes one file per team to team-data by getting team results one year at a time (with some built-in delay to avoid hammering baseball-reference.com, this part takes roughly an hour to run)

To run:

```
npm install
node teams-only.js
node seasons-only.js
node scrape-year-by-year.js
```
