import React from 'react';
import {BrowserRouter as Router , Route , Switch} from 'react-router-dom';
import './App.css';

import MindBowser from "./components/characters/MindBowser";

let App = () => {
    return(
        <React.Fragment>
            <Router>
                    <Switch>
                        <Route exact path="/" component={MindBowser}/>
                    </Switch>
            </Router>
        </React.Fragment>
    );
};
export default App;
