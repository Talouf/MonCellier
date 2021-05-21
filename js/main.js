const searchInput = document.getElementById('search');
const results = document.getElementById('results');
const sWine = document.getElementById('sWine');
const clickListWine = document.querySelector('.clickListWine')
const comments = document.getElementById('comments');
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

let searchTerm = '';
let wine;

/**
 * 
 * TO DO
 * 
 * LOGIN 
 * AJOUT COMMENTAIRE et LIKE après CONNEXION
 * AFFICHAGE DE VIN APRES SELECTION DANS LA LISTE
 * RENDRE LE TOUT DYNAMIQUE
 * CSS 
 */
// API REQUEST
const fetchWines = async (url) => {
  wine = await fetch(
    `http://cruth.phpnet.org/epfc/caviste/public/index.php/api/${url}`).then(res => res.json());
};

// Wine List
const showWinesList = async () => {
  await fetchWines('wines');

  results.innerHTML = (

    wine
      .filter(wines => wines.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(wines => (

        ` 
          <li class="wine-item clickListWine" data=${wine.id}>
            ${wines.name}
          </li>
        `
      )).join('')
  );
};
showWinesList();


// Search
searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  showWinesList();
});

// Show Wine Description 
const showWinesDescription = async () => {
  await showWinesList();

  sWine.innerHTML = (

    wine.map(wines => (

      `
          <li class="wine-ite">
           ${wines.id}
           </li>
           <img src="img/${wines.picture}" alt="">
          `
    )).join('')

  );

};
showWinesDescription();



const showWinesCom = async () => {
  await fetchWines('wines/9/comments');

  comments.innerHTML = (

    wine.
      map(wines => (

        `
      <li class="comments">
      ${wines.content}
       </li>
      `
      )).join('')

  );

};
showWinesCom();




const fetchNbLikes = async () => {
  await fetchWines(`wines/11/likes-count`)
  if (wine.total <= 1) {
    $("#nbLike").text(" " + wine.total + " Like");
  } else {
    $("#nbLike").text(" " + wine.total + " Likes");
  }

}
fetchNbLikes();

// Log in


// If auth -> show

const authUsers = async () => {


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
        'Authorization': 'Basic '+(authString)   
      }
    }
    fetch(apiURL, options).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
        if (data.success) {
          localStorage.setItem('authString',(authString));
          
          location.reload();
          console.log(data);
        } 
          })
      }
      else {
        loginErrorMsg.style.opacity = 1;
      }
    })
  })
}

authUsers();

