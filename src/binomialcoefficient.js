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