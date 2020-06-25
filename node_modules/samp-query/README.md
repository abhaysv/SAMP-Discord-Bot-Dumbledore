# node-samp-query

Simplified Query API for SAMP

```
npm install samp-query
```

#### Usage

**Available options**

* host
* port - default: 7777
* timeout - default: 1000

```
var query = require('samp-query')

var options = {
	host: '94.23.166.205'
}

query(options, function (error, response) {
	if(error)
		console.log(error)
	else 
		console.log(response)
})
```

#### Sample output
```
{ 
	address: '94.23.166.205',
	hostname: '• German Extreme Freeroam • Stunt/Derby/Race/DM/Free',
	gamemode: 'Stunt Race Derby DM Fun',
	mapname: 'San Andreas',
	passworded: false,
	maxplayers: 500,
	online: 12,
	rules: { 
		lagcomp: true,
		mapname: 'San Andreas',
		version: '0.3z',
		weather: 18,
		weburl: 'www.gef.io',
		worldtime: '12:00'
	},
	players: [
		{ id: 0, name: 'hallihallomine', score: 14735, ping: 51 },
		{ id: 1, name: 'xGreenDayx', score: 26193, ping: 81 },
		{ id: 2, name: '[Black]Rider', score: 87211, ping: 41 },
		{ id: 3, name: 'Kohl', score: 439313, ping: 45 },
		{ id: 5, name: 'TheSituation', score: 14775, ping: 41 },
		{ id: 6, name: 'EziT', score: 38914, ping: 66 },
		{ id: 7, name: 'Josiee', score: 2104, ping: 56 },
		{ id: 8, name: 'Derbystar', score: 29, ping: 56 },
		{ id: 9, name: 'xXProPlayXx', score: 20354, ping: 45 },
		{ id: 10, name: 'hakco30', score: 0, ping: 81 },
		{ id: 11, name: 'xXDarkBolleXx', score: 38886, ping: 56 },
		{ id: 12, name: 'SDMPro', score: 0, ping: 51 }
	]
}
```


