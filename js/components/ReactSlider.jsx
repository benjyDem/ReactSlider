import React from 'react';
require('../../scss/ReactSlider.scss');

class ReactSlider extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            slidesToShow: props.slidesToShow || 1,
            slidesToScroll: props.slidesToScroll || 1,
            axis: props.axis || 'x',
            transition: props.transition || 'slide',
            transitionSpeed: 500,
            arrows: props.arrows || true,
            infinite: props.infinite || false,
            lazyLoad: true,
            adaptiveHeight: props.adaptiveHeight || false,
            loadedImages: [],

            styles: {
                position: 0,
                slideWidth: 'auto',
                slideHeight: 'auto'
            }
        };

    }

    componentDidMount() {
        requestAnimationFrame(() => {
            this.setSliderState();
        });

        this._onPointerUp = this.onPointerUp.bind(this);
        this._onPointerMove = this.onPointerMove.bind(this);
        this._onResize = this.onResize.bind(this);

        window.addEventListener('resize', this._onResize);
        window.addEventListener('mouseup', this._onPointerUp);
        window.addEventListener('mousemove', this._onPointerMove);
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('mouseup', this._onPointerUp);
        window.removeEventListener('mousemove', this._onPointerMove);
    }

    render() {

        let children = this.getChildren();

        let listeners = {
            onMouseDown: this.onPointerDown.bind(this)
        };

        return <div ref="slider" className="react-slider" {...listeners}>

            <ul className="react-slider-slides"
                style={ {
                    width: this.state.styles.overallWidth+'px',
                    height: this.state.styles.slideHeight+'px',
                    left: this.state.styles.position+'px',
                    transition: this.getTransitionCSS()
                }}>

                { children.map((child, i) => {
                    return <li key={i}
                               style={{width: this.state.styles.slideWidth+'px'}}
                               className="react-slider-slide">
                        {child}
                    </li>
                })}

            </ul>

            {this.state.arrows && this.renderArrows()}
        </div>;
    }

    renderArrows() {

        return <div className="react-slider-arrows">
            <button className="prev"
                    disabled={!this.state.infinite &&this.state.styles.position >= this.state.styles.maxPosition}
                    onClick={() => this.goToPrevSlide()}>
                {this.props.prevText || 'Previous'}
            </button>
            <button className="next"
                    disabled={!this.state.infinite && this.state.styles.position <= this.state.styles.minPosition }
                    onClick={() => this.goToNextSlide()}>
                {this.props.nextText || 'Next'}
            </button>
        </div>;
    }

    goToPrevSlide() {
        this.setSliderPosition(this.state.styles.position + this.state.styles.slideWidth );
    }

    goToNextSlide() {
        this.setSliderPosition( this.state.styles.position - this.state.styles.slideWidth );
    }

    setSliderPosition(position) {

        position = Math.min(Math.max(position, this.state.styles.minPosition ), this.state.styles.maxPosition);
        this.setState({
            styles: Object.assign({}, this.state.styles,{position: position})
        }, () => this.loadVisibleSlideImages());
    }

    setSliderState() {

        let slideWidth = this.refs.slider.offsetWidth / this.state.slidesToShow;
        let styles ={
            slideWidth: slideWidth,
            overallWidth: slideWidth * this.props.children.length,
            position: 0,
            maxPosition: 0
        };

        styles.minPosition = -( this.props.children.length * styles.slideWidth - styles.slideWidth * this.state.slidesToShow);

        if (this.refs.slider.getElementsByClassName('react-slider-slide').length) {

            styles.slideHeight = this.state.adaptiveHeight ?
                this.refs.slider.getElementsByClassName('react-slider-slide')[this.state.activeSlide].offsetHeight :
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
                return 'left '+this.state.transitionSpeed+'ms ease-in';
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
            return React.Children.map(level.props.children, child => {

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

        let activeSlide = Math.abs( Math.round( this.state.styles.position / this.state.styles.slideWidth ) );

        for (let i= activeSlide, iLength = activeSlide+this.state.slidesToShow; i< iLength; ++i) {

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
        this.coords = [e.pageX, e.pageY];
    }

    onPointerMove(e) {
        if (this.dragging) {
            let coords = [e.pageX, e.pageY];
            this.direction = [coords[0] > this.coords[0] ? 'left' : 'right', coords[1] > this.coords[1 ? 'bottom' : 'top']];
            this.setSliderPosition(this.state.styles.position + (coords[0] - this.coords[0]) );
            this.coords = coords;
        }
    }

    onPointerUp(e) {
        this.dragging = false;
        this.magnetize();
    }

    magnetize() {
        let position = Math.ceil(this.state.styles.position / this.state.styles.slideWidth) * this.state.styles.slideWidth;
        if (position === this.prevPosition) position = this.direction[0] === 'right' ? position - this.state.styles.slideWidth : position + this.state.styles.slideWidth;
        this.setSliderPosition(position);
    }

    onResize() {
        this.setSliderState();
    }

}

export default ReactSlider;