// const test = new Date(Date.now());
// const test1 = Date.UTC(2016, 1, 1);
// const bcrypt = require('bcrypt');
const secure = require("./utils/Secure");
// console.log(test);
// console.log(test1);

const string = "<script>test&</script>";

function encodeHTML(s) {
    // return s.replace(/&/g, "&amp;").replace(/</g, "&lsaquo;").replace(/"/g, "&quot;").replace(/>/g, "&rsaquo;");
  return encodeURIComponent(s);
}

console.log(encodeHTML(string));

const  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//verification de l'email
function test(email) {
    if (!emailRegex.test(email)) {
      return 'no'
    } else {
        return 'ok'
    }
}

console.log(secure.testPassword("floria5"));
console.log(secure.testEmail("florian.berg@gma.com"));
console.log(secure.testUsername("ss3"));
    // //verif motDePass
    // if (!PASSREGEX.test(password)) {
    //   return res.status(400).json({
    //     error:
    //       "Votre mot de pass doit contenir au moins un chiffre et avoir une longueur comprise entre 4 et 8 caractères de long.",
    //   });


    console.log(typeof 6);