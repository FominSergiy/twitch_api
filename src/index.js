import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { store } from './reducer.js';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

import './index.css';
import logo from './assets/twitch_icon.png';


const Row = (props) => {
    const row_data = props.row_data;

    const streamName = props.status === 'online'
        ? <a href={row_data.url}>{row_data.user_name}</a>
        : row_data.user_name;

    return (
        <div className={`row ${row_data.status}`}>
            <div className="stream">
                <img src={row_data.thumbnail_url}
                    className="logo"
                    alt='sorry' />
            </div>
            <div className="stream" id="name">
                {streamName}
            </div>
            <div className="stream" id="streaming">
                {row_data.title}
            </div>
        </div>
    )
}

const Selector = (props) => {
    const dispatch = useDispatch();

    return (
        <div className={`selector ${props.active}`.trimEnd()}
            onClick={e => {
                e.preventDefault();
                dispatch({
                    type: "SET_VISIBILITY_FILTER",
                    filter: props.text
                });
            }}>
            <div className="circle" id={props.id}></div>
            <p>{props.text}</p>
        </div>
    )
}

const Menu = () => {
    const activeSelector = useSelector(state => state.changeFilterReducer);
    //this below provides nav divs and a menu div wrapper
    const availableNavOptions = ['all', 'online', 'offline'];

    const navItems = availableNavOptions.map(s => {
        // set this css class to a current active nav item
        const active = s === activeSelector ? "active" : "";

        return (
            <Selector
                text={s}
                id={s}
                key={s}
                active={active}></Selector>
        );
    });

    return (
        <div className="menu">
            {navItems}
        </div>
    )
}

const App = () => {
    const activeStreams = useSelector(state => state.twitchDataReducer);
    const filter = useSelector(state => state.changeFilterReducer);
    const dispatch = useDispatch();

    // run on first render only
    React.useEffect(() => {
        const getDataFunctions = [getTopActiveStreams, getChallengeStreams];

        getDataFunctions.forEach(func => {
            // get all streams from two get data functions
            getToken()
                .then(token => func(token))
                .then(data => {
                    dispatch({
                        type: 'ADD STREAMS',
                        streams: data
                    });
                })
                .catch(err => console.log(err));
        })
    }, []);


    const displayRows = getVisibleRows(activeStreams, filter);
    const activeRows = displayRows.map(row => {
        return (
            <Row row_data={row}
                key={row.user_name}
                status={row.status}>
            </Row>
        )
    });

    return (
        <div className="container">
            <div className="row" id="header">
                <h1>Twitch Streamers</h1>
                <Menu></Menu>
            </div>
            <div>
                {activeRows}
            </div>
        </div>
    )
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);


//? SUPPORTING FUNCTIONS

function getVisibleRows(rows, filter) {
    switch (filter) {
        case 'all':
            return rows;
        case 'online':
            return rows.filter(r => r.status === 'online');
        case 'offline':
            return rows.filter(r => r.status === 'offline');
    }
}

async function getToken() {

    // get token from the local store if it is in there
    if (sessionStorage.getItem("token") !== null) {
        const token = sessionStorage.getItem("token");
        console.log('token returned from local storage!');

        return token;
    }

    // get a new token if local store is empty
    try {
        const response = await axios.get(
            'https://bjnf4e2ide.execute-api.ca-central-1.amazonaws.com/default/get-twitch-bearer-token'
        );

        sessionStorage.setItem("token", response['data']);
        return response['data'];

    } catch (error) {
        console.error(error);
    }
}

async function getTopActiveStreams(token) {
    try {
        const response = await axios.get(
            'https://api.twitch.tv/helix/streams/',
            {
                headers: {
                    'Authorization': `${token}`,
                    'Client-Id': '8nxrw92890jbiwzodkdlcfh70wvgqv'
                }
            }
        );

        const data = response['data']['data'].map(r => processOnlineRow(r));
        return data;

    } catch (error) {
        console.error(error);
    }
}

async function getChallengeStreams(token) {

    let channelsToSearch = [
        "ESL_SC2", "OgamingSC2",
        "cretetion", "freecodecamp",
        "storbeck", "habathcx",
        "RobotCaleb", "noobs2ninjas"
    ];

    const queryString = `user_login=${channelsToSearch.join("&user_login=")}`;

    try {
        const response = await axios.get(
            `https://api.twitch.tv/helix/streams?${queryString}`,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Client-Id': '8nxrw92890jbiwzodkdlcfh70wvgqv'
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