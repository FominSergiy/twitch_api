import axios from 'axios';
import logo from './assets/twitch_icon.png';
import * as Constants from './constants.js';


export async function getToken() {

    // get token from the local store if it is in there
    if (sessionStorage.getItem("token") !== null) {
        const token = sessionStorage.getItem("token");
        console.log('token returned from local storage!');

        return token;
    }

    // get a new token if local store is empty
    try {
        const response = await axios.get(Constants.TOKEN_END_POINT);

        sessionStorage.setItem("token", response['data']);
        return response['data'];

    } catch (error) {
        console.error(error);
    }
}

export async function getTopActiveStreams(token) {
    try {
        const response = await axios.get(
            `${Constants.TWITCH_STREAMS_ENDPOINT}/`,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Client-Id': Constants.CLIENT_ID
                }
            }
        );

        const data = response['data']['data'].map(r => processOnlineRow(r));
        return data;

    } catch (error) {
        console.error(error);
    }
}

export async function getChallengeStreams(token) {

    let channelsToSearch = [
        "ESL_SC2", "OgamingSC2",
        "cretetion", "freecodecamp",
        "storbeck", "habathcx",
        "RobotCaleb", "noobs2ninjas"
    ];

    const queryString = `user_login=${channelsToSearch.join("&user_login=")}`;

    try {
        const response = await axios.get(
            `${Constants.TWITCH_STREAMS_ENDPOINT}?${queryString}`,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Client-Id': Constants.CLIENT_ID
                }
            }
        );

        // if a channel is offline, the data array will not have corresponding
        // channel results
        const onlineStreams = response['data']['data'].map(row => {
            if (channelsToSearch.includes(row.user_name)) {

                // remove active streams from list of channels we searched
                channelsToSearch = channelsToSearch.filter(elem => {
                    return elem !== row.user_name
                });

                return processOnlineRow(row);
            }
        });

        // add offline channels
        const offlineStreams = channelsToSearch.map(
            channelName => processOfflineRow(channelName)
        );

        return [...onlineStreams, ...offlineStreams];

    } catch (error) {
        console.error(error);
    }
}

const processOnlineRow = (row) => {
    // process each row returned by the twitch streams api
    // thumb url width ahd height
    const width = 50;
    const height = 50;

    const thumb_url = row.thumbnail_url.substr(0, row.thumbnail_url.search("{") - 1);

    return {
        status: 'online',
        game_id: row.game_id,
        thumbnail_url: thumb_url + `-${width}x${height}.jpg`,
        title: row.title,
        url: `https://www.twitch.tv/${row.user_login}`,
        user_name: row.user_login
    };
}

const processOfflineRow = (channelName) => {
    return {
        status: 'offline',
        thumbnail_url: logo,
        title: 'Offline',
        user_name: channelName.toLowerCase()
    };
}

export function getVisibleRows(rows, filter) {
    switch (filter) {
        case 'all':
            return rows;
        case 'online':
            return rows.filter(r => r.status === 'online');
        case 'offline':
            return rows.filter(r => r.status === 'offline');
    }
}
