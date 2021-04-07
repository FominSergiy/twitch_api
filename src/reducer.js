import { createStore, combineReducers } from 'redux';

const TwitchDataReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD ACTIVE STREAMS':
            return [...state, ...action.streams];
        default:
            return state;
    }
}


const store = createStore(TwitchDataReducer);
export { store };