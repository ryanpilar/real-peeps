/**
 * This code exports an async function that creates a Printful order based on a Snipcart webhook content
 * An async function that takes a Snipcart webhook content as input
 */

import { printful } from "./printful-client";
import type { SnipcartWebhookContent, PrintfulShippingItem } from "../types";

const createOrder = async ({
  invoiceNumber,
  email,
  shippingAddress,
  items,
  shippingRateUserDefinedId,
}: SnipcartWebhookContent) => {

  // Create a recipient object from the shipping address and customer email
  const recipient = {
    ...(shippingAddress.name && { name: shippingAddress.name }),
    ...(shippingAddress.address1 && { address1: shippingAddress.address1 }),
    ...(shippingAddress.address2 && { address2: shippingAddress.address2 }),
    ...(shippingAddress.city && { city: shippingAddress.city }),
    ...(shippingAddress.country && { country_code: shippingAddress.country }),
    ...(shippingAddress.province && {
      state_code: shippingAddress.province,
    }),
    ...(shippingAddress.postalCode && { zip: shippingAddress.postalCode }),
    ...(shippingAddress.phone && { phone: shippingAddress.phone }),
    email,
  };

  // Create an array of PrintfulShippingItem objects from the cart items
  const printfulItems: PrintfulShippingItem[] = items.map(
    (item): PrintfulShippingItem => ({
      external_variant_id: item.id,
      quantity: item.quantity,
    })
  );

  // Call the Printful API to create an order with the provided data
  const { result } = await printful.post("orders", {
    external_id: invoiceNumber,
    recipient,
    items: printfulItems,
    shipping: shippingRateUserDefinedId,
  });

  return result;
};

export default createOrder;
