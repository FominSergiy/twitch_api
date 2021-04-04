import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
    return (
        <div className="container">
            <div className="row" id="header">
                <h1>Twitch Streamers</h1>
                <Menu></Menu>
            </div>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);