import type { NextApiRequest, NextApiResponse } from "next";

import { printful } from "./printful-client";
import type { SnipcartShippingRate, PrintfulShippingItem } from "../types";

// Define the shape of the Snipcart request
interface SnipcartRequest extends NextApiRequest {
  body: {
    eventName: string;
    mode: string;
    createdOn: string;
    content: { [key: string]: any };
  };
}

// Define the shape of the data returned by the API
type Data = {
  /** An array of shipping rates. */
  rates: SnipcartShippingRate[];
};

// Define the shape of the error returned by the API
type Error = {
  errors: { key: string; message: string }[];
};

// Define the handler function
export default async function handler(
  req: SnipcartRequest,
  res: NextApiResponse<Data | Error>
) {

  // Destructure the eventName and content from the request body
  const { eventName, content } = req.body;

  // If the eventName is not "shippingrates.fetch", return a 200 status code and end the response
  if (eventName !== "shippingrates.fetch") return res.status(200).end();

  // If there are no items in the cart, return an error message
  if (content.items.length === 0)
    return res.status(200).json({
      errors: [
        {
          key: "no_items",
          message: "No items in cart to calculate shipping.",
        },
      ],
    });

  // Destructure the shipping address information from the content object
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

  // Create a recipient object from the shipping address information
  const recipient = {
    ...(shippingAddress1 && { address1: shippingAddress1 }),
    ...(shippingAddress2 && { address2: shippingAddress2 }),
    ...(shippingAddressCity && { city: shippingAddressCity }),
    ...(shippingAddressCountry && { country_code: shippingAddressCountry }),
    ...(shippingAddressProvince && { state_code: shippingAddressProvince }),
    ...(shippingAddressPostalCode && { zip: shippingAddressPostalCode }),
    ...(shippingAddressPhone && { phone: shippingAddressPhone }),
  };

  // Create an array of PrintfulShippingItem objects from the cart items
  const items: PrintfulShippingItem[] = cartItems.map(
    (item): PrintfulShippingItem => ({
      external_variant_id: item.id,
      quantity: item.quantity,
    })
  );

  try {

    // Call the Printful API to get shipping rates
    const { result } = await printful.post("shipping/rates", {
      recipient,
      items,
    });

    // Return the shipping rates
    res.status(200).json({
      rates: result.map((rate) => ({
        cost: rate.rate,
        description: rate.name,
        userDefinedId: rate.id,
        guaranteedDaysToDelivery: rate.maxDeliveryDays,
      })),
    });
  } catch ({ error }) {
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
