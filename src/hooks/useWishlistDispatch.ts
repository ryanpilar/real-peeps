/*
    The useWishlistDispatch hook uses the useContext hook to access the WishlistDispatchContext 
    from the WishlistProvider. It then returns the context, which provides access to the dispatch 
    function for updating the wishlist state.

    If the context is not available, it throws an error with a message asking to use the hook 
    within a WishlistProvider component.
*/

import { useContext } from "react";

import { WishlistDispatchContext } from "../context/wishlist";

const useWishlistDispatch = () => {
  const context = useContext(WishlistDispatchContext);

  if (!context)
    throw new Error(
      "useWishlistDispatch must be used within a WishlistProvider"
    );

  return context;
};

export default useWishlistDispatch;
