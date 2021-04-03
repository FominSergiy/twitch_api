import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


const App = () => {
    return (
        <div class="container">
            <div class="row" id="header">
                <h1>Twitch Streamers</h1>
                <div class="menu">
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);