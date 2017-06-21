import React from 'react';


const SLIDE_TO_NEXT_TRESHOLD = 20;

class ReactSlider extends React.Component {

    constructor(props) {
        super(props);

        this.state = ReactSlider.stateFromProps(props);
        this.state.styles = {};

        // map keys for both axes to use same functions for vertical and horizontal sliders
        this.keys = {
            x: {
                size: 'width',
                oppositeSize: 'height',
                offsetSize: 'offsetWidth',
                offsetOpposite: 'offsetHeight',
                direction: 'left'
            },
            y: {
                size: 'height',
                oppositeSize: 'width',
                offsetSize: 'offsetHeight',
                offsetOpposite: 'offsetWidth',
                direction: 'top'
            }
        };


    }

    static stateFromProps(props) {
        let state = {
            visibleSlides: props.visibleSlides || 1,
            moveSlides: props.moveSlides || 1,
            axis: props.axis || 'x',
            transition: props.transition || 'slide',
            transitionSpeed: 500,
            arrows: typeof props.arrows !== 'undefined' ? props.arrows : true,
            infinite: props.infinite || false,
            lazyLoad: true,
            adaptiveHeight: props.adaptiveHeight || false,
            loadedImages: [],
            dots: props.dots || false,
            fullPages: props.fullPages || false,
            prevText: props.prevText || 'Previous',
            nextText: props.nextText || 'Next',
            desktopDrag: props.desktopDrag || false, // if true desktop users can drag with mouse
            auto: props.auto || false,
            autoSpeed: props.autoSpeed || 4000,

            touch: typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
        };
        state.axisClass = state.axis === 'x' ? '' : 'vertical-slider';

        if (props.children.length % state.visibleSlides === 0) {
            state.pages = Math.ceil(props.children.length / state.moveSlides) - state.moveSlides;
        }

        let slideNumber = props.children.length;
        if (state.fullPages) {
            while(slideNumber % state.visibleSlides !==0) {
                slideNumber++;
            }
        }
        state.pages = Math.ceil(slideNumber / state.moveSlides) - (state.visibleSlides - state.moveSlides);

        return state;
    }

    componentDidMount() {

        // wait for rendering to compute sizes
        requestAnimationFrame(() => {
            this.setSliderStyles();
        });

        this._onPointerUp = this.onPointerUp.bind(this);
        this._onPointerMove = this.onPointerMove.bind(this);
        this._onResize = this.onResize.bind(this);

        window.addEventListener('resize', this._onResize);

        if (!this.state.touch) {
            if (this.state.desktopDrag) {
                window.addEventListener('mouseup', this._onPointerUp);
                window.addEventListener('mousemove', this._onPointerMove);
            }
        } else  {
            window.addEventListener('touchend', this._onPointerUp);
            window.addEventListener('touchmove', this._onPointerMove);
        }
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this._onResize);

        if (!this.state.touch) {
            if (this.state.desktopDrag) {
                window.removeEventListener('mouseup', this._onPointerUp);
                window.removeEventListener('mousemove', this._onPointerMove);
            }
        } else {
            window.removeEventListener('touchend', this._onPointerUp);
            window.removeEventListener('touchmove', this._onPointerMove);
        }

    }

    componentWillReceiveProps(props) {
        this.setState(ReactSlider.stateFromProps(props), () => this.setSliderStyles());
    }

    render() {
        if (this.state.auto) this.autoTimeout();

        let children = this.getChildren();

        let listeners = this.state.touch ?  { onTouchStart: this.onPointerDown.bind(this) } : { onMouseDown: this.onPointerDown.bind(this) };

        let style = {
            transition: this.getTransitionCSS()
        };
        style[this.keys[this.state.axis].size] = this.state.styles.overallSize+'px';
        style[this.keys[this.state.axis].oppositeSize] = this.state.styles.oppositeSize+'px';
        style[this.keys[this.state.axis].direction] = this.state.styles.position+'px';

        let liStyle = {};
        liStyle[this.keys[this.state.axis].size] = this.state.styles.slideSize+'px';

        return <div ref="slider" className={"react-slider " + this.state.axisClass }>

            <ul className="react-slider-slides"
                {...listeners}
                style={ style }>

                { children.map((child, i) => {
                    return <li key={i}
                               style={liStyle}
                               className="react-slider-slide">
                        {child}
                    </li>
                })}

            </ul>

            {this.state.arrows && this.props.children.length > this.state.visibleSlides && this.renderArrows()}
            {this.state.dots && this.renderDots()}
        </div>;
    }

    renderArrows() {

        return <div className="react-slider-arrows">
            <button className="prev"
                    disabled={!this.state.infinite &&this.state.styles.position >= this.state.styles.maxPosition}
                    onClick={() => this.goToPrevSlide()}>
                {this.state.prevText}
            </button>
            <button className="next"
                    disabled={!this.state.infinite && this.state.styles.position <= this.state.styles.minPosition }
                    onClick={() => this.goToNextSlide()}>
                {this.state.nextText}
            </button>
        </div>;
    }

    renderDots() {
        let pages = [];
        for (let i = 0; i<this.state.pages; ++i) { pages.push(i); }
        return <ul className="react-slider-dots">
            {
                pages.map((page) => {
                    let position = this.getPagePosition(page);
                    return <li key={"page-dot-"+page}>
                        <button  disabled={this.state.styles.position === position }
                                 onClick={() => this.setSliderPosition(position)}>{page+1}</button>
                    </li>
                })
            }
        </ul>
    }

    goToPrevSlide() {
        this.setSliderPosition(this.state.styles.position + this.state.styles.slideSize*this.state.moveSlides );
    }

    goToNextSlide() {
        this.setSliderPosition( this.state.styles.position - this.state.styles.slideSize*this.state.moveSlides );
    }

    getPagePosition(page) {
        if (page === this.state.pages -1) return this.state.styles.minPosition;
        return -this.state.styles.slideSize * this.state.moveSlides * page;
    }

    setSliderPosition(position) {

        if (this.state.infinite) {
            if (position > this.state.styles.maxPosition) {
                position = this.state.styles.minPosition;
            } else if (position < this.state.styles.minPosition) {
                position = this.state.styles.maxPosition;
            }
        }
        position = Math.min(Math.max(position, this.state.styles.minPosition ), this.state.styles.maxPosition);
        this.setState({
            styles: Object.assign({}, this.state.styles,{position: position})
        }, () => this.loadVisibleSlideImages());
    }

    setSliderStyles() {

        let slideSize = this.refs.slider[this.keys[this.state.axis].offsetSize] / this.state.visibleSlides;
        let styles ={
            slideSize: slideSize,
            overallSize: slideSize * this.props.children.length,
            position: 0,
            maxPosition: 0
        };

        styles.minPosition = -( this.props.children.length * styles.slideSize - styles.slideSize * this.state.visibleSlides);
        if (this.state.fullPages && this.props.children % this.state.visibleSlides !== 0 ) styles.minPosition-= styles.slideSize;

        if (this.refs.slider.getElementsByClassName('react-slider-slide').length) {

            styles.oppositeSize = this.state.adaptiveHeight ?
                this.refs.slider.getElementsByClassName('react-slider-slide')[this.state.activeSlide][this.keys[this.state.axis].offsetOpposite] :
                'auto';
        }

        this.setState({
            styles: styles
        }, () => this.loadVisibleSlideImages());
    }


    getTransitionCSS() {
        if (this.dragging) return 'none';
        switch (this.state.transition) {
            case 'slide':
                return (this.state.axis === 'x' ? 'left' : 'top')+' '+this.state.transitionSpeed+'ms ease-in';
            case 'fade':
                return 'opacity '+this.state.transitionSpeed+'ms ease-in';
        }
    }

    getChildren() {
        if (!this.state.lazyLoad) return this.props.children;

        this.imagesPerSlides = [];

        return React.Children.map(
            this.props.children,
            (child, i) => {
                this.imagesPerSlides.push([]);
                return this.recursivelyFindImages(child, i)
            }
        );

    }

    recursivelyFindImages(level, slide) {
        if (level.props && level.props.children) {
            React.Children.map(level.props.children, child => {

                if (child.type === "img" && this.state.loadedImages.indexOf(child.props.src) === -1) {
                    this.imagesPerSlides[slide].push(child.props.src);
                    return React.createElement('div', {
                        className: child.className ?child.className  +' is-loading' : ' is-loading'
                    });
                } else
                    return this.recursivelyFindImages(child, slide);
            })
        }
        return level;
    }

    loadVisibleSlideImages() {

        if (!this.imagesPerSlides.length) return;

        let activeSlide = Math.abs( Math.round( this.state.styles.position / this.state.styles.slideSize ) );

        for (let i= activeSlide, iLength = activeSlide+this.state.visibleSlides; i< iLength; ++i) {

            if (!this.imagesPerSlides[i]) continue;
            this.imagesPerSlides[i].forEach((imageToLoad) => {
                let img = new Image();
                if (img.complete) this.onImageLoad(imageToLoad);
                else img.onload = this.onImageLoad.bind(this, imageToLoad);
                img.src=imageToLoad;
            });

        }

    }

    onImageLoad(src) {
        this.setState({
            loadedImages: this.state.loadedImages.concat([src])
        });
    }

    onPointerDown(e) {
        this.dragging = true;
        this.prevPosition = this.state.styles.position;
        this.coords = this.state.touch ? [e.touches[0].pageX, e.touches[0].pageY] : [e.pageX, e.pageY];
    }

    onPointerMove(e) {
        if (this.dragging) {
            let coords = this.state.touch ? [e.changedTouches[0].pageX, e.changedTouches[0].pageY] : [e.pageX, e.pageY];
            this.direction = [coords[0] > this.coords[0] ? 'left' : 'right', coords[1] > this.coords[1 ? 'bottom' : 'top']];
            this.setSliderPosition(this.state.styles.position + (coords[0] - this.coords[0]) );
            this.delta = [Math.abs(coords[0] - this.coords[0]), Math.abs(coords[1] - this.coords[1])];
            this.coords = coords;
        }
    }

    onPointerUp(e) {
        this.dragging = false;
        this.magnetize();
    }

    magnetize() {
        if (this.direction) {
            let pageSize = this.state.fullPage ?  this.state.styles.slideSize * this.state.visibleSlides : this.state.styles.slideSize * this.state.moveSlides;
            let position = Math.ceil(this.state.styles.position / pageSize) * pageSize;

            if (position === this.prevPosition) {

                // If a clear direction was given to the drag go in that direction if delta was bigger than treshold (20px)
                if (this.state.axis === 'x' && this.delta[0] > this.delta[1] && this.delta[0] > SLIDE_TO_NEXT_TRESHOLD) {
                    position = this.direction[0] === 'right' ? position - pageSize : position + pageSize;
                } else if(this.state.axis === 'y' && this.delta[1] > this.delta[0] && this.delta[1] > SLIDE_TO_NEXT_TRESHOLD) {
                    position = this.direction[1] === 'bottom' ? position - pageSize : position + pageSize;
                }
            }

            this.setSliderPosition(position);
            this.direction = null;
        }
    }

    onResize() {
        this.setSliderStyles();
    }

    autoTimeout() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.goToNextSlide();
        }, this.state.autoSpeed);
    }

}

export default ReactSlider;