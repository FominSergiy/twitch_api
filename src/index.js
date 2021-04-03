import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const Row = () => {

}

const Selector = (props) => {


    return (
        <div class={"selector"}>
            <div class="circle"></div>
            <p>{props.text}</p>
        </div>
    )
}

const App = () => {
    return (
        <div class="container">
            <div class="row" id="header">
                <h1>Twitch Streamers</h1>
                <div class="menu">
                    <Selector text="all"></Selector>
                    <Selector text="online"></Selector>
                    <Selector text='offline'></Selector>
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);