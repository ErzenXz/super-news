// article.js

document.addEventListener("DOMContentLoaded", () => {
  const articleId = getArticleIdFromURL();
  if (!articleId) {
    document.getElementById("article-content").innerHTML =
      "<p>Article not found.</p>";
    return;
  }

  fetchArticleById(articleId);
  setupSummarizeButton();
});

function getArticleIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("article");
}

function fetchArticleById(id) {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "block";

  fetch(`https://apis.erzen.tk/news/get-article/${id}`)
    .then((response) => response.json())
    .then((data) => {
      loadingIndicator.style.display = "none";
      if (data && data.id) {
        displayArticle(data);
      } else {
        document.getElementById("article-content").innerHTML =
          "<p>Article not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching article:", error);
      loadingIndicator.style.display = "none";
      document.getElementById("article-content").innerHTML =
        "<p>Error loading article.</p>";
    });
}

function displayArticle(article) {
  document.title = `${article.title} - NewsFlow`;

  const date = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleContent = document.getElementById("article-content");
  articleContent.innerHTML = `
    <h1 class="article-title">${article.title}</h1>
    <div class="article-meta">
      <span>${date}</span>
      ${article.author ? `<span>By ${article.author}</span>` : ""}
    </div>
    ${
      article.imageUrl
        ? `<img src="${article.imageUrl}" alt="${article.title}" class="article-image">`
        : ""
    }
    <div class="article-body">
      ${article.content || "<p>No content available.</p>"}
    </div>
    <a href="${
      article.link
    }" target="_blank" class="read-more-link">Read Original Article</a>
  `;
}

function setupSummarizeButton() {
  const summarizeBtn = document.getElementById("summarize-btn");
  summarizeBtn.addEventListener("click", () => {
    summarizeBtn.disabled = true;
    summarizeBtn.textContent = "Summarizing...";
    const articleId = getArticleIdFromURL();
    if (!articleId) {
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = "Summarize Article";
      return;
    }

    fetchSummarize(articleId).finally(() => {
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = "Summarize Article";
    });
  });
}

function fetchSummarize(id) {
  const loadingIndicator = document.getElementById("loading-indicator");
  const summarySection = document.getElementById("summary");
  loadingIndicator.style.display = "flex";
  summarySection.innerHTML = "";

  return fetch(`https://apis.erzen.tk/news/get-article/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.link) {
        return fetch(
          `https://apis.erzen.tk/browser/fetch?url=${encodeURIComponent(
            data.link
          )}`
        );
      } else {
        throw new Error("Article URL not found.");
      }
    })
    .then((response) => response.json())
    .then((data) => {
      loadingIndicator.style.display = "none";
      summarySection.innerHTML = marked.parse(data.result.content);
    })
    .catch((error) => {
      console.error("Error summarizing article:", error);
      loadingIndicator.style.display = "none";
      summarySection.innerHTML = "<p>Error summarizing article.</p>";
    });
}
