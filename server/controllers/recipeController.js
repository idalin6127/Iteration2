require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ category: "Thai" }).limit(limitNumber);
    const american = await Recipe.find({ category: "American" }).limit(
      limitNumber
    );
    const chinese = await Recipe.find({ category: "Chinese" }).limit(
      limitNumber
    );

    const food = { latest, thai, american, chinese };

    res.render("index", {
      title: "Yummy Recipes - Home",
      categories,
      food,
      displayName: req.user ? req.user.displayName : "",
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render("categories", {
      title: "Yummy Recipes - Categoreis",
      categories,
      displayName: req.user ? req.user.displayName : "",
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ category: categoryId }).limit(
      limitNumber
    );
    res.render("categories", {
      title: "Yummy Recipes - Categoreis",
      categoryById,
      displayName: req.user ? req.user.displayName : "",
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /recipe/:id
 * Recipe
 */
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render("recipe", {
      title: "Yummy Recipes - Recipe",
      recipe,
      displayName: req.user ? req.user.displayName : "",
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * POST /search
 * Search
 */
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render("search", { title: "Yummy Recipes - Search", recipe });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /explore-latest
 * Explplore Latest
 */
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render("explore-latest", {
      title: "Yummy Recipes - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /explore-random
 * Explore Random as JSON
 */
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render("explore-random", {
      title: "Yummy Recipes - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /submit-recipe
 * Submit Recipe
 */
exports.submitRecipe = async (req, res) => {
  const infoErrorsObj = req.flash("infoErrors");
  const infoSubmitObj = req.flash("infoSubmit");
  res.render("submit-recipe", {
    title: "Yummy Recipes - Submit Recipe",
    infoErrorsObj,
    infoSubmitObj,
    displayName: req.user ? req.user.displayName : "",
  });
};

exports.aboutus = async (req, res) => {
  res.render("aboutus", {
    title: "Yummy Recipes - About Us",
    displayName: req.user ? req.user.displayName : "",
  });
};

exports.contact = async (req, res) => {
  res.render("contact", {
    title: "Yummy Recipes - Contact Us",
    displayName: req.user ? req.user.displayName : "",
  });
};

exports.contactOnPost = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Replace this with your preferred way of handling the user's message
  // For demonstration purposes, we will just log the message to the console
  console.log(`New message from ${name} (${email}):
    Subject: ${subject}
    Message: ${message}`);

  // Show an alert to the user that the message has been received
  // You can use the alert() function if the form is submitted via AJAX, or use a JavaScript alert library like SweetAlert
  // For demonstration, we'll use the alert() function here
  res.send(
    '<script>alert("Your message has been received. We will get back to you shortly."); window.location.href = "/";</script>'
  );
};

/**
 * POST /submit-recipe
 * Submit Recipe
 */
exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No Files where uploaded.");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    // res.json(error);
    req.flash("infoErrors", error);
    res.redirect("/submit-recipe");
  }
};

// Route for deleting a recipe
exports.DeleteRecipeOnPost = async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Retrieve the recipe details from the database based on the recipeId
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      // Handle the error, e.g., render an error page
      return res.render("error", { message: "Recipe not found" });
    }

    // Delete the recipe from the database
    await recipe.remove();

    // Redirect to a confirmation page or another appropriate page
    return res.redirect("/");
  } catch (err) {
    // Handle the error, e.g., render an error page
    return res.render("error", { message: "Error deleting the recipe" });
  }
};

exports.EditRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    const infoErrorsObj = req.flash("infoErrors");
    const infoSubmitObj = req.flash("infoSubmit");
    res.render("edit", {
      title: "Yummy Recipes - Edit Recipe",
      infoErrorsObj,
      infoSubmitObj,
      recipe,
      displayName: req.user ? req.user.displayName : "",
    });
  } catch (error) {
    return res.redirect("/");
  }
};

exports.EditRecipeOnPost = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .send({ message: "Data to update cannot be empty" });
    }

    const id = req.params.id;

    // added code

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (req.files && req.files.image) {
      // If a new image is uploaded, handle the image update
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });

      // Update the image field in the recipe
      req.body.image = newImageName;
    }

    // added code

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
    });

    if (!updatedRecipe) {
      return res.status(404).send({
        message: `Cannot update recipe with id ${id}. Maybe the recipe was not found.`,
      });
    }

    res.redirect(`/recipe/${id}`);
    // Redirect to the recipes page or any other appropriate page
  } catch (err) {
    res.status(500).send({ message: "Error updating recipe information" });
  }
};

// async function insertDummyCategoryData() {
//   try {
//     const dummyCategories = [
//       {
//         name: "Thai",
//         image: "thai-food.jpg",
//       },
//       {
//         name: "American",
//         image: "american-food.jpg",
//       },
//       {
//         name: "Chinese",
//         image: "chinese-food.jpg",
//       },
//       {
//         name: "Mexican",
//         image: "mexican-food.jpg",
//       },
//       {
//         name: "Indian",
//         image: "indian-food.jpg",
//       },
//       {
//         name: "Spanish",
//         image: "spanish-food.jpg",
//       },
//     ];

//     await Category.insertMany(dummyCategories);

//     console.log("Dummy category data inserted successfully.");
//   } catch (error) {
//     console.log("Error inserting dummy category data:", error);
//   }
// }

// insertDummyCategoryData();

// async function insertDummyRecipeData() {
//   try {
//     await Recipe.insertMany([
//       {
//         name: "Butter Chicken",
//         description:
//           "Butter Chicken is a classic Indian chicken dish cooked in a creamy tomato-based sauce. The chicken is marinated in a flavorful blend of spices, yogurt, and lemon juice, then cooked in a rich and buttery gravy. It's a popular and delicious choice for Indian food lovers.",
//         email: "butterchicken@gmail.com",
//         ingredients: [
//           "500g boneless chicken, cut into pieces",
//           "1 cup plain yogurt",
//           "2 tablespoons butter",
//           "1 tablespoon vegetable oil",
//           "1 onion, finely chopped",
//           "2 cloves garlic, minced",
//           "1-inch ginger, grated",
//           "1 teaspoon cumin powder",
//           "1 teaspoon coriander powder",
//           "1 teaspoon turmeric powder",
//           "1 teaspoon garam masala",
//           "1 cup tomato puree",
//           "1/2 cup heavy cream",
//           "Salt to taste",
//           "Fresh coriander leaves for garnish",
//         ],
//         category: "Indian",
//         image: "i1-butter.jpeg",
//       },
//       {
//         name: "Rajma Chawal",
//         description:
//           "Rajma Chawal is a popular North Indian dish consisting of red kidney beans cooked in a thick tomato-based gravy, served with steamed basmati rice. It's a comforting and wholesome meal that is loved by people of all ages. The combination of tender kidney beans, aromatic spices, and fluffy rice makes it a delicious and satisfying option.",
//         email: "rajmachawal@gmail.com",
//         ingredients: [
//           "1 cup dried red kidney beans (rajma), soaked overnight",
//           "2 tablespoons ghee or oil",
//           "1 onion, finely chopped",
//           "2 tomatoes, pureed",
//           "2 teaspoons ginger-garlic paste",
//           "1 teaspoon cumin seeds",
//           "1 teaspoon turmeric powder",
//           "1 teaspoon red chili powder",
//           "1 teaspoon garam masala",
//           "Salt to taste",
//           "Fresh coriander leaves for garnish",
//           "2 cups cooked basmati rice",
//         ],
//         category: "Indian",
//         image: "i2-rajma.jpeg",
//       },
//     ]);
//   } catch (error) {
//     console.log("Error: " + error);
//   }
// }

// insertDummyRecipeData();
