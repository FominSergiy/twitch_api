import { createStore, combineReducers } from 'redux';

const changeFilterReducer = (state = "all", action) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
}

const twitchDataReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD ACTIVE STREAMS':
            return [...state, ...action.streams];
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    twitchDataReducer: twitchDataReducer,
    changeFilterReducer: changeFilterReducer
});

const store = createStore(rootReducer);
export { store };