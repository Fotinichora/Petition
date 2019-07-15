var spicedPg = require("spiced-pg");
var crypto = require('crypto');

var dbUrl = process.env.DATABASE_URL || "postgres:postgres:password@localhost:5432/wintergreen-petition";
var db = spicedPg(
    dbUrl
);

//
module.exports.createAllTables = function(){
  var user = db.query("CREATE TABLE petition_user(id serial, firstname text, lastname text, email text, password text);");
  user.then( () => { console.log('table user creation ok') }).catch((err) => console.log(err))
  var signature = db.query("CREATE TABLE signature(id serial, user_id int, signature text);");
  signature.then( () => { console.log('table signature creation ok') }).catch((err) => console.log(err))
  var profile = db.query("CREATE TABLE profile(id serial, user_id int, city text, age int, favorite_actor text);");
  profile.then( () => { console.log('table profile creation ok') }).catch((err) => console.log(err))
}

module.exports.createUser = function createUser(
    firstname,
    lastname,
    email,
    password,
    confirmPassword
) {
    var hashed = crypto.createHash('md5').update(password).digest("hex");
    return db.query(
        "INSERT INTO petition_user(firstname, lastname, email, password) VALUES($1,$2,$3,$4) returning id",
        [firstname, lastname, email, hashed]
    );
};
//login
module.exports.loginUser = function loginUser(email, password) {
    var hashed = crypto.createHash('md5').update(password).digest("hex");
    return db.query(
        "SELECT id,email,password FROM petition_user WHERE email = $1 AND password = $2 ",
        [email, hashed]
    );
};

//addDetailsofusers
module.exports.addSignature = function addDetails(
    user_id,
    signature
) {
    // return the promise
    return db.query(
        "INSERT INTO signature(user_id, signature) VALUES($1, $2)",
        [user_id, signature]
    );
};
//listofsigners
module.exports.listSigners = function listSigners() {
    // return the promise
    return db.query("SELECT firstname, lastname from petition_user ");
};

//signature
// module.exports.getSignatures = function getSignatures() {
//     return db.query(
//         "INSERT INTO signatures(user_id, signatures) VALUES($1,$2)"
//     );
// };
// module.exports.addSignatures = function addSignatures(user_id) {
//     return db.query("SELECT * FROM signatures WHERE id = $1", [user_id]);
// };

//profile
module.exports.addUserProfile = function addUserProfile(
    user_id,
    age,
    city,
    favoriteActor
) {
    return db.query(
        "INSERT INTO profile(user_id, age, city, favorite_actor) VALUES($1, $2, $3, $4)",
        [user_id, age, city, favoriteActor]
    );
};

module.exports.deleteUser = function deleteUser(
    user_id
) {
    const delete_profile = db.query(
        "DELETE FROM profile WHERE user_id = $1",
        [user_id]
    );
    const delete_user = db.query(
        "DELETE FROM petition_user WHERE id = $1",
        [user_id]
    );
    const delete_sig = db.query(
        "DELETE FROM signature WHERE user_id = $1",
        [user_id]
    );
    // I make a chain with all the promises
    return Promise.all([delete_profile, delete_user, delete_sig]);
};

// module.exports.addUserProfile = function addUserProfile(
//     firstname,
//     lastname,
//     user_id,
//     age,
//     city,
//     favoriteActor
// ) {
//     return db.query(
//         "SELECT firstname, lastname FROM petition_user AND  user_id, age, city, favoriteActor FROM addUserProfile"[
//             [firstname, lastname, user_id, age, city, favoriteActor]
//         ]
//     );
// };

//editprofile

module.exports.updateUserDetails = function updateUserDetails(
    user_id,
    firstname,
    lastname,
    email,
    password
) {
    return db
        .query(
            `UPDATE petition_user SET
                        firstname = $1,
                        lastname = $2,
                        email = $3,
                        password = $4
                        WHERE id = $5
                        RETURNING id`,
            [firstname, lastname, email, password, user_id]
        )
        .then(data => {
            return data.rows;
        })
        .catch(err => console.log(err));
};
// module.exports.updatePassowrd = function updatePassowrd(userid) {
//     return db.query(`UPDATE users SET password = $1 WHERE id=$2`, [userid]);
// };
