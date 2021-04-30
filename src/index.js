import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { store } from './reducer.js';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

import './index.css';
import * as Utils from './utils.js';


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
        const getDataFunctions = [
            Utils.getTopActiveStreams,
            Utils.getChallengeStreams
        ];

        getDataFunctions.forEach(func => {
            // get all streams from two get data functions
            Utils.getToken()
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


    const displayRows = Utils.getVisibleRows(activeStreams, filter);
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
