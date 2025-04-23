const newsContainer = document.getElementById("newsContainer");
const githubContainer = document.getElementById("githubContainer");
const quoteText = document.getElementById("quoteText");
const themeToggle = document.getElementById("themeToggle");
const filters = document.querySelectorAll(".filter");

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

filters.forEach(button => {
  button.addEventListener("click", () => {
    fetchNews(button.dataset.category);
  });
});

// News API
async function fetchNews(category = "technology") {
  newsContainer.innerHTML = "Loading...";
  try {
    const res = await fetch(`https://newsdata.io/api/1/news?apikey=pub_825974c8c3a6267daf8e8b422d7af21fd46a1&category=${category}&language=en`);
    const data = await res.json();
    if (data.results) {
      newsContainer.innerHTML = data.results.map(article => `
        <div class="card">
          <h3>${article.title}</h3>
          <p>${article.description || "No description available."}</p>
          <a href="${article.link}" target="_blank">Read more</a>
        </div>`).join("");
    } else {
      newsContainer.innerHTML = "No news available.";
    }
  } catch (err) {
    newsContainer.innerHTML = "Failed to fetch news.";
  }
}

// GitHub Trending
async function fetchGitHubTrending() {
  githubContainer.innerHTML = "Loading...";
  try {
    const res = await fetch("https://gtrend.yapie.me/repositories?since=daily");
    const data = await res.json();
    githubContainer.innerHTML = data.slice(0, 5).map(repo => `
      <div class="card">
        <h3>${repo.author}/${repo.name}</h3>
        <p>${repo.description}</p>
        <p>⭐ ${repo.stars} | ${repo.language}</p>
        <a href="${repo.url}" target="_blank">View on GitHub</a>
      </div>`).join("");
  } catch (err) {
    githubContainer.innerHTML = "Failed to fetch GitHub data.";
  }
}

// Daily Quote
async function fetchQuote() {
  try {
    const res = await fetch("https://api.quotable.io/random");
    const data = await res.json();
    quoteText.textContent = `"${data.content}" — ${data.author}`;
  } catch (err) {
    quoteText.textContent = "Couldn't load quote.";
  }
}

// Initialize
fetchNews();
fetchGitHubTrending();
fetchQuote();
