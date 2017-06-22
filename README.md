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

| Property           | Type              | Description                                                                                                                                                              | Default    |
|--------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| visibleSlides      | int               | Number of slides to display at a time                                                                                                                                    | 1          |
| moveSlides         | int               | Number of slides to move at a time                                                                                                                                       | 1          |
| axis               | 'x' || 'y'        | The slider axis                                                                                                                                                          | x          |
| transition         | 'fade' || 'slide' | The type of transition the slider uses                                                                                                                                   | 'slide'    |
| transitionDuration | int               | The duration (in ms) of each transition                                                                                                                                  | 500        |
| arrows             | bool              | Displays next and prev arrows                                                                                                                                            | false      |
| infinite           | bool              | If true then click next on last slide will cause slider to go back to first slide                                                                                        | false      |
| lazyLoad           | bool              | If true then images will not be loaded before their slide is active                                                                                                      | true       |
| adaptiveHeight     | bool              | If true the slider will change heights to fit the current active slide                                                                                                   | false      |
| dots               | bool              | Displays pagination dots for the slider                                                                                                                                  | false      |
| fullPages          | bool              | If true the slider will have extra white space representing empty slides if the number of slides if the number of slides isn't a multiple of the amount of visibleSlides | false      |
| prevText           | string            | Text within the previous button                                                                                                                                          | 'Previous' |
| nextText           | string            | Text within the next button                                                                                                                                              | 'Next'     |
| desktopDrag        | bool              | Should the desktop version of the slider allow drag and drop to slide                                                                                                    | false      |
| auto               | bool              | If true the slider will start sliding automatically to next slide                                                                                                        | false      |
| autoSpeed          | int               | Speed at which the slider automatically changes slides                                                                                                                   | 4000       |
| beforeSlide        | function          | A callback that fires before the slider slides, it sends two parameters : currentSlide and nextSlide                                                                     |            |
| afterSlide         | function          | A callback that fires after the slider has slided, it sends two parameters : currentSlide and previousSlide                                                              |            |

## Methods

| Method                   | Arguments               | Description                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| goToSlide                | slideIndex              | Goes to the target slide in your slider                                                                                                                                                                                                                                                                                                                                                                                         |
| goToPrevSlide            |                         | Goes to the previous slide in your slider                                                                                                                                                                                                                                                                                                                                                                                       |
| goToNextSlide            |                         | Goes to the next slide in your slider                                                                                                                                                                                                                                                                                                                                                                                           |
| update                   |                         | Updates slider styles                                                                                                                                                                                                                                                                                                                                                                                                           |
| static addImageComponent | Component, srcAttribute | LazyLoading parses images present in the slider's children. However some users may have custom components that render images. This method allows you to make ReactSlider consider those elements as images and lazyload them as well. For exemple, if you have a component named <MyImage imgSrc="my_src.jpg"> then you would invoke addImageComponent in the following way : ``` ReactSlider.addImageComponent(MyImage, 'imgSrc'); ``` |
