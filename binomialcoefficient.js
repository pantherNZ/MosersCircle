let factorialStorage = [1, 1]

// N must be a positive integer
function binomialCoefficient(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}
  
// X must be a positive integer
function factorial(x) {
  if(x < factorialStorage.length) {
    return factorialStorage[x];
  }
  
  let f = factorial(x - 1) * x;
  factorialStorage.push(f);
  return f;
}

function combinations(n, k) {
  const result= [];
  const combos = [];
  
  const recurse = start => {
    if (combos.length + (n - start + 1) < k) { 
      return;
    }
    
    recurse(start + 1);
    combos.push(start - 1);
    
    if(combos.length === k) {     
       result.push(combos.slice());
    }
    else if(combos.length + (n - start + 2) >= k){
       recurse(start + 1);
    }
    
    combos.pop();     
  }
  
  recurse(1, combos);
  return result;
}