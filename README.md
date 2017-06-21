# ReactSlider

Creates a responsive vertical or horizontal slider using React.

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

```json
    {
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
            "autoSpeed": 4000 // {Int} time in ms
    }

```