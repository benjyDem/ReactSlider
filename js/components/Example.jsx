import React from 'react';

import ReactSlider from './ReactSlider.jsx';
class Example extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            visibleSlides: 2,
            moveSlides: 1,
            dots: true,
            desktopDrag: true,
            auto: true
        }
    }

    render() {
        return <div>
            <ReactSlider {...this.state}>
            <figure>
                test
                <span>ok</span>
            </figure>
            <div>
                test 2
            </div>
            <div>
                <img src="images/0.jpg" alt="" />
            </div>
            <div>
                test 4
            </div>
            <div>
                <img src="images/0.jpg" alt="" />
            </div>
        </ReactSlider>
            <button onClick={() => this.changeVisible(this.state.visibleSlides+1)}>Increase Visible Slides</button>
            <button onClick={() => this.changeVisible(this.state.visibleSlides-1)}>Decrease Visible Slides</button>
        </div>
    }

    changeVisible(visible) {

        this.setState({
            visibleSlides: Math.max(1,visible)
        });

    }

}

export default Example;