document.getElementById('searchButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const searchWord = document.getElementById('searchWord').value.toLowerCase();
    const output = document.getElementById('output');

    // Validate file input
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

    // Python code with highlighting feature
    const pythonCode = `
def search_text(lines, word):
    results = []
    for line in lines:
        if word in line.lower():
            # Highlighting word with <span> HTML tag
            highlighted_line = line
            start_idx = 0
            while word in highlighted_line[start_idx:].lower():
                idx = highlighted_line[start_idx:].lower().index(word)
                full_idx = start_idx + idx
                highlighted_line = (
                    highlighted_line[:full_idx] + 
                    f"<span class='highlight'>" + 
                    highlighted_line[full_idx:full_idx + len(word)] + 
                    "</span>" + 
                    highlighted_line[full_idx + len(word):]
                )
                start_idx = full_idx + len("<span class='highlight'>") + len(word) + len("</span>")
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

    // Run Python code and display results
    const results = pyodide.runPython(pythonCode);
    output.innerHTML = results || "No matches found.";  // Using innerHTML for rendering highlighting
});
