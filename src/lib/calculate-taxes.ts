/**
 * This code calculates taxes using the Snipcart API and the Printful API.
 * It imports necessary dependencies and types, defines an interface to extend the NextApiRequest type,
 * and declares the shape of the response data and the error response.
 *
 * The main function of the code is the `calculateTaxes` async function that receives a request and a response object
 * and extracts necessary information from the request body such as cart items, shipping address, and shipping rate.
 * It then creates a recipient object and an array of `PrintfulShippingItem` objects and calls the Printful API
 * to estimate the shipping costs. Finally, the function returns an array of tax rates based on the estimated shipping costs.
 *
 */

import type { NextApiRequest, NextApiResponse } from "next";

import { printful } from "./printful-client";
import type { SnipcartTaxItem, PrintfulShippingItem } from "../types";

// Define an interface that extends the NextApiRequest type, with additional body properties
interface SnipcartRequest extends NextApiRequest {
  body: {
    eventName: string;
    mode: string;
    createdOn: string;
    content: { [key: string]: any };
  };
}

// Define the shape of the response data
type Data = {

  /** An array of tax rates. */
  taxes: SnipcartTaxItem[];
};

// Define the shape of the error response
type Error = {
  errors: { key: string; message: string }[];
};

const calculateTaxes = async (
  req: SnipcartRequest,
  res: NextApiResponse<Data | Error>
) => {
  const { content } = req.body;

  // If there are no items in the cart, return an error response
  if (content.items.length === 0)
    return res.status(200).json({
      errors: [
        {
          key: "no_items",
          message: "No items in cart to calculate taxes.",
        },
      ],
    });

  // Extract the cart items, shipping address, and shipping rate ID from the content
  const {
    items: cartItems,
    shippingAddress,
    shippingRateUserDefinedId,
  } = content;

  // If there is no shipping address, return an error response
  if (!shippingAddress)
    return res.status(200).json({
      errors: [
        {
          key: "no_address",
          message: "No address to calculate taxes.",
        },
      ],
    });

  // Extract the address fields from the shipping address
  const {
    address1,
    address2,
    city,
    country,
    province,
    postalCode,
    phone,
  } = shippingAddress;

  // Create a recipient object using the extracted address fields
  const recipient = {
    ...(address1 && { address1 }),
    ...(address2 && { address2 }),
    ...(city && { city: city }),
    ...(country && { country_code: country }),
    ...(province && { state_code: province }),
    ...(postalCode && { zip: postalCode }),
    ...(phone && { phone }),
  };

  // Create an array of PrintfulShippingItem objects from the cart items
  const items: PrintfulShippingItem[] = cartItems.map(
    (item): PrintfulShippingItem => ({
      external_variant_id: item.id,
      quantity: item.quantity,
    })
  );

  try {

    // Call the Printful API to estimate the shipping costs
    const { result } = await printful.post("orders/estimate-costs", {
      shipping: shippingRateUserDefinedId,
      recipient,
      items,
    });

    // Return a response with an array of tax rates (currently only VAT is supported)
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
};

export default calculateTaxes;
