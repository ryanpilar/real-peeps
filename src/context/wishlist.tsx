/*
    This code exports a WishlistProvider component that creates a state using 
    useReducer hook to manage a wishlist. 
    
    The WishlistProvider component accepts children as props and wraps them with two context providers 
      - WishlistDispatchContext and WishlistStateContext. 
      
    The WishlistDispatchContext provides functions, addItem and removeItem, which can be used to add or 
    remove an item from the wishlist respectively. 
    
    isSaved is used to check if an item with a given id is present in the wishlist, while hasItems is 
    used to check if the wishlist is empty or not.

    The code also exports two contexts - WishlistStateContext and WishlistDispatchContext. 
    These contexts can be used to access the state and functions of the wishlist respectively.

    The useLocalStorage hook is used to persist the wishlist state in the browser's local storage. 

    The reducer function handles two action types - ADD_PRODUCT and REMOVE_PRODUCT. ADD_PRODUCT 
    adds an item to the wishlist if it doesn't already exist, while REMOVE_PRODUCT removes an item 
    from the wishlist.

    The reducer function and initial state are defined in the code, along with their types. 
    
    The code also defines two interfaces - InitialState and WishlistProviderState, which define the 
    structure of the initial state and the state returned by the WishlistProvider component 
    respectively.

    The useEffect hook is used to update the local storage whenever the state changes.
*/

// Import React, createContext, useReducer, and useEffect from the React library
import React, { createContext, useReducer, useEffect } from "react";

// Import the useLocalStorage hook and the PrintfulProduct type
import useLocalStorage from "../hooks/useLocalStorage";
import type { PrintfulProduct } from "../types";

// Define the InitialState and WishlistProviderState interfaces
interface InitialState {
  items: [];
}

interface WishlistProviderState extends InitialState {
  addItem: (item: PrintfulProduct) => void;
  removeItem: (id: PrintfulProduct["id"]) => void;
  isSaved: (id: PrintfulProduct["id"]) => boolean;
  hasItems: boolean;
}

// Define the ADD_PRODUCT and REMOVE_PRODUCT constants as string literals
const ADD_PRODUCT = "ADD_PRODUCT";
const REMOVE_PRODUCT = "REMOVE_PRODUCT";

// Define the Actions type as a union of two different action types
type Actions =
  | { type: typeof ADD_PRODUCT; payload: PrintfulProduct }
  | { type: typeof REMOVE_PRODUCT; payload: PrintfulProduct["id"] };

// Create a new context called WishlistStateContext and set its default value to null
export const WishlistStateContext = createContext(null);

// Create a new context called WishlistDispatchContext and set its default value to null
export const WishlistDispatchContext = createContext(null);

// Define the initialState as an object with an empty items array
const initialState: InitialState = {
  items: [],
};

// Define the reducer function, which takes in the current state and an action
const reducer = (state: WishlistProviderState, { type, payload }: Actions) => {
  switch (type) {
    case ADD_PRODUCT:
      return { ...state, items: [...state.items, payload] };
    case REMOVE_PRODUCT:
      return {
        ...state,
        items: state.items.filter((i: PrintfulProduct) => i.id !== payload),
      };
    default:
      throw new Error(`Invalid action: ${type}`);
  }
};

// Create a new component called WishlistProvider, which takes in a children prop
export const WishlistProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // Use the useLocalStorage hook to set and retrieve the savedWishlist value
  const [savedWishlist, saveWishlist] = useLocalStorage(
    "items-wishlist",
    JSON.stringify(initialState)
  );
  
  // Use the useReducer hook to set and retrieve the state and dispatch values
  const [state, dispatch] = useReducer(reducer, JSON.parse(savedWishlist));

  // Use the useEffect hook to save the wishlist to local storage
  useEffect(() => {
    saveWishlist(JSON.stringify(state));
  }, [state, saveWishlist]);

  // Define the addItem function, which adds an item to the wishlist
  const addItem = (item: PrintfulProduct) => {
    if (!item.id) return;

    const existing = state.items.find((i: PrintfulProduct) => i.id === item.id);

    if (existing) return dispatch({ type: REMOVE_PRODUCT, payload: item.id });

    dispatch({ type: ADD_PRODUCT, payload: item });
  };

  // Define the removeItem function, which removes an item from the wishlist
  const removeItem = (id: PrintfulProduct["id"]) => {
    if (!id) return;

    dispatch({ type: REMOVE_PRODUCT, payload: id });
  };

  // Define the isSaved function, which checks if an item is already saved to the wishlist
  const isSaved = (id: PrintfulProduct["id"]) =>
    state.items.some((i: PrintfulProduct) => i.id === id);

  const hasItems = state.items.length > 0;

  return (
    <WishlistDispatchContext.Provider value={{ addItem, removeItem }}>
      <WishlistStateContext.Provider value={{ ...state, isSaved, hasItems }}>
        {children}
      </WishlistStateContext.Provider>
    </WishlistDispatchContext.Provider>
  );
};


///////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { createContext, useReducer, useEffect } from "react";

// import useLocalStorage from "../hooks/useLocalStorage";

// import type { PrintfulProduct } from "../types";

// interface InitialState {
//   items: [];
// }

// interface WishlistProviderState extends InitialState {
//   addItem: (item: PrintfulProduct) => void;
//   removeItem: (id: PrintfulProduct["id"]) => void;
//   isSaved: (id: PrintfulProduct["id"]) => boolean;
//   hasItems: boolean;
// }

// const ADD_PRODUCT = "ADD_PRODUCT";
// const REMOVE_PRODUCT = "REMOVE_PRODUCT";

// type Actions =
//   | { type: typeof ADD_PRODUCT; payload: PrintfulProduct }
//   | { type: typeof REMOVE_PRODUCT; payload: PrintfulProduct["id"] };

// export const WishlistStateContext = createContext(null);
// export const WishlistDispatchContext = createContext(null);

// const initialState: InitialState = {
//   items: [],
// };

// const reducer = (state: WishlistProviderState, { type, payload }: Actions) => {
//   switch (type) {
//     case ADD_PRODUCT:
//       return { ...state, items: [...state.items, payload] };
//     case REMOVE_PRODUCT:
//       return {
//         ...state,
//         items: state.items.filter((i: PrintfulProduct) => i.id !== payload),
//       };
//     default:
//       throw new Error(`Invalid action: ${type}`);
//   }
// };

// export const WishlistProvider: React.FC<{ children?: React.ReactNode }> = ({
//   children,
// }) => {
//   const [savedWishlist, saveWishlist] = useLocalStorage(
//     "items-wishlist",
//     JSON.stringify(initialState)
//   );
//   const [state, dispatch] = useReducer(reducer, JSON.parse(savedWishlist));

//   useEffect(() => {
//     saveWishlist(JSON.stringify(state));
//   }, [state, saveWishlist]);

//   const addItem = (item: PrintfulProduct) => {
//     if (!item.id) return;

//     const existing = state.items.find((i: PrintfulProduct) => i.id === item.id);

//     if (existing) return dispatch({ type: REMOVE_PRODUCT, payload: item.id });

//     dispatch({ type: ADD_PRODUCT, payload: item });
//   };

//   const removeItem = (id: PrintfulProduct["id"]) => {
//     if (!id) return;

//     dispatch({ type: REMOVE_PRODUCT, payload: id });
//   };

//   const isSaved = (id: PrintfulProduct["id"]) =>
//     state.items.some((i: PrintfulProduct) => i.id === id);

//   const hasItems = state.items.length > 0;

//   return (
//     <WishlistDispatchContext.Provider value={{ addItem, removeItem }}>
//       <WishlistStateContext.Provider value={{ ...state, isSaved, hasItems }}>
//         {children}
//       </WishlistStateContext.Provider>
//     </WishlistDispatchContext.Provider>
//   );
// };
