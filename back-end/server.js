const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors')
const bodyParser = require('body-parser');
const { response } = require('express');
const { Heap } = require('heap-js');
const { FreeBreakfastOutlined } = require('@material-ui/icons');

const app = express()
app.use(cors())
app.use(bodyParser.json())

//Biggest determiner of time to load along with wifi speed
const MAX_SEARCH_PAGE_LIMIT = 5;

async function generateMinedSet(accessToken, keywords, isInstrumental) {
  var queryParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }

  //In order of decreasing frequency count
  let minedSet = []
  const songMap = new Map();
  let allSongsSeen = false;
  let APIlimitReached = false;
  let nonInstrumentalTracks = new Set();

  for (let i = 0; i < MAX_SEARCH_PAGE_LIMIT; i++) {
    if (allSongsSeen) {
      break;
    }
    let searchOffset = i * 50;
    var returnedPlaylists = await fetch('https://api.spotify.com/v1/search?q=' + keywords + '&type=playlist&offset=' + searchOffset + '&limit=50', queryParameters)
    .then(response => response.json())
    .then(async data => {
          let numPlaylistsInQuery = data.playlists.items.length
          if (data.playlists.next == null) {
            allSongsSeen = true;
          }
          //console.log("numPlaylistsInQuery" + numPlaylistsInQuery)
          for (let j = 0; j < numPlaylistsInQuery; j++) {
            let currPlaylist = data.playlists.items[j]
            var returnedTracks = await fetch(currPlaylist.href, queryParameters)
            .then(response2 => response2.json())
            .then(async data2 => {
              if ("error" in data2) {
                APIlimitReached = true;
                console.log("API Limit reached")
              } else {
                let currPlaylistLength = data2.tracks.items.length
                if (isInstrumental == 'true') {
                  let playlistTrackIDs = "";
                  for (let k = 0; k < currPlaylistLength; k++) {
                    if (k == 0) {
                      playlistTrackIDs = data2.tracks.items[k].track.id
                    } else {
                      playlistTrackIDs += ","
                      playlistTrackIDs += data2.tracks.items[k].track.id
                    }
                  }
                  if (playlistTrackIDs != "") {
                    var instrumentalTrack = await fetch('https://api.spotify.com/v1/audio-features?ids=' + playlistTrackIDs, queryParameters)
                      .then(response3 => response3.json())
                      .then(data3 => {   
                        for (let l = 0; l < data3.audio_features.length; l++) {
                          if ((data3.audio_features[l] != null) && (data3.audio_features[l].instrumentalness < 0.5)) {
                            nonInstrumentalTracks.add(data3.audio_features[l].id)
                            console.log("Non Instrumental Found")
                          }
                        }
                    })
                  }
                }
                for (let k = 0; k < currPlaylistLength; k++) {
                  //console.log(data2.tracks.items[k])
                  let currTrack = data2.tracks.items[k].track
                  if (currTrack != null) {
                    if (songMap.has(currTrack.id)) {
                      songMap.get(currTrack.id).count++
                      console.log("Incrementing song count")
                    } else {
                      if (isInstrumental == 'true') {     
                        if (!nonInstrumentalTracks.has(currTrack.id)) {
                          songMap.set(currTrack.id, {count: 1})
                          console.log("Adding new instrumental song to songMap")
                        }
                      } else {
                        songMap.set(currTrack.id, {count: 1})
                        console.log("Adding new song to songMap")
                      }
                    }
                  }
                }
              }
            })      
          }
    })
  }

  const customPriorityComparator = (a, b) => songMap.get(a).count < songMap.get(b).count
  const maxHeap = new Heap(customPriorityComparator)

  songMap.forEach((value, key) => {
    maxHeap.push(key)
  })
  
  for (let i = 0; i < 300; i++) {
    if (maxHeap.peek() != null) {
      minedSet.push(maxHeap.pop())
      console.log("Added track to mined set")
    }
  }

  /* View mined set
  */
  for (let i = 0; i < minedSet.length; i++) {
    console.log("Song ID: " + minedSet[i] + " Count:  " + songMap.get(minedSet[i]).count)  
  }
  return minedSet
}

async function generateCoreItemSet(accessToken, coreItem, isInstrumental) {

}


function generatePlaylist(req, res) {

  let minedSet = generateMinedSet(req.query.accessToken, req.query.keywords, req.query.isInstrumental);
  let coreItemSetOne = generateCoreItemSet(req.query.accessToken, req.query.coreItemOne, req.query.isInstrumental);
  let coreItemSetTwo = [];
  let coreItemSetThree = [];
  let numCoreItems = 1;

  if (req.query.coreItemTwo != '') {
    numCoreItems = 2;
    coreItemSetTwo = generateCoreItemSet(req.query.accessToken, req.query.coreItemTwo, req.query.isInstrumental);
    if (req.query.coreItemThree != '') {
      numCoreItems = 3;
      coreItemSetThree = generateCoreItemSet(req.query.accessToken, req.query.coreItemThree, req.query.isInstrumental);
    }
  }

  let currLength = 0;
  while (currLength < (req.query.desiredLength * 1000)) {
    //Add songs 1 by 1 updating currLength
  }
  
  console.log(req.query)
  res.status(200).send({message: 'Data received'})
}


app.get("/generatePlaylist", generatePlaylist);


app.post("/login", (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: 'http://localhost:3000/',
        clientId: '20f6d7c7a039406b855bb7337bb6dd25',
        clientSecret: '09f60c7d81d845cd993e51298d3fee71'
    })
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        res.json({
          accessToken: data.body.access_token,
          refreshToken: data.body.refresh_token,
          expiresIn: data.body.expires_in,
        })
      })
      .catch(err => {
        res.sendStatus(400)
      })
  })

app.post ('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: 'http://localhost:3000/',
    clientId: '20f6d7c7a039406b855bb7337bb6dd25',
    clientSecret: '09f60c7d81d845cd993e51298d3fee71',
    refreshToken,
  })

  spotifyApi.refreshAccessToken().then(data => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn
      })
    }).catch(() => {
      res.sendStatus(400)
    })
})

app.listen(3001, () => {console.log("Server started on port 5000")})