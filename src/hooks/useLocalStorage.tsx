
import * as React from "react";

// Takes a key and an initial value as input parameters and returns an array containing
// the stored value and a function to set the stored value.
export default function useLocalStorage(
  key: string,
  initialValue: string
): [string, (value: Function | string) => void] {

  // Define a state variable storedValue using React.useState and set its initial value using a callback function.
  // The callback function tries to get the value from localStorage for the given key and if it exists, returns it,
  // otherwise returns the initialValue.
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item =
        typeof window !== "undefined" && window.localStorage.getItem(key);

      return item ? item : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Define a function setValue that takes a value as input parameter and sets the storedValue.
  const setValue = (value: Function | string) => {
    try {
      // If the input value is a function, call it with the current storedValue as input and store the result as
      // valueToStore. Otherwise, directly store the input value as valueToStore.
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Update the storedValue using setStoredValue function.
      setStoredValue(valueToStore);

      // Store the valueToStore in localStorage using the given key.
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.log(error);
    }
  };

  // Return the storedValue and the setValue function as an array.
  return [storedValue, setValue];
}



//////////////////////////////////////////////////////////////////////////////////
// import * as React from "react";

// export default function useLocalStorage(
//   key: string,
//   initialValue: string
// ): [string, (value: Function | string) => void] {
//   const [storedValue, setStoredValue] = React.useState(() => {
//     try {
//       const item =
//         typeof window !== "undefined" && window.localStorage.getItem(key);

//       return item ? item : initialValue;
//     } catch (error) {
//       return initialValue;
//     }
//   });

//   const setValue = (value: Function | string) => {
//     try {
//       const valueToStore =
//         value instanceof Function ? value(storedValue) : value;

//       setStoredValue(valueToStore);

//       window.localStorage.setItem(key, valueToStore);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return [storedValue, setValue];
// }
