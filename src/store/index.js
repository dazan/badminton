import { combineReducers } from 'redux';
// token
import token from './reducers/token';

// 汇合所有reducers
export default combineReducers({
    token
});