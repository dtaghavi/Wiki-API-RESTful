const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");

//Initialize express
const app = express();

//Set view engine to EJS
app.set("view engine", "ejs");

//Set up body parser to process requests
app.use(bodyParser.urlencoded({
  extended: true
}));

//Set up a public directory for static files: imgs / css
app.use(express.static("public"));

//Connect to local mongoDB server using mongoose
mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Define the Schema for your collection
const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

//Establish your Model by binding it with your schema
const Article = mongoose.model("Article", articleSchema);

//Below: examples of each of the RESTful  Architecture's required endpoint / routes
//       and what each is supposed to be limited to. All will be done using Wiki pedia type site.

app.route("/articles")
  //HTTP Verb = GET
  // When using GET on an endpoint such as articles it has to return ALL articles. For a specific
  // article you must use a more specific endpoint /articles/specificTitle
  .get(function(req, res) {
    Article.find(function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })
  //HTTP Verb = POST
  // When using a POST request, it will create only ONE article. RESTful dictates that the POST
  // request is to be made to the same more general endpoint /articles vs /articles/newTitle
  .post(function(req, res) {

    const article = new Article({
      title: req.body.title,
      content: req.body.content
    });
    //We use the call back with the .save() method of mongoose so that we can wait and see
    // wether the new Document has saved Successfully and once that is done we can send the
    // appropriate response.
    article.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })
  //HTTP Verb = DELETE
  // When using a DELETE request in a RESTful architecture to the more broad endpoint,
  // in this example /articles, it has to delete ALL articles stored vs deleting one article
  // which would be done to a more specific endpoint ie.. /articles/specificTitle
  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });
  });

//Each Verb with more SPECIFIC endpoints, in this Wiki example a SPECIFIC article.
app.route("/articles/:articleTitle")

  // HTTP Verb = GET
  // Following RESTful Architecture GET on /articles/specficTitle
  // should return only ONE specific article
  .get(function(req, res) {
    //PARAMS: condition ( what to search for ), callback
    Article.findOne({title: req.params.articleTitle}, function(err, articleFound) {
      if (!err) {
        res.send(articleFound)
      } else {
        res.send(err);
      }
    })
  })

  // HTTP Verb = PUT
  // Following RESTful Architecture PUT replaces ONE DOCUMENT. PUT is meant to REPLACE
  // an ENTIRE document not update 1 field. Meaning any fields left out or not provided, the new Document
  // will simply not contain those fields. EXAMPLE: if you provide only new content but no
  // title. Your PUT will delete the old and give you a new document with a content field but will no longer have a title.
  .put(function(req, res) {
    //PARAMS: condition ( what to search for ), update ( What to change ), callback
    Article.replaceOne(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      //MongoDB defaults overwrite: true, but because we are using Mongoose,
      //mongoose defaults to false to protect accidentaly overwriting data.
      function(err,result) {
        if (!err) {
          res.send("Successfully updated article.")
        }
    });
  })

  // HTTP Verb = PATCH
  // Following RESTful Architecture, PATCH can replace individual fields of a document without
  // overriding everything else in that specific document. For example: If you want to update the
  // content field in our article, if you you provide no title field it won't delete whatever is currently
  // saved it will simply update the document with what you've provided.
  .patch(function(req, res) {
    //PARAMS: condition ( what to search for ), update ( What to change ), callback
    Article.updateOne(
      {title: req.params.articleTitle},
      //req.body will change depending on whats submitted in the form of a JS object.
      // i.e... {title: "test", content: "test"} but will contain only what is provided.
      // {$set: {title: "test"}} or {$set: {title: "test", content: "test"}} etc..
      // it works by updating only the fields provided where the value is a JS object
      {$set: req.body},
      function(err) {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      });
  })

  // HTTP Verb = DELETE
  // Following RESTful Architecture, DELETE on /articles/specificTitle will delete a single document.
  // where as above DELETE made to /articles endpoint deletes the whole collection.
  .delete(function(req, res) {
    //PARAMS: condition (What document to search for), callback
    Article.deleteOne({title: req.params.articleTitle}, function(err) {
      if (!err) {
        res.send("Successfully deleted document.");
      } else {
        res.send(err);
      }
    });
  });


//Establishing which port your server will be listening to.
app.listen(3000, function(req, res) {
  console.log("Server is listening on port 3000.");
});
