import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';

import { store } from './reducer.js';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

const Row = () => {

}

const Selector = (props) => {
    return (
        <div className={"selector"}>
            <div className="circle" id={props.id}></div>
            <p>{props.text}</p>
        </div>
    )
}

const Menu = () => {
    //this below provides nav divs and a menu div wrapper
    const availableSelectors = ['all', 'online', 'offline'];
    const SelectorList = availableSelectors.map(s => {
        return (
            <Selector text={s} id={s} key={s}></Selector>
        );
    });
    console.log(SelectorList);

    return (
        <div className="menu">
            {SelectorList}
        </div>
    )
}

const App = () => {
    const dispatch = useDispatch();

    // run on first render only
    React.useEffect(() => {
        const promise = getToken()
            .then((token) => getTopActiveStreams(token));

        promise
            .then(data => {
                const filteredData = data.map(r => processRow(r));
                console.log(filteredData);
                dispatch({
                    type: 'ADD ACTIVE STREAMS',
                    streams: filteredData
                });
            })
            .catch(err => console.log(err))

    }, []);


    const cl = () => {
        //! CONTINUE HERE - NEED TO WORK WITH THIS PROMISE
        // getToken().then((res) => console.log(res));
        const data = getToken()
            .then((res) => getTopActiveStreams(res));
        console.dir(data)
    }

    return (
        <div className="container">
            <button onClick={() => cl()}>Click Me</button>
            <div className="row" id="header">
                <h1>Twitch Streamers</h1>
                <Menu></Menu>
            </div>
        </div >
    )
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);


//? SUPPORTING FUNCTIONS

async function getToken() {

    if (localStorage.getItem("token") !== null) {
        const token = localStorage.getItem("token");
        console.log('token returned from local storage!');
        return token;
    }

    try {
        const response = await axios.get(
            'https://bjnf4e2ide.execute-api.ca-central-1.amazonaws.com/default/get-twitch-bearer-token'
        );
        localStorage.setItem("token", response['data']);
        console.log(response['data']);
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
        // console.log(response);
        return response['data']['data']
    } catch (error) {
        console.error(error);
    }
}

const processRow = (row) => {
    // process each row returned by the twitch streams api

    // thumb url width ahd height
    const width = 50;
    const height = 50;


    const thumb_url = row.thumbnail_url.substr(1, row.thumbnail_url.search("{") - 1);

    return {
        online: true,
        game_id: row.game_id,
        thumbnail_url: thumb_url + `${width}x${height}.jpg`,
        title: row.title,
        url: `https://www.twitch.tv/${row.user_login}`
    };
}