import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk"; // Named import (correct)
import rootReducer from "./reducers";

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
