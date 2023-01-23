const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

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

app.listen(3001)