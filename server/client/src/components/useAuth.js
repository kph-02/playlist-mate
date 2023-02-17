import {React, useState, useEffect} from 'react'
import axios from 'axios'

const LIVE_URL = 'https://www.playlistmate.app'
//const LIVE_URL = 'https://localhost:3001'


function useAuth(code) {
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()

    useEffect(() => {
        axios.post( LIVE_URL + '/login', {
            code,
        }).then(res => {
            setAccessToken(res.data.accessToken)
            setRefreshToken(res.data.refreshToken)
            setExpiresIn(res.data.expiresIn)
            window.history.pushState({}, null, "/")
        })
    }, [code])

    useEffect(() => {
        if (!refreshToken || !expiresIn) return
        const interval = setInterval(() => {
            axios.post(LIVE_URL + '/refresh', {
                refreshToken,
            }).then(res => {
                setAccessToken(res.data.accessToken)
                setExpiresIn(res.data.expiresIn)
            })
        }, (expiresIn - 60) * 1000)
        return () => clearInterval(interval)
    }, [refreshToken, expiresIn])
    return accessToken
}
export default useAuth