const searchInput = document.getElementById('search');
const results = document.getElementById('results');
const sWine = document.getElementById('sWine');
const clickListWine = document.querySelector('.clickListWine')
const comments = document.getElementById('comments');
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
const btnFilter = document.getElementById("btFilter");
const selectCountry = document.getElementById("selectCountry");
const selectYear = document.getElementById("selectYear");
const nameWine = document.getElementById("nameWine");
const grapesWine = document.getElementById("grapesWine");
const yearWine = document.getElementById("yearWine");
const countryWine = document.getElementById("countryWine");
const regionWine = document.getElementById("regionWine");
const capacityWine = document.getElementById("capacityWine");
const colorWine = document.getElementById("colorWine");
const priceWine = document.getElementById("priceWine");
const pictureWine = document.getElementById("pictureWine");
const clearFilter = document.getElementById("clearFilter");
const closeLogin = document.getElementById("main-holder");
const likeButton = document.getElementById("likeButton");
const createComment = document.getElementById("createComment");
const newComment = document.getElementById("newComment");
const description = document.getElementById('description');
const disconnect = document.getElementById('disconnect');

let searchTerm = '';
let wine;
let filterWines = '';


// API REQUEST
const fetchWines = async (url) => {
  wine = await request(url)
};
async function request(url, params) {
  const result = await fetch(`http://cruth.phpnet.org/epfc/caviste/public/index.php/api/${url}`, params)
  return result.json();
}

// Wine List
const showWinesList = async (loadwines = true) => {
  if (loadwines) await fetchWines('wines');

  results.innerHTML = (

    wine
      .filter(wines => wines.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(wines => (

        ` 
          <li class="list-group-item clickListWine" onclick="UpdateWineList(event)" data-id="${wines.id}" data-grapes="${wines.grapes}" data-year="${wines.year}" >
            ${wines.name}
          </li>
        `
      )).join('')
  );

};
showWinesList();

async function UpdateWineList(event) {
  event.target.dataset.id
  const currentWine = wine.find(w => w.id === event.target.dataset.id)
  pictureWine.src = (`img/${currentWine.picture}`)
  nameWine.querySelector(".value").innerHTML = currentWine.name
  grapesWine.querySelector(".value").innerHTML = currentWine.grapes
  yearWine.querySelector(".value").innerHTML = currentWine.year
  countryWine.querySelector(".value").innerHTML = currentWine.country
  regionWine.querySelector(".value").innerHTML = currentWine.region
  capacityWine.querySelector(".value").innerHTML = currentWine.capacity
  colorWine.querySelector(".value").innerHTML = currentWine.color
  priceWine.querySelector(".value").innerHTML = currentWine.price
  description.querySelector(".value").innerHTML = currentWine.description
  likeButton.setAttribute("data-id", currentWine.id)
  showWinesCom(currentWine.id);
  fetchNbLikes(currentWine.id);
  updateLike(currentWine.id);


}

// FUNCTION TO UPDATE LIKE STATUS
async function updateLike(wineId) {
  if (!localStorage.getItem("userid")) return;
  const result = await request(`users/${localStorage.getItem('userid')}/likes/wines`)
  const isLiked = result.some(r => r.id === wineId)
  likeButton.children[0].classList.toggle("fas", !isLiked)
  likeButton.children[0].classList.toggle("far", isLiked)
  likeButton.setAttribute('data-liked', isLiked)


}
// Search
searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  showWinesList();
});

// FUNCTION TO POPULATE FILTER FORMS
async function populateFilter() {
  await fetchWines("wines")
  const year = [...new Set(wine.map(w => w.year))].sort((a, b) => a - b)
  selectYear.innerHTML = year.map(y => (

    `
  <option value="${y}">
  ${y}
   </option>
  `
  )).join('')

  const country = [...new Set(wine.map(w => w.country))].sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
  selectCountry.innerHTML = country.map(c => (

    `
  <option value="${c}">
  ${c}
   </option>
  `
  )).join('')
}


populateFilter();

// button filter onclick
btnFilter.addEventListener('click', () => {
  wine = wine.filter(w => w.year === selectYear.value)
  wine = wine.filter(w => w.country === selectCountry.value)
  showWinesList(false)

});

// button clear the filter onclick
clearFilter.addEventListener('click', (e) => {
  showWinesList()

});


// Function to show wine comments
const showWinesCom = async (id) => {
  const coms = await request(`wines/${id}/comments`);
  const userId = localStorage.getItem('userid')
  comments.innerHTML = (

    coms.
      map(wines => (

        `
      <li class="comments">
      ${wines.content}${userId === wines.user_id ? `
      <button class="btn btn-secondary" data-wineid="${id}" data-id="${wines.id}" onclick="editComment(event)"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger" data-wineid="${id}" data-id="${wines.id}" onclick="deleteComment(event)">
      <i class="fas fa-trash"></i></button>` : ""}
       </li>
      `
      )).join('')

  );

};



// Fetch the number of like for each wine clicked

const fetchNbLikes = async (id) => {
  const likes = await request(`wines/${id}/likes-count`)
  if (likes.total <= 1) {
    $("#nbLike").text(" " + likes.total + " Like");
  } else {
    $("#nbLike").text(" " + likes.total + " Likes");
  }

}

// Add a onlick function to the like button

likeButton.addEventListener('click', async () => {


  const wineId = likeButton.dataset.id;	//Try with other id value
  const apiURL = 'https://cruth.phpnet.org/epfc/caviste/public/index.php/api';
  const options = {
    'method': 'PUT',
    'body': JSON.stringify({ "like": !JSON.parse(likeButton.dataset.liked) }),	//Try with true or false
    'mode': 'cors',
    'headers': {
      'content-type': 'application/json; charset=utf-8',
      'Authorization': 'Basic ' + localStorage.getItem('authString')	//Try with other credentials (login:password)
    }
  };

  const fetchURL = '/wines/' + wineId + '/like';

  const response = await fetch(apiURL + fetchURL, options)
  if (response.ok) {
    updateLike(wineId);
    fetchNbLikes(wineId);
  }
});

// Function to create comments 

createComment.addEventListener('click', async () => {
  const wineId = likeButton.dataset.id
  await request(`wines/${wineId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content: newComment.value }),
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'Authorization': 'Basic ' + localStorage.getItem('authString')
    }
  })
  showWinesCom(wineId);

})

//Function to delete comments

async function deleteComment(e) {
  const btn = e.target.closest(".btn")
  await request(`wines/${btn.dataset.wineid}/comments/${btn.dataset.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Basic ' + localStorage.getItem('authString')
    }
  })
  showWinesCom(btn.dataset.wineid);
}

// Function to edit comments

async function editComment(e) {
  const btn = e.target.closest(".btn")
  const text = prompt("Type your new comment")
  if (text === null || text === "") return
  await request(`wines/${btn.dataset.wineid}/comments/${btn.dataset.id}`, {
    method: 'PUT',
    body: JSON.stringify({ content: text }),
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'Authorization': 'Basic ' + localStorage.getItem('authString')
    }
  })
  showWinesCom(btn.dataset.wineid);
}

// Log in
// function

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const username = loginForm.login.value;
  const password = loginForm.pwd.value;
  let authString = btoa(username + ':' + password);


  const apiURL = 'http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users/authenticate';
  const options = {
    'method': 'GET',
    'headers': {
      'content-type': 'application/json; charset=utf-8',
      'Authorization': 'Basic ' + (authString)
    }
  }
  fetch(apiURL, options).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        if (data.success) {
          localStorage.setItem('authString', (authString));
          localStorage.setItem('userid', data.id);
          location.reload();
        }
      })
    }
    else {
      loginErrorMsg.style.opacity = 1;
    }
  })
})

// Function to check if the user is logged 
async function checkLogged() {
  const storageString = localStorage.getItem('authString')
  if (!storageString) return
  const result = await fetch('http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users')
  const users = await result.json()
  for (const user of users) {
    const authString = btoa(user.login + ':' + 123)
    if (storageString === authString) {
      closeLogin.classList.add('d-none')
      newComment.classList.remove('d-none')
      createComment.classList.remove('d-none')
      return
    }
  }
};
checkLogged();


disconnect.addEventListener('click', (e) => {
  localStorage.clear()
  location.reload();
});
// TO DO  : SHOW DISCONNECT BUTTON AFTER LOGIN + LOGOUT

