class InputData {
  constructor() {
    this.animationSpeed = 1.0;
  }
}

class InputController {
  constructor() {
    this.data = new InputData();
    this.callbacks = [];
    
    //let button = createButton('submit');
    //button.position(0, 65);
    //button.mousePressed(x => {});

    this.slider = createSlider(0,5,1,0.2);
    this.slider.position(0,0);
    this.slider.input(() => this.inputChanged());
  }

  addInputChangedCallback(event) {
    this.callbacks.push(event);
  }

  inputChanged() {
    this.data.animationSpeed = this.slider.value();
    this.callbacks.forEach(x => x(this.data));
  }
}