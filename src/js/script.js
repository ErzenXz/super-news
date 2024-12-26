const apiBase = "https://apis.erzen.xyz/news";
let page = 1;
let pageSize = 18;
let currentCategory = "";
let currentCountry = "";

// script.js

let isFetching = false;

document.addEventListener("DOMContentLoaded", () => {
  const savedCountry = localStorage.getItem("selectedCountry");
  if (savedCountry) {
    currentCountry = savedCountry;
    document
      .querySelectorAll(".filter-list.countries .filter-item")
      .forEach((item) => {
        item.classList.toggle(
          "active",
          item.getAttribute("data-country") === savedCountry
        );
      });
  }

  fetchArticles();

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    page = 1;
    isFetching = false;
    document.getElementById("articles").innerHTML = "";
    fetchArticles();
  });

  // Category Filters
  document
    .querySelectorAll(".filter-list.categories .filter-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-list.categories .filter-item")
          .forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        currentCategory = item.getAttribute("data-category");
        page = 1;
        isFetching = false;
        document.getElementById("articles").innerHTML = "";
        fetchArticles();
      });
    });

  // Country Filters
  document
    .querySelectorAll(".filter-list.countries .filter-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-list.countries .filter-item")
          .forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        currentCountry = item.getAttribute("data-country");
        localStorage.setItem("selectedCountry", currentCountry);
        page = 1;
        isFetching = false;
        document.getElementById("articles").innerHTML = "";
        fetchArticles();
      });
    });

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 100 &&
      !isFetching
    ) {
      page++;
      fetchArticles();
    }
  });
});

function fetchArticles() {
  if (isFetching) return;
  isFetching = true;

  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "block";

  const query = document.getElementById("query").value.trim();
  let url = "";

  if (query) {
    if (page === 1) {
      showSearchMessage(query);
    }
    url = `${apiBase}/advanced-search?query=${encodeURIComponent(
      query
    )}&page=${page}&pageSize=${pageSize}`;
  } else {
    clearSearchMessage();
    url = `${apiBase}/get-articles?page=${page}&pageSize=${pageSize}`;
    if (currentCategory) {
      url += `&category=${encodeURIComponent(currentCategory)}`;
    }
    if (currentCountry) {
      url += `&country=${encodeURIComponent(currentCountry)}`;
    }
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      loadingIndicator.style.display = "none";
      isFetching = false;
      if (Array.isArray(data.data)) {
        displayArticles(data.data);
      } else {
        displayArticles(data);
      }
    })
    .catch((error) => {
      console.error("Error fetching articles:", error);
      loadingIndicator.style.display = "none";
      isFetching = false;
    });
}

function showSearchMessage(query) {
  let searchMessage = document.getElementById("search-message");
  if (!searchMessage) {
    searchMessage = document.createElement("h2");
    searchMessage.id = "search-message";
    searchMessage.classList.add("search-message");
    document
      .getElementById("articles")
      .insertAdjacentElement("beforebegin", searchMessage);
  }
  searchMessage.textContent = `Showing results for "${query}"`;
}

function clearSearchMessage() {
  const searchMessage = document.getElementById("search-message");
  if (searchMessage) {
    searchMessage.remove();
  }
}

function displayArticles(articles) {
  const articlesDiv = document.getElementById("articles");
  articles.forEach((article) => {
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("article");

    const date = new Date(article.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    articleDiv.style.backgroundImage = article.imageUrl
      ? `url('${article.imageUrl}')`
      : "";
    articleDiv.style.backgroundSize = "cover";
    articleDiv.style.backgroundPosition = "center";

    articleDiv.innerHTML = `
        <div class="overlay"></div>
        <div class="article-content">
          <div class="article-meta">
            <span>${date}</span>
            ${article.author ? `<span>By ${article.author}</span>` : ""}
          </div>
          <h2>${article.title}</h2>
        </div>
      `;

    articleDiv.addEventListener("click", () => {
      window.location.href = `article.html?article=${article.id}`;
    });

    articlesDiv.appendChild(articleDiv);
  });
}
