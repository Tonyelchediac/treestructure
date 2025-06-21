document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("input");
  const preview = document.getElementById("preview");
  const formatBtn = document.getElementById("format-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const treeStyle = document.getElementById("tree-style");
  const trailingSlash = document.getElementById("trailing-slash");
  const exampleBtns = document.querySelectorAll(".example-btn");

  // Examples data
  const examples = {
    basic: `root/\n    folder1/\n        file1.txt\n        file2.txt\n    folder2/\n        subfolder/\n            file3.txt\n    file4.txt`,
    project: `my-project/\n    src/\n        components/\n            Header.js\n            Footer.js\n        pages/\n            Home.js\n            About.js\n        App.js\n    public/\n        index.html\n        favicon.ico\n    package.json\n    README.md`,
    family: `Grandparents/\n    Parent 1/\n        Child 1\n        Child 2\n    Parent 2/\n        Child 3\n        Child 4`,
    org: `CEO/\n    VP Engineering/\n        Engineering Manager 1/\n            Team Lead 1\n            Team Lead 2\n        Engineering Manager 2/\n            Team Lead 3\n    VP Marketing/\n        Marketing Director\n    VP Sales/\n        Sales Director`,
  };

  // Update preview when input changes
  input.addEventListener("input", updatePreview);
  treeStyle.addEventListener("change", updatePreview);
  trailingSlash.addEventListener("change", updatePreview);

  // Button event listeners
  formatBtn.addEventListener("click", formatInput);
  clearBtn.addEventListener("click", clearInput);
  copyBtn.addEventListener("click", copyToClipboard);

  // Example buttons
  exampleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const example = this.getAttribute("data-example");
      input.value = examples[example];
      updatePreview();
    });
  });

  // Initial preview update
  updatePreview();

  function updatePreview() {
    const text = input.value;
    const style = treeStyle.value;
    const addTrailingSlash = trailingSlash.checked;
    preview.textContent = generateTree(text, style, addTrailingSlash);
  }

  function generateTree(text, style, addTrailingSlash) {
    const lines = text.split("\n");
    let tree = "";
    let stack = [];

    // Define connectors based on style
    const connectors = {
      ascii: { branch: "├── ", last: "└── ", line: "│   " },
      box: { branch: "├── ", last: "└── ", line: "│   " },
      simple: { branch: "|-- ", last: "`-- ", line: "|   " },
    };
    const { branch, last, line } = connectors[style];

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      if (!currentLine.trim()) {
        tree += "\n";
        continue;
      }

      const indent = currentLine.search(/\S|$/);
      const content = currentLine.trim();
      const isDir = content.endsWith("/");
      let displayContent = content;

      // Add trailing slash if needed
      if (addTrailingSlash && isDir && !content.endsWith("/")) {
        displayContent = content + "/";
      } else if (!addTrailingSlash && content.endsWith("/")) {
        displayContent = content.slice(0, -1);
      }

      // Remove items from stack with greater or equal indentation
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      // Add prefix
      let prefix = "";
      for (let j = 0; j < stack.length; j++) {
        prefix += stack[j].isLast ? "    " : line;
      }

      if (stack.length > 0) {
        prefix += stack[stack.length - 1].isLast ? "    " : line;
      }

      // Determine if this is the last child
      let isLast = true;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim()) {
          const nextIndent = lines[j].search(/\S|$/);
          if (nextIndent > indent) continue;
          if (nextIndent === indent) {
            isLast = false;
            break;
          }
          if (nextIndent < indent) break;
        }
      }

      // Add connector
      if (indent > 0) {
        prefix = prefix.slice(0, -line.length);
        prefix += isLast ? last : branch;
      }

      tree += prefix + displayContent + "\n";

      // Push to stack if this line has children
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.trim()) {
          const nextIndent = nextLine.search(/\S|$/);
          if (nextIndent > indent) {
            stack.push({ indent, isLast });
          }
        }
      }
    }

    return tree;
  }

  function formatInput() {
    const text = input.value;
    const lines = text.split("\n");
    let formatted = "";
    let lastIndent = 0;

    for (const line of lines) {
      if (!line.trim()) {
        formatted += "\n";
        continue;
      }

      const indent = line.search(/\S|$/);
      const content = line.trim();

      // Normalize indentation to multiples of 4
      const normalizedIndent = Math.floor(indent / 4) * 4;
      formatted += " ".repeat(normalizedIndent) + content + "\n";
      lastIndent = normalizedIndent;
    }

    input.value = formatted.trim();
    updatePreview();
  }

  function clearInput() {
    input.value = "";
    updatePreview();
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(preview.textContent);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy to Clipboard";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
});
