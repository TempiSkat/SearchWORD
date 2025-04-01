document.getElementById('searchButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const searchWord = document.getElementById('searchWord').value.toLowerCase();
    const output = document.getElementById('output');

    if (!fileInput.files.length) {
        output.textContent = "Please upload a text file.";
        return;
    }

    // Read file content
    const file = fileInput.files[0];
    const fileContent = await file.text();

    // Load Pyodide
    const pyodide = await loadPyodide();
    await pyodide.loadPackage('micropip');

    // Python code with bold highlighting feature
    const pythonCode = `
def search_text(lines, word):
    results = []
    for line in lines:
        if word in line.lower():
            # Highlighting the word using bold HTML tags
            highlighted_line = line.lower().replace(word, f"<b>{word}</b>")
            results.append(highlighted_line)
    return results

file_lines = file_content.split("\\n")
search_word = "${searchWord}"
result_lines = search_text(file_lines, search_word)
"\\n".join(result_lines)
`;

    // Pass file content to Pyodide
    pyodide.runPython(`
file_content = """${fileContent}"""
    `);

    // Run Python code and get results
    const results = pyodide.runPython(pythonCode);
    output.innerHTML = results || "No matches found.";  // Using innerHTML for rendering bold tags
});
