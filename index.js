const express = require("express");
const app = express();

const db = require("./db");

const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const csrf = require("csurf");

// db.createAllTables();

app.use(express.static("./public"));
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Register

app.get("/register", (req, res) => {
  res.render("register", { layout: "main" });
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;

  db.createUser(firstname, lastname, email, password, confirmPassword)
    .then(results => {
      if (results) {
        res.cookie("user", results.rows[0].id);
        res.redirect("profile");
      }
      else
        res.render("register", {
          error: "please put your password"
        });
    })
    .catch(console.log(err => console.log("errr", err)));
});

// logout
app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect("login");
});

//login
app.get("/login", (req, res) => {
  res.render("login", { layout: "main" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.loginUser(email, password)
    .then(results => {
      // results is a sql object
      // it have rows inside that are the real results of the sql
      // if we have more than 0 rows, the user is logged because we found good password
      if (results.rows.length > 0) {
        //console.log(results)
        res.cookie("user", results.rows[0].id);
        res.redirect("thanks");
      } else {
        res.render("login", {
          layout: "main",
          error: "Something went rong TRY AGAIN!!!"
        });
      }
    })
    .catch(console.log(err => console.log("errr", err)));
});

// app.use((req, res, next) => {
//     res.setHeader("X-Frame-Options", "DENY");
//     next();
// });

//cookies
// app.use(
//     cookieSession({
//         name: "session",
//         secret: process.env.secret || "daflkjadkfhe43479476245-204958967rgdsrt",
//         maxAge: 1000 * 60 * 60 * 24 * 14
//     })
// );

// app.use(csrf());
// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken();
//     //check if user is logged in
//     if (req.session.user) {
//         res.locals.user = true;
//     }
//     if (req.session.signatureId) {
//         res.locals.signed = true;
//     }
//     next();
// });

// delete account

app.get("/delete_account", (req, res) => {
    const signatureData = req.body.signature;
    if (!req.cookies.user) {
      return res.render("profile", {
        error: "You are not Log In"
      });
    }
    const userId = parseInt(req.cookies.user);
  
    db.deleteUser(userId)
      .then(results => {
        res.clearCookie("user");
        res.redirect("register");
      })
      .catch(err => console.log(err));
  });

//making the petition

app.get("/petition", (req, res) => {
  res.render("petition", {
    layout: "main"
  });
});

//details of client. //this needs to be fixed! its not any more details
app.post("/petition", (req, res) => {
  const signatureData = req.body.signature;
  if (!req.cookies.user) {
    return res.render("profile", {
      error: "You are not Log In"
    });
  }
  const userId = parseInt(req.cookies.user);

  db.addSignature(userId, signatureData)
    .then(results => {
      if (results) res.redirect("thanks");
      else res.render("petition", { error: "Please INSERT your signature" });
    })
    .catch(err => console.log(err));
});

//thank you message //i need to put here edit your profile
app.get("/thanks", (req, res) => {
  res.render("thanks", { layout: "main" });
});

//making the sign//list

app.get("/signers", (req, res) => {
  db.listSigners()
    .then(results => {
      res.render("signers", {
        results: results,
        listSigners: results.rows,
        layout: "main"
      });
      // res.render("signers", { list: results.rows });
    })
    .catch(err => console.log("i have an error", err));
});

// app.get("/signatures", (req, res) => {
//     const { user_id, signatures } = req.body;
//     db.getSignatures(user_id, signatures)
//         .then(results => {
//             res.render("signatures", {
//                 layout: "main",
//                 listNames: results.rows
//             });
//             console.log(results.rows);
//         })
//         .catch(error => {
//             console.log("error:", error);
//         });
// });

//profile
app.get("/profile", (req, res) => {
  res.render("profile", { layout: "main" });
});

//i need to fix here the cookies
app.post("/profile", (req, res) => {
  //
  if (!req.cookies.user) {
    return res.render("profile", {
      error: "You are not Log In"
    });
  }
  const userId = parseInt(req.cookies.user);

  const { age, city, favoriteActor } = req.body;
  db.addUserProfile(userId, age, city, favoriteActor)
    .then(results => {
      if (results) {
        res.redirect("petition");
      } else
        res.render("profile", {
          error: "Please insert your personal infos"
        });
    })
    .catch(err => console.log(err));
});

//editprofile
app.get("/edit", (req, res) => {
  res.render("edit", { layout: "main" });
});

app.post("/edit", (req, res) => {
  //
  if (!req.cookies.user) {
    return res.render("profile", {
      error: "You are not Log In"
    });
  }
  const userId = parseInt(req.cookies.user);

  const { firstname, lastname, email, password } = req.body;
  db.updateUserDetails(userId, firstname, lastname, email, password)
    .then(results => {
      if (results) {
        res.render("edit", { layout: "main", message: "your profile updated" });
      } else
        res.render("edit", {
          error: "something went rong"
        });
    })
    .catch(err => console.log(err));
});

console.log('DOES HEROKU GIVE ME A FUCKING PORT ?', process.env.PORT);
app.listen(process.env.PORT || 8080, () => console.log("Petition listening!"));
