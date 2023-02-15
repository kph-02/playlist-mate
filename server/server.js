const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const bodyParser = require('body-parser');
const { response, query } = require('express');
const { Heap } = require('heap-js');
const e = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.json());


//Biggest determiner of time to load along with wifi speed
const MAX_SEARCH_PAGE_LIMIT = 2;

const port = process.env.PORT || 3001;

const LIVE_URL = 'https://www.playlistmate.app';
//const LIVE_URL = 'http://localhost:3000'

const server = http.createServer(app)

const io = new Server(server, {
  
  cors: {
    origin: LIVE_URL,
    methods: ["GET", "POST"],
  },
});


//Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
} 

//WebSocket
io.on("connection", (socket) => {
  console.log(`User Connected:  ${socket.id}`);
  socket.on("generate_playlist_request", async (data) => {
    //req.query -> data.values
    //console.log(data.values)
    let returnValue = await generatePlaylist(data.values)
    socket.emit("generate_playlist_return", returnValue)
  });
});



async function generateMinedBank(accessToken, keywords, isInstrumental) {
  var queryParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }

  //In order of decreasing frequency count
  let minedBank = []
  const songMap = new Map();
  let allSongsSeen = false;
  let APIlimitReached = false;
  let nonInstrumentalTracks = new Set();

  for (let i = 0; i < MAX_SEARCH_PAGE_LIMIT; i++) {
    console.log("Searching playlists at " + (i * 50) + "to" +  ((i + 1)*50))
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
                    if (data2.tracks.items[k].track != null) {
                      if (k == 0) {
                        playlistTrackIDs = data2.tracks.items[k].track.id
                      } else {
                        playlistTrackIDs += ","
                        playlistTrackIDs += data2.tracks.items[k].track.id
                      }
                    }
                  }
                  if (playlistTrackIDs != "") {
                    var instrumentalTrack = await fetch('https://api.spotify.com/v1/audio-features?ids=' + playlistTrackIDs, queryParameters)
                      .then(response3 => response3.json())
                      .then(data3 => {   
                        for (let l = 0; l < data3.audio_features.length; l++) {
                          if ((data3.audio_features[l] != null) && (data3.audio_features[l].instrumentalness < 0.5)) {
                            nonInstrumentalTracks.add(data3.audio_features[l].id)
                            //console.log("Non Instrumental Found")
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
                      //console.log("Incrementing song count")
                    } else {
                      if (isInstrumental == 'true') {     
                        if (!nonInstrumentalTracks.has(currTrack.id)) {
                          songMap.set(currTrack.id, {count: 1, duration: currTrack.duration_ms/1000})
                          //console.log("Adding new instrumental song to songMap")
                        }
                      } else {
                        songMap.set(currTrack.id, {count: 1, duration: currTrack.duration_ms/1000})
                        //console.log("Adding new song to songMap")
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
    if (key != null) {
      maxHeap.push(key)
      //console.log("Adding" + key + "with value count " + value.count + " and duration " + value.duration + " to maxHeap")
    }
  })
  
  for (let i = 0; i < 200; i++) {
    if (maxHeap.peek() != null) {
      let currTrackID = maxHeap.pop()
      let currTrack = {
        "id" : currTrackID, 
        "duration" : songMap.get(currTrackID).duration
      }
      //console.log("Adding this track to mined bank: ")
      //console.log(currTrack)
      minedBank.push(currTrack)
    }
  }

  /* View mined bank 
  console.log("Mined bank length: " + minedBank.length)
  for (let i = 0; i < minedBank.length; i++) {
    console.log("Song ID: " + minedBank[i].id + " Count:  " + songMap.get(minedBank[i].id).count)  
  }
  */
  
  console.log("Finished generating the mined bank")
  return minedBank
  
}

async function generateCoreItemBank(accessToken, coreItem, isInstrumental) {
  var queryParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }

  let coreItemBank = [];
  let coreItemID = "";
  if (coreItem.substring(8, 13) == "track") {
    coreItemID = coreItem.substring(14, coreItem.length);
    let coreItemTrackDuration = 0;

    //Max Set part
    var returnTrack= await fetch('https://api.spotify.com/v1/tracks/' + coreItemID, queryParameters) 
      .then(response => response.json())
      .then(data => {   
        coreItemTrackDuration = data.duration_ms/1000
      })
    let coreItemTrack = {
      "id" : coreItemID, 
      "duration" : coreItemTrackDuration
    }
    coreItemBank.push(coreItemTrack)
    if (isInstrumental == 'true') {
      var returnInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=10&market=US&seed_tracks=' + coreItemID  + '&min_instrumentalness=0.5', queryParameters) 
      .then(response => response.json())
      .then(data => {   
        for (let i = 0; i < data.tracks.length; i++) {
          let currTrack = {
            "id" : data.tracks[i].id, 
            "duration" : data.tracks[i].duration_ms/1000
          }
          coreItemBank.push(currTrack)
        }
      })
    } else {
      var returnNonInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=10&market=US&seed_tracks=' + coreItemID  + '&max_instrumentalness=0.5', queryParameters) 
      .then(response => response.json())
      .then(data => {   
        for (let i = 0; i < data.tracks.length; i++) {
          let currTrack = {
            "id" : data.tracks[i].id, 
            "duration" : data.tracks[i].duration_ms/1000
          }
          coreItemBank.push(currTrack)
        }
      })
    }
  } else if (coreItem.substring(8, 14) == "artist") {
    coreItemID = coreItem.substring(15, coreItem.length);
    var returnArtistTracks= await fetch('https://api.spotify.com/v1/artists/' + coreItemID + "/top-tracks/?market=US", queryParameters) 
    .then(response => response.json())
    .then(async data => {   
      for (let i = 0; i < 5; i++) {
        if (data.tracks.length < 5) {
          if (i == data.tracks.length) {
            break;
          }
        }
        let currTrack = {
          "id" : data.tracks[i].id, 
          "duration" : data.tracks[i].duration_ms/1000
        }
        coreItemBank.push(currTrack)
      }
      //Max Set part
      if (isInstrumental == 'true') {
        var returnInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_artists=' + coreItemID  + '&min_instrumentalness=0.5', queryParameters) 
        .then(response => response.json())
        .then(data => {   
          for (let i = 0; i < data.tracks.length; i++) {
            let currTrack = {
              "id" : data.tracks[i].id, 
              "duration" : data.tracks[i].duration_ms/1000
            }
            coreItemBank.push(currTrack)
          }
        })
      } else {
        var returnNonInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_artists=' + coreItemID  + '&max_instrumentalness=0.5', queryParameters) 
        .then(response => response.json())
        .then(data => {   
          for (let i = 0; i < data.tracks.length; i++) {
            let currTrack = {
              "id" : data.tracks[i].id, 
              "duration" : data.tracks[i].duration_ms/1000
            }
            coreItemBank.push(currTrack)
          }
        })
      }
    })

  } else if (coreItem.substring(8, 13) == "album") {
    coreItemID = coreItem.substring(14, coreItem.length);
    let albumSeedString = ""; 
    var returnAlbumTracks= await fetch('https://api.spotify.com/v1/albums/' + coreItemID + "/tracks/?market=US", queryParameters) 
    .then(response => response.json())
    .then(data => {   
      for (let i = 0; i < data.items.length; i++) {
        let currTrack = {
            "id" : data.items[i].id, 
            "duration" : data.items[i].duration_ms/1000
        }
        if (i == 0) {
          albumSeedString += data.items[i].id
        } else if (i < 5) {
          albumSeedString += ","
          albumSeedString += data.items[i].id
        }
        coreItemBank.push(currTrack)
      }
    })
    //console.log(albumSeedString)
    //Max Set part
    
    if (isInstrumental == 'true') {
      var returnInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_tracks=' + albumSeedString  + '&min_instrumentalness=0.5', queryParameters) 
      .then(response => response.json())
      .then(data => {   
        for (let i = 0; i < data.tracks.length; i++) {
          let currTrack = {
            "id" : data.tracks[i].id, 
            "duration" : data.tracks[i].duration_ms/1000
          }
          coreItemBank.push(currTrack)
        }
      })
    } else {
      var returnNonInstrumentalTracks= await fetch('https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_tracks=' + albumSeedString  + '&max_instrumentalness=0.5', queryParameters) 
      .then(response => response.json())
      .then(data => {   
        for (let i = 0; i < data.tracks.length; i++) {
          let currTrack = {
            "id" : data.tracks[i].id, 
            "duration" : data.tracks[i].duration_ms/1000
          }
          coreItemBank.push(currTrack)
        }
      })
    }
    
  }
  if (coreItemBank != []) {
    /* View coreItemBank
    for (let i = 0; i < coreItemBank.length; i++) {
      console.log(coreItemBank[i])
    }
    */
    console.log("Finished generating a core item bank")
    return coreItemBank
  } else {
    console.error("Empty Core Item bank")
    return null
  }
}

async function generateMinimumCoreItemSet(accessToken, coreItem, coreItemBank) {

  var queryParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }

  minimumCoreItemSet = [];
  if (coreItem.substring(8, 13) == "track") {
    minimumCoreItemSet.push(coreItemBank[0])
  } else if (coreItem.substring(8, 14) == "artist"){
    for (let i = 0; i < 5; i++) {
      minimumCoreItemSet.push(coreItemBank[i])
    }
  } else if (coreItem.substring(8, 13) == "album"){
    let albumLength = 0;
    coreItemID = coreItem.substring(14, coreItem.length);
    var returnAlbum= await fetch('https://api.spotify.com/v1/albums/' + coreItemID, queryParameters) 
    .then(response => response.json())
    .then(data => {   
      albumLength = data.total_tracks
    })
    if (albumLength != 0) {
      for (let i = 0; i < albumLength; i++) {
        minimumCoreItemSet.push(coreItemBank[i])
      }
    }
  }
  if (minimumCoreItemSet != []) {
    return minimumCoreItemSet
  } else {
    return null
  }
}

async function generatePlaylist(values) {

  console.log("Generating Playlist")
  //Each item in generated sets look like { id : *ID*, duration : *duration_in_s* }
  let coreItemOneBank = await generateCoreItemBank(values.accessToken, values.coreItemOne, values.isInstrumental);
  let coreItemTwoBank = [];
  let coreItemThreeBank = [];
  let numCoreItems = 1;

  if (values.coreItemTwo != '') {
    numCoreItems = 2;
    coreItemTwoBank = await generateCoreItemBank(values.accessToken, values.coreItemTwo, values.isInstrumental);
    if (values.coreItemThree != '') {
      numCoreItems = 3;
      coreItemThreeBank = await generateCoreItemBank(values.accessToken, values.coreItemThree, values.isInstrumental);
    }
  }
  let minedBank = await generateMinedBank(values.accessToken, values.keywords, values.isInstrumental);
  console.log("Finished Generating all banks")

  /* View all bank items

  for(let i = 0; i < minedBank.length; i++) {
    console.log("Mined bank item " + i)
    console.log(minedBank[i])
  }
  for(let i = 0; i < coreItemOneBank.length; i++) {
    console.log("Core Item One bank item " + i)
    console.log(coreItemOneBank[i])
  }
  for(let i = 0; i < coreItemTwoBank.length; i++) {
    console.log("Core Item Two bank item " + i)
    console.log(coreItemTwoBank[i])
  }
  for(let i = 0; i < coreItemThreeBank.length; i++) {
    console.log("Core Item Three bank item " + i)
    console.log(coreItemThreeBank[i])
  }
  */

  //Final assembly
  let finalPlaylist = [];

  let currLength = 0;
  //Create minimum playlist
  let coreItemOneSet = [];
  let minedSetOne = [];
  
  console.log("Assembling final playlist")
  let minedBankIndex = 0
  if (numCoreItems == 1) {
    coreItemOneSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemOne, coreItemOneBank)
    let coreItemOneMinSetLength = coreItemOneSet.length
    for (let i = 0; i < coreItemOneSet.length; i++) {
      //console.log(coreItemOneSet[i])
      currLength += coreItemOneSet[i].duration
    }
    let count = 0
    let coreItemOneBankIndex = coreItemOneMinSetLength
    while (currLength <= values.desiredLength) {
      if (count == 0) {
        if (minedBankIndex < minedBank.length && minedBank[minedBankIndex] != undefined) {
          minedSetOne.push(minedBank[minedBankIndex])
          currLength += minedBank[minedBankIndex].duration
        } else {
          break
        }               
        count++
        minedBankIndex++
      } else if (count == 1) {
        if (coreItemOneBankIndex < coreItemOneBank.length && coreItemOneBank[coreItemOneBankIndex] != undefined) {
          coreItemOneSet.push(coreItemOneBank[coreItemOneBankIndex])
          currLength += coreItemOneBank[coreItemOneBankIndex].duration
        }
        count = 0
        coreItemOneBankIndex++
      }
    }
    finalPlaylist = [...coreItemOneSet, ...minedSetOne]
  } else if (numCoreItems == 2) {
    let coreItemTwoSet = [];
    coreItemOneSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemOne, coreItemOneBank)
    let coreItemOneMinSetLength = coreItemOneSet.length
    coreItemTwoSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemTwo, coreItemTwoBank)
    let coreItemTwoMinSetLength = coreItemOneSet.length
    for (let i = 0; i < coreItemOneSet.length; i++) {
      currLength += coreItemOneSet[i].duration
    }
    for (let i = 0; i < coreItemTwoSet.length; i++) {
      currLength += coreItemTwoSet[i].duration
    }
    let count = 0
    let coreItemOneBankIndex = coreItemOneMinSetLength
    let coreItemTwoBankIndex = coreItemTwoMinSetLength
    while (currLength <= values.desiredLength) {
      if (count == 0) {
        if (minedBankIndex < minedBank.length && minedBank[minedBankIndex] != undefined) {
          minedSetOne.push(minedBank[minedBankIndex])
          currLength += minedBank[minedBankIndex].duration
        } else {
          break
        }           
        count++
        minedBankIndex++
      } else if (count == 1) {
        if (coreItemOneBankIndex < coreItemOneBank.length && coreItemOneBank[coreItemOneBankIndex] != undefined) {
          coreItemOneSet.push(coreItemOneBank[coreItemOneBankIndex])
          currLength += coreItemOneBank[coreItemOneBankIndex].duration
        }
        count++
        coreItemOneBankIndex++
      } else if (count == 2) {
        if (coreItemTwoBankIndex < coreItemTwoBank.length  && coreItemTwoBank[coreItemTwoBankIndex] != undefined) {
          coreItemTwoSet.push(coreItemTwoBank[coreItemTwoBankIndex])
          currLength += coreItemTwoBank[coreItemTwoBankIndex].duration
        }
        count = 0
        coreItemTwoBankIndex++
      }
    }
    finalPlaylist = [...coreItemOneSet, ...minedSetOne, ...coreItemTwoSet]
  } else if (numCoreItems == 3) {
    let coreItemTwoSet = [];
    let coreItemThreeSet = [];
    let minedSetTwo = [];
    coreItemOneSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemOne, coreItemOneBank)
    let coreItemOneMinSetLength = coreItemOneSet.length
    coreItemTwoSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemTwo, coreItemTwoBank)
    let coreItemTwoMinSetLength = coreItemOneSet.length
    coreItemThreeSet = await generateMinimumCoreItemSet(values.accessToken, values.coreItemThree, coreItemThreeBank)
    let coreItemThreeMinSetLength = coreItemOneSet.length
    for (let i = 0; i < coreItemOneSet.length; i++) {
      currLength += coreItemOneSet[i].duration
    }
    for (let i = 0; i < coreItemTwoSet.length; i++) {
      currLength += coreItemTwoSet[i].duration
    }
    for (let i = 0; i < coreItemThreeSet.length; i++) {
      currLength += coreItemThreeSet[i].duration
    }
    let count = 0
    let coreItemOneBankIndex = coreItemOneMinSetLength
    let coreItemTwoBankIndex = coreItemOneMinSetLength
    let coreItemThreeBankIndex = coreItemOneMinSetLength
    while (currLength <= values.desiredLength) {
      if (count == 0) {
        if (minedBankIndex < minedBank.length && minedBank[minedBankIndex] != undefined) {
          minedSetOne.push(minedBank[minedBankIndex])
          currLength += minedBank[minedBankIndex].duration
        } else {
          break
        } 
        count++
        minedBankIndex++
      } else if (count == 1) {
        if (coreItemOneBankIndex < coreItemOneBank.length  && coreItemOneBank[coreItemOneBankIndex] != undefined) {
          coreItemOneSet.push(coreItemOneBank[coreItemOneBankIndex])
          currLength += coreItemOneBank[coreItemOneBankIndex].duration
        }
        count++
        coreItemOneBankIndex++
      } else if (count == 2) {
        if (coreItemTwoBankIndex < coreItemTwoBank.length  && coreItemTwoBank[coreItemTwoBankIndex] != undefined) {
          coreItemTwoSet.push(coreItemTwoBank[coreItemTwoBankIndex])
          currLength += coreItemTwoBank[coreItemTwoBankIndex].duration
        }
        count++
        coreItemTwoBankIndex++
      } else if (count == 3) {
        if (minedBankIndex < minedBank.length  && minedBank[minedBankIndex] != undefined) {
          minedSetTwo.push(minedBank[minedBankIndex])
          currLength += minedBank[minedBankIndex].duration
        } else {
          break
        } 
        count++
        minedBankIndex++
      } else if (count == 4) {
        if (coreItemThreeBankIndex < coreItemThreeBank.length  && coreItemThreeBank[coreItemThreeBankIndex] != undefined) {
          coreItemThreeSet.push(coreItemThreeBank[coreItemThreeBankIndex])
          currLength += coreItemThreeBank[coreItemThreeBankIndex].duration
        }
        count = 0
        coreItemThreeBankIndex++
      }
    }
    finalPlaylist = [...coreItemOneSet, ...minedSetOne, ...coreItemTwoSet, ...minedSetTwo, ...coreItemThreeSet]
    
    //Clean up by removing duplicates and replaces with next in mined set. (Removing null items requires more API calls)
    let playlistSet = new Set();
    for (let i = 0; i < finalPlaylist.length; i++) {
      if (playlistSet.has(finalPlaylist[i].id)) {
        if (minedBankIndex < minedBank.length  && minedBank[minedBankIndex] != undefined && currLength <= values.desiredLength) {
          finalPlaylist.splice(i, 1, minedBank[minedBankIndex])
          minedBankIndex++
        }
      //Null song check
      } else if (await isSongTakenDown(values.accessToken, finalPlaylist[i].id) == true) {
        if (minedBankIndex < minedBank.length  && minedBank[minedBankIndex] != undefined && currLength <= values.desiredLength) {
          finalPlaylist.splice(i, 1, minedBank[minedBankIndex])
          minedBankIndex++
        }
      } else {
        playlistSet.add(finalPlaylist[i].id)
      }
    }
  }

  /* View final playlist 
  if (finalPlaylist != []) {
    for (let i = 0; i < finalPlaylist.length; i++) {
      console.log("Final Playlist item " + i)
      console.log(finalPlaylist[i])
    }
  }
  */
  console.log("Final Playlist duration in seconds: " + currLength)
  return {finalPlaylist : finalPlaylist}
  res.status(200).send({finalPlaylist: finalPlaylist})
}

async function isSongTakenDown(accessToken, trackID) {
  var getQueryParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }
  var returnedTrack = await fetch('https://api.spotify.com/v1/tracks/' + trackID + '/?market=US' , getQueryParameters)
  .then(response => response.json())
  .then(data => {
      return data.is_playable
});
}


app.post("/login", (req, res) => {
    console.log("Login Request received")
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: LIVE_URL + '/',
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
    redirectUri: LIVE_URL + '/',
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

server.listen(port, () => {console.log("Server started on port 3001")})

