
/**
      The code defines a Next.js API route that handles a request from Snipcart's shipping rates webhook. 
      It extracts the necessary data from the request body, makes a request to Printful's shipping rates API, 
      and returns an array of shipping rates 
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { printful } from "../../../lib/printful-client";
import type { SnipcartShippingRate, PrintfulShippingItem } from "../../../types";

// Define a custom interface for the incoming request object
interface SnipcartRequest extends NextApiRequest {
  body: {
    eventName: string;
    mode: string;
    createdOn: string;
    content: { [key: string]: any };
  };
}

// Define types for the expected response
type Data = {
  rates: SnipcartShippingRate[]; // An array of shipping rates
};

type Error = {
  errors: { key: string; message: string }[]; // An array of errors, with a key and a message for each error
};

// Define the handler function
export default async function handler(
  req: SnipcartRequest,
  res: NextApiResponse<Data | Error>
) {
  const { eventName, content } = req.body;

  // If the event name is not "shippingrates.fetch", or if there are no cart items, return a 200 response and end the request
  if (eventName !== "shippingrates.fetch") return res.status(200).end();
  if (content.items.length === 0) return res.status(200).end();

  // Extract the relevant fields from the request body
  const {
    items: cartItems,
    shippingAddress1,
    shippingAddress2,
    shippingAddressCity,
    shippingAddressCountry,
    shippingAddressProvince,
    shippingAddressPostalCode,
    shippingAddressPhone,
  } = content;

  // Build an object with the recipient information, using optional chaining to handle missing fields
  const recipient = {
    ...(shippingAddress1 && { address1: shippingAddress1 }),
    ...(shippingAddress2 && { address2: shippingAddress2 }),
    ...(shippingAddressCity && { city: shippingAddressCity }),
    ...(shippingAddressCountry && { country_code: shippingAddressCountry }),
    ...(shippingAddressProvince && { state_code: shippingAddressProvince }),
    ...(shippingAddressPostalCode && { zip: shippingAddressPostalCode }),
    ...(shippingAddressPhone && { phone: shippingAddressPhone }),
  };

  // Build an array of shipping items, mapping the cart items to Printful's format
  const items: PrintfulShippingItem[] = cartItems.map(
    (item): PrintfulShippingItem => ({
      external_variant_id: item.id,
      quantity: item.quantity,
    })
  );

  try {
    // Make a request to Printful's shipping rates API
    const { result } = await printful.post("shipping/rates", {
      recipient,
      items,
    });

    // Return a 200 response with an array of shipping rates, mapped to Snipcart's format
    res.status(200).json({
      rates: result.map((rate) => ({
        cost: rate.rate,
        description: rate.name,
        userDefinedId: rate.id,
        guaranteedDaysToDelivery: rate.maxDeliveryDays,
      })),
    });
  } catch ({ error }) {
    // If there's an error, log it and return a 200 response with an array of errors
    console.log(error);
    res.status(200).json({
      errors: [
        {
          key: error?.reason,
          message: error?.message,
        },
      ],
    });
  }
}


//////////////////////////////////////////////////////////////////////////////
// import type { NextApiRequest, NextApiResponse } from "next";

// import { printful } from "../../../lib/printful-client";
// import type {
//   SnipcartShippingRate,
//   PrintfulShippingItem,
// } from "../../../types";

// interface SnipcartRequest extends NextApiRequest {
//   body: {
//     eventName: string;
//     mode: string;
//     createdOn: string;
//     content: { [key: string]: any };
//   };
// }

// type Data = {
//   /** An array of shipping rates. */
//   rates: SnipcartShippingRate[];
// };

// type Error = {
//   errors: { key: string; message: string }[];
// };

// export default async function handler(
//   req: SnipcartRequest,
//   res: NextApiResponse<Data | Error>
// ) {
//   const { eventName, content } = req.body;

//   if (eventName !== "shippingrates.fetch") return res.status(200).end();
//   if (content.items.length === 0) return res.status(200).end();

//   const {
//     items: cartItems,
//     shippingAddress1,
//     shippingAddress2,
//     shippingAddressCity,
//     shippingAddressCountry,
//     shippingAddressProvince,
//     shippingAddressPostalCode,
//     shippingAddressPhone,
//   } = content;

//   const recipient = {
//     ...(shippingAddress1 && { address1: shippingAddress1 }),
//     ...(shippingAddress2 && { address2: shippingAddress2 }),
//     ...(shippingAddressCity && { city: shippingAddressCity }),
//     ...(shippingAddressCountry && { country_code: shippingAddressCountry }),
//     ...(shippingAddressProvince && { state_code: shippingAddressProvince }),
//     ...(shippingAddressPostalCode && { zip: shippingAddressPostalCode }),
//     ...(shippingAddressPhone && { phone: shippingAddressPhone }),
//   };

//   const items: PrintfulShippingItem[] = cartItems.map(
//     (item): PrintfulShippingItem => ({
//       external_variant_id: item.id,
//       quantity: item.quantity,
//     })
//   );

//   try {
//     const { result } = await printful.post("shipping/rates", {
//       recipient,
//       items,
//     });

//     res.status(200).json({
//       rates: result.map((rate) => ({
//         cost: rate.rate,
//         description: rate.name,
//         userDefinedId: rate.id,
//         guaranteedDaysToDelivery: rate.maxDeliveryDays,
//       })),
//     });
//   } catch ({ error }) {
//     console.log(error);
//     res.status(200).json({
//       errors: [
//         {
//           key: error?.reason,
//           message: error?.message,
//         },
//       ],
//     });
//   }
// }
