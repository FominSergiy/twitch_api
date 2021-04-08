import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';

import { store } from './reducer.js';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

const Row = (props) => {
    const row_data = props.row_data;

    return (
        <div className={`row ${row_data.status}`}>
            <div className="stream">
                <img src={row_data.thumbnail_url} className="logo" alt='sorry' />
            </div>
            <div className="stream" id="name">
                <a href={row_data.url}>{row_data.user_name}</a>
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
        <div className={"selector"}
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
    //this below provides nav divs and a menu div wrapper
    const availableNavOptions = ['all', 'online', 'offline'];

    const navItems = availableNavOptions.map(s => {
        return (
            <Selector text={s} id={s} key={s}></Selector>
        );
    });
    // console.log(SelectorList);
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


    const displayRows = getVisibleRows(activeStreams, filter);

    // run on first render only
    React.useEffect(() => {
        const promise = getToken()
            .then((token) => getTopActiveStreams(token));

        promise
            .then(data => {
                const filteredData = data.map(r => processRow(r));
                // console.log(filteredData);
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
        // console.dir(data)
    }

    const activeRows = displayRows.map(row => {
        return <Row row_data={row} key={row.user_name}></Row>
    })

    return (
        <div className="container">
            <button onClick={() => cl()}>Click Me</button>
            <div className="row" id="header">
                <h1>Twitch Streamers</h1>
                <Menu></Menu>
            </div>
            <div>
                {activeRows}
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
        // console.log(response['data']);
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
        // console.error(error);
    }
}

const processRow = (row) => {
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