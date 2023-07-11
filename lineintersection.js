function lineIntersection(pointA, pointB, pointC, pointD) {
  var z1 = (pointA.x - pointB.x);
  var z2 = (pointC.x - pointD.x);
  var z3 = (pointA.y - pointB.y);
  var z4 = (pointC.y - pointD.y);
  var dist = z1 * z4 - z3 * z2;
  if (dist == 0) {
    return null;
  }
  var tempA = (pointA.x * pointB.y - pointA.y * pointB.x);
  var tempB = (pointC.x * pointD.y - pointC.y * pointD.x);
  var xCoor = (tempA * z2 - z1 * tempB) / dist;
  var yCoor = (tempA * z4 - z3 * tempB) / dist;
  const eps = 0.001;

  if (xCoor < Math.min(pointA.x, pointB.x) - eps || xCoor > Math.max(pointA.x, pointB.x) + eps ||
    xCoor < Math.min(pointC.x, pointD.x) - eps || xCoor > Math.max(pointC.x, pointD.x) + eps) {
    return null;
  }
  if (yCoor < Math.min(pointA.y, pointB.y) - eps || yCoor > Math.max(pointA.y, pointB.y) + eps ||
    yCoor < Math.min(pointC.y, pointD.y) - eps || yCoor > Math.max(pointC.y, pointD.y) + eps) {
    return null;
  }

  return {x:xCoor, y:yCoor};
}