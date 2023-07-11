const State = Object.freeze({
  DrawLines: 0,
  CountPairs: 1,
  CountIntersections: 2,
  CountPlanarEdges: 3,
  CountFaces: 4,
  FinalRender: 5
});

const StateLength = Object.freeze([
  5, 
  12, 
  12, 
  5, 
  5, 
  5  
]);

function nextState(state) {
  var values = Object.values(State).sort(function(a, b) {
      return State[a] - State[b];
  }); //sorting is required since the order of keys is not guaranteed.

  let index = (state + 1) % values.length;
  return values[index];
} 