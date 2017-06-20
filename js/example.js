import React from 'react';
import ReactDOM from 'react-dom';

import ReactSlider from './components/ReactSlider.jsx';

document.body.onload = () => {
    ReactDOM.render(<ReactSlider slidesToShow={2}>
        <div>
            test
        </div>
        <div>
            test 2
        </div>
        <div>
            <img src="images/0.jpg" alt="" />
        </div>
        <div>
            <img src="images/0.jpg" alt="" />
        </div>
    </ReactSlider>, document.getElementById('slider-wrapper'));
};