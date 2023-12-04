const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
require("dotenv").config();

let passport = require("passport");
// let indexRouter = require("./server/controllers/index");

let passportJWT = require("passport-jwt");
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// let passportLocal = require("passport-local");
// let localStrategy = passportLocal.Strategy;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const port = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(expressLayouts);

let userModel = require("./server/models/user");
let User = userModel.User;

// implement a User Authentication Strategy
passport.use(User.createStrategy());

// serialize and deserialize the User info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SESSION_SECRET;

let strategy = new JWTStrategy(jwtOptions, (jwt_payload, done) => {
  User.findById(jwt_payload.id)
    .then((user) => {
      return done(null, user);
    })
    .catch((err) => {
      return done(err, false);
    });
});

passport.use(strategy);

app.use(cookieParser("YummyRecipesSecure"));

app.use(flash());
app.use(fileUpload());

app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

const routes = require("./server/routes/recipeRoutes.js");
app.use("/", routes);

app.listen(port, () => console.log(`Listening to port ${port}`));

/* 
SAMPLE DATA FOR DEMO

Paneer Tikka

Paneer Tikka is a popular Indian appetizer made with marinated and grilled paneer (Indian cottage cheese) and vegetables. It is a delicious and flavorful dish that is loved by vegetarians and non-vegetarians alike. The marinated paneer and vegetables are usually skewered and grilled or cooked in a tandoor (clay oven), giving them a smoky and charred flavor.

250 grams paneer (Indian cottage cheese), cut into cubes
Assorted vegetables like bell peppers, onions, and tomatoes, cut into chunks
1 cup thick yogurt (hung curd or Greek yogurt)
1 tablespoon ginger-garlic paste
1 tablespoon lemon juice
1 teaspoon red chili powder
1 teaspoon cumin powder
1 teaspoon garam masala
1 teaspoon turmeric powder
1 tablespoon vegetable oil

*/
