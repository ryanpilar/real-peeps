/*
  This code defines a custom hook called "useWishlistState". 
  It uses the useContext hook to access the WishlistStateContext, 
  which is a React context created elsewhere in the application.
  
  If the context is not found, it throws an error instructing the user 
  to use the "useWishlistState" hook within a WishlistProvider.

  Finally, it returns the WishlistStateContext, which represents the current state of the Wishlist feature.
*/

import { useContext } from "react";

import { WishlistStateContext } from "../context/wishlist";

const useWishlistState = () => {
  const context = useContext(WishlistStateContext);

  if (!context)
    throw new Error("useWishlistState must be used within a WishlistProvider");

  return context;
};

export default useWishlistState;
