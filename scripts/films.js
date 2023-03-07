let searchBtn = document.getElementById("searchBtn");
let searchBar = document.getElementById("searchBar");

function search() {
    let searchTerm = searchBar.value;
    
    if (searchTerm !== "") {
        window.location.href = "/films?search=" + searchTerm;
    }
}

searchBtn.addEventListener("click", search);
searchBar.addEventListener("search", search);

