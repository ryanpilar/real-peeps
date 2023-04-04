/*
    The useSnipcartCount hook initializes its state with an empty cart, and then sets up a reducer to 
    handle changes to the state. The reducer only handles one action type, "SET", which updates the 
    state with the payload of the action.

    The hook also subscribes to the Snipcart store using the useEffect hook, and updates the state 
    whenever the store changes. Finally, it returns the current state of the hook.

*/

import { useReducer, useEffect } from "react";

// Import a helper function from another file.
import { hasSnipcart } from "../lib/has-snipcart";

const initialState = {
  cart: {
    items: {
      count: 0,
      items: [],
    },
  },
};

// Define a reducer function to handle state changes.
const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      // If the action type is "SET", return a new state object with the action payload merged in.
      return {
        ...state,
        ...action.payload,
      };
    default:

      throw new Error(`No such action ${action.type}`);
  }
};

// Define the useSnipcartCount hook.
const useSnipcartCount = () => {

  // Use the useReducer hook to manage the state of the hook.
  const [state, dispatch] = useReducer(reducer, initialState);

  // Use the useEffect hook to subscribe to the Snipcart store and update the state when the cart changes.
  useEffect(() => {

    if (hasSnipcart()) {
      // Subscribe to the store and get the current count of items.
      const unsubscribe = window.Snipcart.store.subscribe(() => {
        const itemsCount = window.Snipcart.store.getState();

        // Dispatch a "SET" action to update the state with the new count.
        dispatch({ type: "SET", payload: itemsCount });
      });

      // Return a function to unsubscribe from the store.
      return unsubscribe;
    }
  }, []);

  // Return the current state of the hook.
  return state;
};


export default useSnipcartCount;


///////////////////////////////////////////////////////////////////////////////////
// import { useReducer, useEffect } from "react";

// import { hasSnipcart } from "../lib/has-snipcart";

// const initialState = {
//   cart: {
//     items: {
//       count: 0,
//       items: [],
//     },
//   },
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET":
//       return {
//         ...state,
//         ...action.payload,
//       };
//     default:
//       throw new Error(`No such action ${action.type}`);
//   }
// };

// const useSnipcartCount = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   useEffect(() => {
//     if (hasSnipcart()) {
//       const unsubscribe = window.Snipcart.store.subscribe(() => {
//         const itemsCount = window.Snipcart.store.getState();

//         dispatch({ type: "SET", payload: itemsCount });
//       });

//       return unsubscribe;
//     }
//   }, []);

//   return state;
// };

// export default useSnipcartCount;
