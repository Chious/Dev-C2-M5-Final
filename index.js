const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const dataPanel = document.querySelector("#data-panel");

let showState = "card";
let pageState = 1;

function renderCard(data) {
  let card = ``;

  data.forEach((element) => {
    card += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + element.image}"
              class="card-img-top"
              alt="Movie Poster"
            />
            <div class="card-body">
              <h5 class="card-title">${element.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-user"
                data-bs-toggle="modal"
                data-bs-target="#user-modal"
                data-id="${element.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite">+</button>
            </div>
          </div>
        </div>
      </div>`;
  });

  dataPanel.innerHTML = card;
}

function renderList(data) {
  let listGroup = document.createElement("ul");
  listGroup.className = "list-group list-group-flush";

  let list = ``;

  data.forEach((element) => {
    list += `<li class="list-group-item" style="display:flex; align-items:center">
    <div>
    <h5>${element.title}</h5> 
    </div>
            <div class="button-group" style="position:absolute; right:20px">
              <button
                class="btn btn-primary btn-show-user"
                data-bs-toggle="modal"
                data-bs-target="#user-modal"
                data-id="${element.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite">+</button>
            </div>
            </li>
  `;
  });

  //insert list to data panel
  listGroup.innerHTML = list;
  dataPanel.innerHTML = listGroup.outerHTML;
}

///** new ** siwth perform of data by printDatapanel()//////

function printDatapanel(data) {
  if (showState === "list") {
    return renderList(data);
  } else if (showState === "card") {
    renderCard(data);
  }
}

/////initialize page//////////////////////////

const users = [];
let filteredUsers = [];

axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  printDatapanel(getUsersByPage(pageState)); // Only Print First Page
  renderPaginator(users.length); // Create Paginator
});

//////add Modal Listener/////////////

function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalDescription = document.querySelector("#user-modal-release-date");
  const modalReleaseDate = document.querySelector("#user-modal-description");
  const modalDirector = document.querySelector("#user-modal-director");
  const modalCast = document.querySelector("#user-modal-cast");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    const casts = data.cast;
    let cast_html = "Cast: <br/>";

    modalTitle.innerText = `${data.title}`;

    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="user-poster" class="img-fluid">`;

    modalDescription.innerText = `Email:  ${data.email}`;
    modalReleaseDate.innerText = `Release Date:  ${data.release_date}`;
    modalDirector.innerText = `Director:  ${data.director}`;

    casts.forEach((cast) => {
      cast_html += `・${cast.character}(${cast.name}) <br/>`;
    });

    modalCast.innerHTML = cast_html;
  });
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

/////search form///////////////

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
//監聽表單提交事件

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault();
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase();

  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert("請輸入有效字串！");
  }
  //條件篩選
  filteredUsers = users.filter((user) =>
    user.title.toLowerCase().includes(keyword)
  );
  //重新輸出至畫面
  renderPaginator(filteredUsers.length);
  printDatapanel(getUsersByPage(1));
});

/////設計分頁//////////
const USERS_PER_PAGE = 12; //新增這行
const paginator = document.querySelector("#paginator");

function getUsersByPage(page) {
  //計算起始 index
  const data = filteredUsers.length ? filteredUsers : users;

  const startIndex = (page - 1) * USERS_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

// 回傳 Pagination 的號碼

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);

  pageState = page;
  //更新畫面
  printDatapanel(getUsersByPage(pageState));
});

//// 存取收藏清單//////////////////

//新增函式
function addToFavorite(id) {
  const list =
    localStorage.getItem("favoriteUsers") !== null
      ? JSON.parse(localStorage.getItem("favoriteUsers"))
      : [];
  console.log(list);
  console.log("id: ", id);
  const user = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

////add switch button Listener///////
const setPanel = document.querySelector(".set-datapanel");

setPanel.addEventListener("click", function PanelClicked(event) {
  if (event.target.matches(".btn-set-list")) {
    showState = "list";
    printDatapanel(getUsersByPage(pageState));
  } else if (event.target.matches(".btn-set-card")) {
    showState = "card";
    printDatapanel(getUsersByPage(pageState));
  }
});
