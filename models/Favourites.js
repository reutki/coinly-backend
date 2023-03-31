const mongoose = require("mongoose");

const FavoritesSchema = new mongoose.Schema(
  {
    userId: {
      type: Object,
    },
    favourites: {
      type: Array,
    },
  },
  { collection: "UserFavourites" }
);

const Favorite = mongoose.model("Favorite", FavoritesSchema);
module.exports = Favorite;
