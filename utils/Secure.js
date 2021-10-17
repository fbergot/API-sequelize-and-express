module.exports = class Secure {
    static emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // entre 6 et 10 caractères avec au moins un chiffre
    static passRegex = /^(?=.*\d).{6,10}$/;
    // 0-9 && a-z && A-Z 3-10 char
    static usernameRegex = /^[0-9a-zA-Z]{3,10}$/;
    static sanitarizRegex = /[&<>"'/]/gi;
    static map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "/": "&#x2F;"
            };

    static testPassword(password) {
        if (!this.passRegex.test(password)) {
            return false;
        } else {
            return true;
        }
    }

    static testEmail(email) {
        if (!this.emailRegex.test(email)) {
            return false;
        } else {
            return true;
        }
  }

    static testUsername(username) {
        if (!username.match(this.usernameRegex)) {
            return false;
        } else {
            return true;
        }
  }

    static sanitarize(string) {
        return string.replace(this.sanitarizRegex, (match) => this.map[match]);
  }
};