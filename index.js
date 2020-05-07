const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require('csurf');

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.use(cookieParser());
app.use(express.urlencoded());

const csrfProtection = csrf({ cookie: true });


const checkErrors = (req, res, next) => {
  const { firstName, lastName, email, password, confirmedPassword } = req.body;
  const errorsArray = [];


  if (!firstName) {
    errorsArray.push('Please provide a first name.')
  }

  if (!lastName) {
    errorsArray.push('Please provide a last name.')
  }

  if (!email) {
    errorsArray.push('Please provide an email.')
  }

  if (!password) {
    errorsArray.push('Please provide a password.')
  }

  if (confirmedPassword !== password) {
    errorsArray.push('The provided values for the password and password confirmation fields did not match.')
  }
  req.errorArray = errorsArray;
  next();
}

const users = [
  {
    id: 1,
    firstName: "Jill",
    lastName: "Jack",
    email: "jill.jack@gmail.com"
  }
];

app.get("/", (req, res) => {
  res.render('index', { users })
});

app.get('/create', csrfProtection, (req, res) => {
  res.render('create-normal', {
    csrfToken: req.csrfToken(),
  })
});

app.post('/create', csrfProtection, checkErrors, (req, res) => {
  const errors = req.errorArray;

  const { firstName, lastName, email, password, confirmedPassword } = req.body;
  if (errors.length > 0) {
    const hasErrors = true;
    res.render("create-normal", { errors, firstName, lastName, email, csrfToken: req.csrfToken(), hasErrors });
  } else {
    const newUser = {
      id: users.length + 1,
      firstName,
      lastName,
      email
    }
    users.push(newUser);
    res.redirect('/');
  }

})

app.get('/create-interesting', csrfProtection, (req, res) => {
  res.render('create-interesting', { csrfToken: req.csrfToken() })
})

app.post('/create-interesting', csrfProtection, checkErrors, (req, res) => {
  const { firstName, lastName, email, age, favoriteBeatle, iceCream } = req.body;
  const errors = req.errorArray;
  if (!age) {
    errors.push('age is required')
  } else if (isNaN(age) || age > 120 || age < 0) {
    errors.push('age must be a valid age')
  }
  if (favoriteBeatle === 'Scooby-Doo') {
    errors.push("favoriteBeatle must be a real Beatle member")
  } else if (favoriteBeatle === '') {
    errors.push('favoriteBeatle is required')
  }

  if (errors.length > 0) {
    const hasErrors = true;
    res.render("create-interesting", { errors, firstName, lastName, email, csrfToken: req.csrfToken(), hasErrors, age, favoriteBeatle, iceCream });
  } else {
    const newUser = {
      id: users.length + 1,
      firstName,
      lastName,
      email,
      age,
      favoriteBeatle,
      iceCream
    }
    users.push(newUser);
    res.redirect('/');
  }

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;
