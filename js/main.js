const newsContainer = document.getElementById("newsContainer");
const githubContainer = document.getElementById("githubContainer");
const quoteText = document.getElementById("quoteText");
const themeToggle = document.getElementById("themeToggle");
const filters = document.querySelectorAll(".filter");

// --- Spinner and Toast Elements ---
const globalSpinner = document.getElementById("globalSpinner") || createGlobalSpinner();
function createGlobalSpinner() {
  const div = document.createElement("div");
  div.id = "globalSpinner";
  div.innerHTML = `<div class="spinner"></div>`;
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
}
function showSpinner() { globalSpinner.style.display = "flex"; }
function hideSpinner() { globalSpinner.style.display = "none"; }

let toastTimeout;
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}

// --- Map UI categories to valid API categories ---
const categoryMap = {
  technology: "technology",
  ai: "technology",
  "open-source": "technology",
  startup: "business"
};
// --------------------------------------------------

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  showToast(document.body.classList.contains("dark") ? "Dark mode enabled" : "Light mode enabled");
});

filters.forEach(button => {
  button.addEventListener("click", () => {
    const apiCategory = categoryMap[button.dataset.category] || "technology";
    fetchNews(apiCategory);
    filters.forEach(b => b.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
  });
});

// News API with spinner, error, retry
async function fetchNews(category = "technology") {
  newsContainer.innerHTML = "";
  showSpinner();
  try {
    const res = await fetch(`https://newsdata.io/api/1/news?apikey=pub_825974c8c3a6267daf8e8b422d7af21fd46a1&category=${category}&language=en`);
    const data = await res.json();
    hideSpinner();
    if (data.results && data.results.length) {
      newsContainer.innerHTML = data.results.map(article => `
        <div class="card" tabindex="0" aria-label="News article: ${article.title}">
          <h3>${article.title}</h3>
          <p>${article.description || "No description available."}</p>
          <a href="${article.link}" target="_blank" rel="noopener">Read more</a>
        </div>`).join("");
      animateCards(newsContainer);
    } else {
      newsContainer.innerHTML = `<div>No news available. <button id="retryNews">Retry</button></div>`;
      document.getElementById("retryNews").onclick = () => fetchNews(category);
      showToast("No news found for this category.");
    }
  } catch (err) {
    hideSpinner();
    newsContainer.innerHTML = `<div>Failed to fetch news. <button id="retryNews">Retry</button></div>`;
    document.getElementById("retryNews").onclick = () => fetchNews(category);
    showToast("Failed to fetch news.");
  }
}

// GitHub Trending with spinner, error, retry, and fallback demo data
async function fetchGitHubTrending() {
  githubContainer.innerHTML = "";
  showSpinner();
  try {
    const res = await fetch("https://gtrend.yapie.me/repositories?since=daily");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    hideSpinner();
    if (Array.isArray(data) && data.length) {
      githubContainer.innerHTML = data.slice(0, 5).map(repo => `
        <div class="card" tabindex="0" aria-label="GitHub repo: ${repo.author}/${repo.name}">
          <h3>${repo.author}/${repo.name}</h3>
          <p>${repo.description}</p>
          <p>⭐ ${repo.stars} | ${repo.language || "Unknown"}</p>
          <a href="${repo.url}" target="_blank" rel="noopener">View on GitHub</a>
        </div>`).join("");
      animateCards(githubContainer);
    } else {
      throw new Error("No data");
    }
  } catch (err) {
    hideSpinner();
    // Fallback demo data
    githubContainer.innerHTML = `
      <div class="card">
        <h3>octocat/Hello-World</h3>
        <p>A demo fallback GitHub repository.</p>
        <p>⭐ 1000 | JavaScript</p>
        <a href="https://github.com/octocat/Hello-World" target="_blank" rel="noopener">View on GitHub</a>
      </div>
      <div>Could not fetch live GitHub trending. <button id="retryGit">Retry</button></div>
    `;
    document.getElementById("retryGit").onclick = fetchGitHubTrending;
    showToast("Failed to fetch GitHub data. Showing demo.");
  }
}

// Daily Quote with spinner, error, retry, and fallback
async function fetchQuote() {
  quoteText.textContent = "Loading...";
  showSpinner();
  try {
    const res = await fetch("https://api.quotable.io/random");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    hideSpinner();
    quoteText.textContent = `"${data.content}" — ${data.author}`;
    quoteText.setAttribute("aria-label", `Quote: ${data.content} by ${data.author}`);
  } catch (err) {
    hideSpinner();
    // Fallback quote
    quoteText.innerHTML = `"Code is like humor. When you have to explain it, it’s bad." — Cory House<br>
      <button id="retryQuote">Retry</button>`;
    document.getElementById("retryQuote").onclick = fetchQuote;
    showToast("Failed to fetch quote. Showing fallback.");
  }
}

// Animate cards on load
function animateCards(container) {
  const cards = container.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(24px) scale(0.98)";
    setTimeout(() => {
      card.style.transition = "opacity 0.6s cubic-bezier(.4,2,.6,1), transform 0.6s cubic-bezier(.4,2,.6,1)";
      card.style.opacity = 1;
      card.style.transform = "translateY(0) scale(1)";
    }, 80 * i);
  });
}

// Initialize
fetchNews();
fetchGitHubTrending();
fetchQuote();