class InputData {
  constructor() {
    this.animationSpeed = 1.0;
    this.randomisePoints = false;
    this.numPoints = 9;
  }
}

class InputController {
  constructor() {
    this.data = new InputData();
    this.callbacks = [];
    
    let button = createButton('submit');
    button.position(0, 65);
    button.mousePressed(x => {});

    this.slider = createSlider(0,5,1,0.2);
    this.slider.position(0,0);
    this.slider.input(() => this.inputChanged());

    this.pointsSlider = createSlider(3,30,9,1);
    this.pointsSlider.position(150,0);
    this.pointsSlider.input(() => this.inputChanged());

    this.selector = createSelect();
    this.selector.position(300, 0);
    this.selector.option('Symmetrical');
    this.selector.option('Random');
    this.selector.changed(() => this.inputChanged());
  }

  addInputChangedCallback(event) {
    this.callbacks.push(event);
  }

  inputChanged() {
    this.data.animationSpeed = this.slider.value();
    this.data.randomisePoints = this.selector.value() == 'Random';
    this.data.numPoints = this.pointsSlider.value();
    this.callbacks.forEach(x => x(this.data));
  }
}