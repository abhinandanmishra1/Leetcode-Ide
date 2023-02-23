export function handleEditorDidMount(editor, monaco) {
  editor.updateOptions({
    // lineNumbers: "off",
    fontSize: "16px",
    mouseWheelZoom: true,
  });
};
