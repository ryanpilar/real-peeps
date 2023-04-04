

import type { NextApiRequest, NextApiResponse } from "next";
import { printful } from "../../../lib/printful-client";
import type { SnipcartTaxItem, PrintfulShippingItem } from "../../../types";

// Define an interface for the incoming Snipcart request
interface SnipcartRequest extends NextApiRequest {
  body: {
    eventName: string;
    mode: string;
    createdOn: string;
    content: { [key: string]: any };
  };
}

// Define the expected response data structure
type Data = {

  /** An array of tax rates. */
  taxes: SnipcartTaxItem[];
};

// Define the error response data structure
type Error = {
  errors: { key: string; message: string }[];
};

// Define the main handler function for the Snipcart tax calculation webhook
export default async function handler(
  req: SnipcartRequest,
  res: NextApiResponse<Data | Error>
) {

  // Extract event name and content from the incoming request body
  const { eventName, content } = req.body;

  // If event is not 'taxes.calculate', return empty response
  if (eventName !== "taxes.calculate") return res.status(200).end();

  // If cart items are empty, return an error response
  if (content.items.length === 0)
    return res.status(200).json({
      errors: [
        {
          key: "no_items",
          message: "No items in cart to calculate taxes.",
        },
      ],
    });

  // Extract necessary fields from the request content
  const {
    items: cartItems,
    shippingAddress,
    shippingRateUserDefinedId,
  } = content;

  // If no shipping address is provided, return an error response
  if (!shippingAddress)
    return res.status(200).json({
      errors: [
        {
          key: "no_address",
          message: "No address to calculate taxes.",
        },
      ],
    });

  // Extract relevant fields from the shipping address
  const { address1, address2, city, country, province, postalCode, phone } =
    shippingAddress;

  // Create recipient object with necessary address fields
  const recipient = {
    ...(address1 && { address1 }),
    ...(address2 && { address2 }),
    ...(city && { city: city }),
    ...(country && { country_code: country }),
    ...(province && { state_code: province }),
    ...(postalCode && { zip: postalCode }),
    ...(phone && { phone }),
  };

  // Create shipping items array from cart items
  const items: PrintfulShippingItem[] = cartItems.map(
    (item): PrintfulShippingItem => ({
      external_variant_id: item.id,
      quantity: item.quantity,
    })
  );

  try {
    // Call the Printful API to estimate the shipping costs and taxes
    const { result } = await printful.post("orders/estimate-costs", {
      shipping: shippingRateUserDefinedId,
      recipient,
      items,
    });

    // Return the calculated VAT amount as a tax rate
    res.status(200).json({
      taxes: [
        {
          name: "VAT",
          amount: result.costs.vat,
          rate: 0,
        },
      ],
    });

  } catch ({ error }) {
    
    // Log any errors from the Printful API and return an error response
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


///////////////////////////////////////////////////////////////////////////////
// import type { NextApiRequest, NextApiResponse } from "next";

// import { printful } from "../../../lib/printful-client";
// import type { SnipcartTaxItem, PrintfulShippingItem } from "../../../types";

// interface SnipcartRequest extends NextApiRequest {
//   body: {
//     eventName: string;
//     mode: string;
//     createdOn: string;
//     content: { [key: string]: any };
//   };
// }

// type Data = {
//   /** An array of tax rates. */
//   taxes: SnipcartTaxItem[];
// };

// type Error = {
//   errors: { key: string; message: string }[];
// };

// export default async function handler(
//   req: SnipcartRequest,
//   res: NextApiResponse<Data | Error>
// ) {
//   const { eventName, content } = req.body;

//   if (eventName !== "taxes.calculate") return res.status(200).end();

//   if (content.items.length === 0)
//     return res.status(200).json({
//       errors: [
//         {
//           key: "no_items",
//           message: "No items in cart to calculate taxes.",
//         },
//       ],
//     });

//   const {
//     items: cartItems,
//     shippingAddress,
//     shippingRateUserDefinedId,
//   } = content;

//   if (!shippingAddress)
//     return res.status(200).json({
//       errors: [
//         {
//           key: "no_address",
//           message: "No address to calculate taxes.",
//         },
//       ],
//     });

//   const { address1, address2, city, country, province, postalCode, phone } =
//     shippingAddress;

//   const recipient = {
//     ...(address1 && { address1 }),
//     ...(address2 && { address2 }),
//     ...(city && { city: city }),
//     ...(country && { country_code: country }),
//     ...(province && { state_code: province }),
//     ...(postalCode && { zip: postalCode }),
//     ...(phone && { phone }),
//   };

//   const items: PrintfulShippingItem[] = cartItems.map(
//     (item): PrintfulShippingItem => ({
//       external_variant_id: item.id,
//       quantity: item.quantity,
//     })
//   );

//   try {
//     const { result } = await printful.post("orders/estimate-costs", {
//       shipping: shippingRateUserDefinedId,
//       recipient,
//       items,
//     });

//     res.status(200).json({
//       taxes: [
//         {
//           name: "VAT",
//           amount: result.costs.vat,
//           rate: 0,
//         },
//       ],
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
