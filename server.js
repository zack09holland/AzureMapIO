// ==============================================================================
// DEPENDENCIES
// Series of npm packages that we will use to give our server useful functionality
// ==============================================================================
require('dotenv').config();
var express = require('express'),
    path = require('path'),
    app = express();
const upload = require("express-fileupload");

// ==============================================================================
// EXPRESS CONFIGURATION
// This sets up the basic properties for our express server
// ==============================================================================

// // Tells node that we are creating an "express" server
// var app = express();

// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

// express.json and express.urlEncoded make it easy for our server to interpret data sent to it.
// The code below is pretty standard.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(upload());
// get an environment variable

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'app/public/')));

// HTTP POST
// upload image files to server
app.post("/upload", function(request, response) {
  var addedFiles = new Array();
  if(request.files) {
      var arr;
      if(Array.isArray(request.files.filesfld)) {
          arr = request.files.filesfld;
      }
      else {
          arr = new Array(1);
          arr[0] = request.files.filesfld;
      }
      for(var i = 0; i < arr.length; i++) {
          var file = arr[i];
          console.log(file)
          // if(file.mimetype.substring(0,5).toLowerCase() == "application/octec-stream") {
          //   addedFiles[i] = "/" + file.name;
          //     file.mv("app/public/data" + addedFiles[i], function (err) {
          //         if(err) {
          //             console.log(err);
          //         }
          //     });
          // }
          addedFiles[i] = "/" + file.name;
          console.log(addedFiles)
          MyFiles = addedFiles
          file.mv("app/public/data/File Uploads" + addedFiles[i], function (err) {
              if(err) {
                  console.log(err);
              }
          });
      }
  }
  // give the server a second to write the files
  setTimeout(function(){response.json(addedFiles);}, 1000);
});

// ================================================================================
// ROUTER
// The below points our server to a series of "route" files.
// These routes give our server a "map" of how to respond when users visit or request data from various URLs.
// ================================================================================

// require("./app/routing/apiRoutes")(app);
require("./app/routing/htmlRoutes")(app);

// ==============================================================================
// LISTENER
// The below code effectively "starts" our server
// ==============================================================================

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});