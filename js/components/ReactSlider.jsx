import React from 'react';


const REACT_SLIDER_SLIDE_TO_NEXT_TRESHOLD = 5;
const REACT_SLIDER_DEFAULT_OPTIONS = {
    moveSlides: 1,
    visibleSlides: 1,
    dots: false,
    arrows: false,
    transition: 'slide',
    transitionDuration: 500,
    axis: 'x',
    infinite: false,
    lazyLoad: true,
    fullPages: false,
    prevText: 'Previous',
    nextText: 'Next',
    desktopDrag: false, // if true desktop users can drag with mouse
    auto: false,
    autoSpeed: 4000,
    adaptiveHeight: false
};

var REACT_SLIDER_IMAGE_COMPONENTS = [['img','src']];

class ReactSlider extends React.Component {

    constructor(props) {
        super(props);


        this.state = this.stateFromProps(props);
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

    stateFromProps(props) {

        let state = {
            loadedImages: [],

            touch: typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
        };

        state.axisClass = this.getOption('axis') === 'x' ? '' : 'vertical-slider';

        let moveSlides = this.getOption('moveSlides');
        let visibleSlides = this.getOption('visibleSlides');

        if (props.children.length % visibleSlides === 0) {
            state.pages = Math.ceil(props.children.length / moveSlides) - moveSlides;
        }

        let slideNumber = props.children.length;
        if (this.props.fullPages) {
            while(slideNumber % visibleSlides !==0) {
                slideNumber++;
            }
        }

        return state;
    }

    componentDidMount() {

        // wait for rendering to compute sizes
        this.setSliderStyles();
        this._onPointerUp = this.onPointerUp.bind(this);
        this._onPointerMove = this.onPointerMove.bind(this);
        this._onResize = this.update.bind(this);
        this.isVisible = this.refs.slider.offsetParent !== null;

        window.addEventListener('resize', this._onResize);

        if (!this.state.touch) {
            if (this.props.desktopDrag) {
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
            if (this.props.desktopDrag) {
                window.removeEventListener('mouseup', this._onPointerUp);
                window.removeEventListener('mousemove', this._onPointerMove);
            }
        } else {
            window.removeEventListener('touchend', this._onPointerUp);
            window.removeEventListener('touchmove', this._onPointerMove);
        }

    }

    componentWillReceiveProps(props) {
        let isVisible = this.refs.slider.offsetParent !== null;
        if(props.visibleSlides !== this.props.visibleSlides || props.moveSlides !== this.props.moveSlides || isVisible !== this.isVisible) this.update();
        this.isVisible = isVisible;
    }

    render() {

        if (this.props.auto) this.autoTimeout();

        let children = this.getChildren();
        let axis = this.getOption('axis');

        let listeners = {};
        if (this.state.touch)
            listeners.onTouchStart = this.onPointerDown.bind(this);
        else if (this.getOption('desktopDrag'))
            listeners.onMouseDown = this.onPointerDown.bind(this);

        let style = {
            transition: this.getTransitionCSS()
        };

        style[this.keys[axis].size] = this.state.styles.overallSize+'px';
        style[this.keys[axis].oppositeSize] = this.state.styles.oppositeSize+'px';
        style[this.keys[axis].direction] = this.state.styles.position+'px';
        style.opacity = this.state.styles.opacity;

        let liStyle = {};
        liStyle[this.keys[axis].size] = this.state.styles.slideSize+'px';
        return <div ref="slider" className={"react-slider " + this.state.axisClass + (this.state.mounted ? '' : ' is-mounting') }>

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

            {this.getOption('arrows') && this.props.children.length > this.getOption('visibleSlides') && this.renderArrows()}
            {this.props.dots && this.renderDots()}
        </div>;
    }

    renderArrows() {


        return <div className="react-slider-arrows">
            <button className="prev"
                    disabled={!this.props.infinite &&this.state.styles.position >= this.state.styles.maxPosition}
                    onClick={() => this.goToPrevSlide()}>
                {this.state.prevText}
            </button>
            <button className="next"
                    disabled={!this.props.infinite  && this.state.styles.position <= this.state.styles.minPosition }
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

    goToSlide(i) {
        let page = i - (i%this.getOption('moveSlides'));
        this.setSliderPosition( this.getPagePosition(page) );
    }

    goToPrevSlide() {
        this.setSliderPosition(this.state.styles.position + this.state.styles.slideSize*this.getOption('moveSlides') );
    }

    goToNextSlide() {
        this.setSliderPosition( this.state.styles.position - this.state.styles.slideSize*this.getOption('moveSlides') );
    }

    update() {
        this.setSliderStyles();
    }

    getPagePosition(page) {
        if (page === this.state.pages -1) return this.state.styles.minPosition;
        return -this.state.styles.slideSize * this.getOption('moveSlides') * page;
    }

    setSliderPosition(position) {

        if (this.props.infinite) {
            if (position > this.state.styles.maxPosition) {
                position = this.state.styles.minPosition;
            } else if (position < this.state.styles.minPosition) {
                position = this.state.styles.maxPosition;
            }
        }

        position = Math.min(Math.max(position, this.state.styles.minPosition ), this.state.styles.maxPosition);

        let styles = Object.assign({}, this.state.styles);
        let currentSlide = Math.abs(this.state.styles.position || 0) / styles.slideSize;
        let nextSlide = Math.abs(position) / styles.slideSize;
        if (this.props.beforeSlide) this.props.beforeSlide(currentSlide, nextSlide);

        if (this.getOption('transition') === 'fade') {
            // fade out
            styles.opacity = 0;
            this.setState({
                styles: styles
            }, () => {
                // move and fade in
                setTimeout(() => {
                    styles.opacity = 1;
                    styles.position = position;
                    this.setState({
                        styles: styles
                    }, () => {
                        if (this.props.afterSlide) this.props.afterSlide(nextSlide, currentSlide);
                        this.loadVisibleSlideImages();
                    });
                }, this.getOption('transitionDuration') );
            });

        } else {
            styles.position = position;
            this.setState({
                styles: styles
            }, () => {
                if (this.props.afterSlide) this.props.afterSlide(nextSlide, currentSlide);
                this.loadVisibleSlideImages();
            });

        }
    }

    setSliderStyles() {

        let visibleSlides = this.getOption('visibleSlides');
        let moveSlides = this.getOption('moveSlides');
        let axis = this.getOption('axis');
        let slideSize = this.refs.slider[this.keys[axis].offsetSize] / visibleSlides;
        let styles ={
            slideSize: slideSize,
            overallSize: slideSize * this.props.children.length,
            position: 0,
            maxPosition: 0
        };

        styles.minPosition = -( this.props.children.length * styles.slideSize - styles.slideSize * visibleSlides);
        if (this.props.fullPages && this.props.children.length % visibleSlides !== 0 ) styles.minPosition-= styles.slideSize;

        if (this.refs.slider.getElementsByClassName('react-slider-slide').length) {

            styles.oppositeSize = this.state.adaptiveHeight ?
                this.refs.slider.getElementsByClassName('react-slider-slide')[this.getActiveSlide()][this.keys[axis].offsetOpposite] :
                'auto';
        }


        this.setState({
            mounted: true,
            styles: styles,
            pages :  Math.ceil(this.props.children.length / moveSlides) - (visibleSlides - moveSlides)
        }, () => this.loadVisibleSlideImages());
    }

    getActiveSlide() {
        if (!this.state.styles.position) return 0;
        return Math.abs( Math.round( this.state.styles.position / this.state.styles.slideSize ) );
    }


    getTransitionCSS() {
        switch (this.getOption('transition')) {
            case 'slide':
                if (this.dragging) return 'none';
                return (this.getOption('axis') === 'x' ? 'left' : 'top')+' '+this.getOption('transitionDuration')+'ms ease-in';
            case 'fade':
                return 'opacity '+this.getOption('transitionDuration')+'ms ease-in';
        }
    }

    getChildren() {
        if (!this.getOption('lazyLoad')) return this.props.children;

        this.imagesPerSlides = [];

        return React.Children.map(
            this.props.children,
            (child, i) => {
                this.imagesPerSlides.push([]);
                if (i === 0) return child;
                return React.cloneElement(child, {
                    children: this.findImages(child, i)
                });
            }
        );

    }


    /**
     * Loops over image components and checks if their propsAttribute is
     * already loaded. For exemple for the regular img component
     * this.imageComponents[0][0] === 'img'
     * this.imageComponents[0][1] === 'src'
     * the function checks if each img's src has been added to the loadedImages
     * array. If not it doesn't display them but replaces them with a div
     * with the is-loading class
     * @param level
     * @param slide
     * @returns {*}
     */
    findImages(level, slide) {
        if (level.props && level.props.children) {

            return React.Children.map(level.props.children, child => {
                if (!child || !child.props || child.props.dangerouslySetInnerHTML) return child;
                let src;
                for (let i = 0, iLength = REACT_SLIDER_IMAGE_COMPONENTS.length; i < iLength; i++ ) {

                    if (child.type === REACT_SLIDER_IMAGE_COMPONENTS[i][0] ) {
                        src = child.props[REACT_SLIDER_IMAGE_COMPONENTS[i][1]];

                        if(this.state.loadedImages.indexOf(src) === -1) {
                            this.imagesPerSlides[slide].push(src);
                            return React.createElement('div', {
                                className: child.className ? child.className  +' is-loading' : ' is-loading'
                            });
                        } else {
                            return child;
                        }

                    }
                }

                return React.cloneElement(child, {
                    children: this.findImages(child, slide)
                });

            });

        }
        return level;
    }

    static addImageComponent(component, propsAttribute) {
        REACT_SLIDER_IMAGE_COMPONENTS.push([component, propsAttribute]);
    }

    loadVisibleSlideImages() {

        if (!this.imagesPerSlides.length) return;

        let activeSlide = this.getActiveSlide();

        for (let i= activeSlide, iLength = activeSlide+this.getOption('visibleSlides'); i< iLength; ++i) {

            if (!this.imagesPerSlides[i]) continue;

            this.imagesPerSlides[i].forEach((imageToLoad) => {
                let img = new Image();
                img.onload = this.onImageLoad.bind(this, imageToLoad);
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
            this.direction = [coords[0] > this.coords[0] ? 'left' : 'right', coords[1] > this.coords[1] ? 'bottom' : 'top'];
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
            let pageSize = this.state.fullPage ?  this.state.styles.slideSize * this.getOption('visibleSlides') : this.state.styles.slideSize * this.getOption('moveSlides');
            let position = Math.ceil(this.state.styles.position / pageSize) * pageSize;

            if (position === this.prevPosition) {
                let axis = this.getOption('axis');
                // If a clear direction was given to the drag go in that direction if delta was bigger than treshold (20px)
                if (axis === 'x' && this.delta[0] > this.delta[1] && this.delta[0] > REACT_SLIDER_SLIDE_TO_NEXT_TRESHOLD) {
                    position = this.direction[0] === 'right' ? position - pageSize : position + pageSize;
                } else if(axis === 'y' && this.delta[1] > this.delta[0] && this.delta[1] > REACT_SLIDER_SLIDE_TO_NEXT_TRESHOLD) {
                    position = this.direction[1] === 'bottom' ? position - pageSize : position + pageSize;
                }
            }

            if (this.getOption('transition') === 'slide' || position !== this.prevPosition) this.setSliderPosition(position);
            this.direction = null;
        }
    }

    autoTimeout() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.goToNextSlide();
        }, this.getOption('autoSpeed') );
    }

    /**
     * Bools that are false by default don't need to be accesed with the getOption method
     * @param option
     * @returns {*}
     */
    getOption(option) {
        return typeof this.props[option] === 'undefined' ? REACT_SLIDER_DEFAULT_OPTIONS[option] : this.props[option];
    }

}

export default ReactSlider;