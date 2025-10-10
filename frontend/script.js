async function fetchData() {
  const query = document.getElementById("query").value.trim();
  const summaryDiv = document.getElementById("summary");
  const resultsDiv = document.getElementById("results");
  const suggestionsDiv = document.getElementById("suggestions");

  if (!query) {
    summaryDiv.innerHTML = "<p>Please enter a topic.</p>";
    return;
  }

  summaryDiv.innerHTML = "<p>Fetching data...</p>";
  resultsDiv.innerHTML = "";
  suggestionsDiv.innerHTML = "";

  try {
    const response = await fetch(`http://127.0.0.1:8000/research?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.error) {
      summaryDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
      return;
    }

    // 🧠 Summary
    summaryDiv.innerHTML = `
      <h2>🧾 Summary</h2>
      <p>${data.summary}</p>
      <p><strong>Verification:</strong> ${data.verified}</p>
    `;

    // 🔗 Results
    if (data.results && data.results.length > 0) {
      resultsDiv.innerHTML = `
        <h2>🌐 Top Sources</h2>
        <ul>
          ${data.results
            .map(
              (item) =>
                `<li><a class="link" href="${item.link}" target="_blank">${item.title}</a> - ${item.snippet}</li>`
            )
            .join("")}
        </ul>
      `;
    } else {
      resultsDiv.innerHTML = "<p>No results found.</p>";
    }

    // 💡 Suggestions
    if (data.suggestions && data.suggestions.length > 0) {
      suggestionsDiv.innerHTML = `
        <h2>💡 Suggestions</h2>
        <ul>
          ${data.suggestions.map((s) => `<li>${s}</li>`).join("")}
        </ul>
        <p><em>${data.message}</em></p>
      `;
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    summaryDiv.innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
  }
}
