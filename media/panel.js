(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
      case 'refresh':
        document.getElementById('main').innerHTML = message.html;
        setupClicks();
        break;
    }
  });
  function setupClicks() {
    document.querySelectorAll('.tree-item, .code-item').forEach((element) => {
      element.addEventListener('click', (event) => {
        const cellIndex = parseInt(
          element.getAttribute('data-cell-index') ?? '-1'
        );
        console.log('clicked', cellIndex);
        vscode.postMessage({
          type: 'goToCell',
          cellIndex: cellIndex
        });
      });
    });
  }
})();
