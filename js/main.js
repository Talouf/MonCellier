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

let searchTerm = '';
let wine;
let filterWines = '';

/**
 * 
 * TO DO
 * 
 * 
 * AJOUT COMMENTAIRE et LIKE après CONNEXION
 * AFFICHAGE DE VIN APRES SELECTION DANS LA LISTE
 * RENDRE LE TOUT DYNAMIQUE
 * CSS 
 */
// API REQUEST
const fetchWines = async (url) => {
  wine = await request(url)
};

// Wine List
const showWinesList = async (loadwines = true) => {
  if (loadwines) await fetchWines('wines');

  results.innerHTML = (

    wine
      .filter(wines => wines.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(wines => (

        ` 
          <li class="wine-item clickListWine" onclick="UpdateWineList(event)" data-id="${wines.id}" data-grapes="${wines.grapes}" data-year="${wines.year}" >
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
  likeButton.setAttribute("data-id", currentWine.id)
  showWinesCom(currentWine.id);
  fetchNbLikes(currentWine.id);
  updateLike(currentWine.id);


}

async function updateLike(wineId) {
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


btnFilter.addEventListener('click', () => {
  wine = wine.filter(w => w.year === selectYear.value)
  wine = wine.filter(w => w.country === selectCountry.value)
  showWinesList(false)

});

clearFilter.addEventListener('click', (e) => {
  showWinesList()

});



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


async function request(url, params) {
  const result = await fetch(`http://cruth.phpnet.org/epfc/caviste/public/index.php/api/${url}`, params)
  return result.json();
}

const fetchNbLikes = async (id) => {
  const likes = await request(`wines/${id}/likes-count`)
  if (likes.total <= 1) {
    $("#nbLike").text(" " + likes.total + " Like");
  } else {
    $("#nbLike").text(" " + likes.total + " Likes");
  }

}
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


// If auth -> show


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
      //classlist remove (ou delete)
      return
    }
  }
};
checkLogged();

//localStorage.clear   pour deco

