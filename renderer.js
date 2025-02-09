const { ipcRenderer } = require("electron");

let editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  lineNumbers: true,
  mode: "javascript",
  theme: "monokai",
  autoCloseBrackets: true,
});

let currentFilePath = null;

// Open File
document.getElementById("openFile").addEventListener("click", async () => {
  const file = await ipcRenderer.invoke("open-file");
  if (file) {
    editor.setValue(file.content);
    currentFilePath = file.path;
  }
});

// Save File
document.getElementById("saveFile").addEventListener("click", async () => {
  const content = editor.getValue();
  currentFilePath = await ipcRenderer.invoke("save-file", { content, filePath: currentFilePath });
});

// Run JavaScript File
document.getElementById("runFile").addEventListener("click", async () => {
  if (!currentFilePath) {
    alert("Save the file first!");
    return;
  }

  const output = await ipcRenderer.invoke("run-file", currentFilePath);
  document.getElementById("output").textContent = output;
});
