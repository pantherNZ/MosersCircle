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
    this.state = State.DrawLines;
    this.time = 0.0;
    this.speed = 1.0;
    this.numCycles = 0;
    // Sorting is required since the order of keys is not guaranteed
    this.stateValues = Object.values(State).sort(function(a, b) {
        return State[a] - State[b];
    });
  }

  processState() {
    this.time += deltaTime * 0.001 * this.speed;
    if (this.time >= StateLength[this.state]) {
      this.time = 0.0;
      this.state = this.nextState(this.state);
      if(this.state == State.DrawLines) {
        this.numCycles++;
      }
    }
  }

  nextState() {
    let index = (this.state + 1) % this.stateValues.length;
    return this.stateValues[index];
  }

  getStateLength() {
    return StateLength[this.state];
  }
}