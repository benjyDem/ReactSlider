# ReactSlider

Creates a responsive vertical or horizontal slider using React.

### License

Released under the MIT license - http://opensource.org/licenses/MIT

## Instanciation

```javascript

let settings = {
    visibleSlides: 2,
    dots: true,
    desktopDrag: true,
    auto: true
};

return  <ReactSlider {...settings}>
    <div>
        My first slide
    </div>
    <div>
        My second slide
    </div>
    <div>
        <img src="images/0.jpg" alt="" />
    </div>
</ReactSlider>;
        
```

## Props

```javascript
let props = {
    "visibleSlides": 1, // {Int}
    "moveSlides": 1, // {Int}
    "axis": "x", // {"x" || "y"}
    "transition": "slide",
    "transitionSpeed": 500, // {Int} time in ms
    "arrows": true, // {Bool}
    "infinite": false, // {Bool}
    "lazyLoad": true, // {Bool}
    "adaptiveHeight":  false, // {Bool}
    "loadedImages": [],
    "dots": false, // {Bool}
    "fullPages": false, // if true will add whitespace if a page doesn't contain enough visibleSlides
    "prevText": "Previous",
    "nextText": "Next",
    "desktopDrag": false, // {Bool} if true desktop users can drag with mouse
    "auto": false, // {Bool}
    "autoSpeed": 4000, // {Int} time in ms
    "imageComponents": [] // {Array}
}

```

## imageComponents

Thye imageComponents prop is used for lazy loading, in the case where you have a custom component that
returns an img element. In my use case I had a ResponsiveImage component wit two props depending on
screen size : large and small.
This is how i initialized this prop :

```
    imageComponents: [[ResponsiveImage, isMobile ? 'small' : 'large']]
```

First attribute is the component type, the second is the prop in which we can find the img src.
ReactSlider has a default imageComponent which is the following 
```
['img', 'src']
```
The plugin loops on each slids children elements using React.Children.map, then it checks the type of 
the child components (for example 'img' or ResponsiveImage), if the type matches a known imageComponent
then it will check the element's props for example 'src' or 'large' to find the image to lazy load.