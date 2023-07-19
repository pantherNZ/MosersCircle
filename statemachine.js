const State = Object.freeze({
  Intro: 0,
  DrawLines: 1,
  CountPairs: 2,
  CountIntersections: 3,
  CountPlanarEdges: 4,
  CountFaces: 5,
});

const StateLength = Object.freeze([
  5, 
  5,
  12,
  12,
  8,
  30,
]);

class StateMachine {
  constructor() {
    this.onStateChanged = new Event("stateChanged");
    this.state = State.DrawLines;
    this.time = 0.0;
    this.speed = 1.0;
    this.numCycles = 0;
    this.stateChangedList = [];
    // Sorting is required since the order of keys is not guaranteed
    this.stateValues = Object.values(State).sort(function(a, b) {
        return State[a] - State[b];
    });
  }

  addStateChangedCallback(event) {
    this.stateChangedList.push(event);
  }

  processState() {
    this.time += deltaTime * 0.001 * this.speed;
    if (this.time >= StateLength[this.state]) {
      this.time = 0.0;
      const prevState = this.state;
      this.state = this.nextState(this.state);
      if(this.state == State.DrawLines) {
        this.numCycles++;
      }

      this.stateChangedList.forEach(x => x(prevState, this.state));
    }
  }

  nextState() {
    let index = (this.state + 1) % this.stateValues.length;
    return this.stateValues[index];
  }

  getStateLength() {
    return StateLength[this.state];
  }

  onInputChanged(data) {
    this.speed = data.animationSpeed;
  }
}