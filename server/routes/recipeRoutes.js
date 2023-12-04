const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const indexController = require("../controllers/index");

function requireAuth(req, res, next) {
  // check if the user is logged in
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
}

/**
 * App Routes
 */
router.get("/", recipeController.homepage);
router.get("/categories", recipeController.exploreCategories);
router.get("/recipe/:id", recipeController.exploreRecipe);
router.get("/categories/:id", recipeController.exploreCategoriesById);

router.post("/search", recipeController.searchRecipe);
router.get("/explore-latest", recipeController.exploreLatest);
router.get("/explore-random", recipeController.exploreRandom);
router.get("/aboutus", recipeController.aboutus);
router.get("/contact", recipeController.contact);
router.post("/contact", recipeController.contactOnPost);

router.get("/submit-recipe", requireAuth, recipeController.submitRecipe);
router.post("/submit-recipe", requireAuth, recipeController.submitRecipeOnPost);
router.post("/recipes/:id", requireAuth, recipeController.DeleteRecipeOnPost);
router.get("/recipes/:id/edit", requireAuth, recipeController.EditRecipe);
router.post(
  "/recipes/:id/edit",
  requireAuth,
  recipeController.EditRecipeOnPost
);

/* GET Route for displaying the Login page */
router.get("/login", indexController.displayLoginPage);

/* POST Route for processing the Login page */
router.post("/login", indexController.processLoginPage);

/* GET Route for displaying the Register page */
router.get("/register", indexController.displayRegisterPage);

/* POST Route for processing the Register page */
router.post("/register", indexController.processRegisterPage);

/* GET to perform UserLogout */
router.get("/logout", indexController.performLogout);

module.exports = router;
