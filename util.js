
function hashVec(v) {
    return (((Math.round(v.x) >> 2)*81131)^((Math.round(v.y) >> 1)*1103515245)^(Math.round(v.z)*1235933));
}
  
function hashVecs(v, g) {
    return (hashVec(v)>>2)^hashVec(g)*13;
}
  
function vecEquals(v, k) {
    return p5.Vector.sub(v, k).magSq() < 0.001;
}
  
function frac(f) {
    return f % 1;
}
  
function hashRand(v) {
    let c = createVector((v.dot(createVector(127.1, 311.7)) + 12323.645)<<2, (v.dot(createVector(269.5, 183.3))+341.345)<<1*7.0);
    return createVector(Math.abs(frac(Math.sin(c.x)*2324.674323)), Math.abs(frac(Math.sin(c.y)*43758.5453123)));
}
  
function randCol(v) {
    return color(hashRand(v).x*255.0, hashRand(v).y*255.0, hashRand(hashRand(v)).x*255.0);
}

function drawCircle(pos, size, fillCol, strokeCol = null, weight = 1) {
    fill(fillCol);
    stroke(strokeCol !== null ? strokeCol : fillCol);
    strokeWeight(weight);
    ellipse(pos.x, pos.y, size, size);
}

function animateLine(posA, posB, col, size, t) {
    drawLine(posA, p5.Vector.lerp(posA, posB, max(0.0, min(1.0, t))), col, size);
}

function drawLine(posA, posB, col, size) {
    stroke(col)
    strokeWeight(size);
    line(posA.x, posA.y, posB.x, posB.y);
}

function drawText(str, pos, col, size) {
    fill(col);
    textSize(size);
    text(str, pos.x, pos.y)
}

function drawFace(numCycles, numFaces, vertices) {
    fill(randCol(createVector(numFaces*13.12 + numCycles*9.32), numFaces*99.23 + numCycles*11.23));
    beginShape();
    vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
}