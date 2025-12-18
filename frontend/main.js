const flask_server = 'http://127.0.0.1:5000/';

fetch(flask_server)
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log("Success! Data from server:", data);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
