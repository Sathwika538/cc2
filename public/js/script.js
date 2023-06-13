function saveProfile() {
    // Get form input values
    var picture = document.getElementById("picture").value;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var id = document.getElementById("id").value;
    var age = document.getElementById("age").value;
    var address = document.getElementById("address").value;
  
    // Save values to local storage
    localStorage.setItem("picture", picture);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("id", id);
    localStorage.setItem("age", age);
    localStorage.setItem("address", address);
  
    // Redirect to profile page
    window.location.href = "profile.ejs";
  }