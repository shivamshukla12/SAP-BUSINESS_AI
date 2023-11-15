const BUTTON_RUNNING_CLASS = "button-running";

window.addEventListener("message", (event) => {
  const buttonId = event.data.buttonId;
  const element = document.getElementById(buttonId);
  element.classList.remove(BUTTON_RUNNING_CLASS);
});

window.onload = init;

function init() {
  const vscode = acquireVsCodeApi();
  function click(ev) {
    const buttonId = ev.target.id;
    if (buttonId) {
      const element = document.getElementById(buttonId);
      if (!element.classList.contains(BUTTON_RUNNING_CLASS)) {
        element.classList.add(BUTTON_RUNNING_CLASS);
        vscode.postMessage({ buttonId });
      }
    }
  }

  const tiles = document.getElementsByClassName("tile");
  Array.from(tiles).forEach((tile) => {
    tile.addEventListener("click", click);
  });
}
