import { createStore, combineReducers } from 'redux';

const TwitchDataReducer = (state = [{}], action) => {
    switch (action.type) {
        case 'ADD ACTIVE STREAM':
            console.log('hi there');
        default:
            return state;
    }
}


const store = createStore(TwitchDataReducer);
export { store };