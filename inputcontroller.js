
function setupUI() {
  button = createButton('submit');
  button.position(input.x + input.width, 65);
  button.mousePressed(greet);
}