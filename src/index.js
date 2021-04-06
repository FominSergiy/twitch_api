import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';

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

    async function getToken() {
        try {
            const response = await axios.get(
                'https://bjnf4e2ide.execute-api.ca-central-1.amazonaws.com/default/get-twitch-bearer-token'
            );
            console.log(response);
            return response;
        } catch (error) {
            console.error(error);
        }
    }

    async function getTopGames(token) {
        try {
            const response = await axios.get(
                'https://api.twitch.tv/helix/games/top',
                {
                    headers: {
                        'Authorization': `${token}`,
                        'Client-Id': '8nxrw92890jbiwzodkdlcfh70wvgqv'
                    }
                }
            );
            console.log(response);
            // return response;
        } catch (error) {
            console.error(error);
        }

    }

    const cl = () => {
        // getToken().then((res) => console.log(res));
        getToken()
            .then((res) => getTopGames(res['data']));

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
    <App />,
    document.getElementById('root')
);