
/**
      This is a webhook event handler for Snipcart events. It receives an HTTP POST request 
      from Snipcart containing information about an event, such as "order.completed" or "customauth:customer_updated".

      The code first checks the event name against a list of allowed events. If the event is not one of the allowed 
      events, it returns an error.

      Next, it verifies the request token (currently commented out), which is included in the HTTP headers. If the token 
      is not present, it returns an error.

      Then, the code switches on the event name and calls the appropriate event handler. If the event is "order.completed", 
      it calls the createOrder function with the event content. If the event is "customauth:customer_updated", it returns a 
      success message without performing any action. If the event is not recognized, it throws an error.

      Finally, the code returns a success message to Snipcart. If there was an error during event handling, it returns a 
      generic error message.
 */

import type { NextApiResponse } from "next";

import createOrder from "../../../lib/create-order";

import type { SnipcartRequest, SnipcartWebhookEvent } from "../../../types";

// A webhook event handler for Snipcart events
export default async function handler(
  req: SnipcartRequest, // The incoming request
  res: NextApiResponse // The response to send
) {
  const allowedEvents: SnipcartWebhookEvent[] = [
    "order.completed",
    "customauth:customer_updated",
  ];

  // Log the headers and token from the incoming request
  console.log(req.headers);
  const token = req.headers["x-snipcart-requesttoken"];
  console.log(token);

  // Extract the event name and content from the request body
  const { eventName, content } = req.body;

  // If the HTTP method is not POST, return an error
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  // If the event is not one of the allowed events, return an error
  if (!allowedEvents.includes(eventName))
    return res.status(400).json({ message: "This event is not permitted" });

  // Verify the request token (commented out for now)
  // if (!token) return res.status(401).json({ message: "Not Authorized" });
  // try {
  //   const verifyToken = await fetch(
  //     `https://app.snipcart.com/api/requestvalidation/${token}`
  //   );
  //   if (!verifyToken.ok)
  //     return res.status(401).json({ message: "Not Authorization" });
  // } catch (err) {
  //   console.log(err);
  //   return res
  //     .status(500)
  //     .json({ message: "Unable to verify Snipcart webhook token" });
  // }

  try {

    // Call the appropriate handler based on the event type
    switch (eventName) {

      case "order.completed":
        await createOrder(content);
        break;

      case "customauth:customer_updated":
        return res
          .status(200)
          .json({ message: "Customer updated - no action taken" });

      default:
        throw new Error("No such event handler exists");
    }

    // Return a success message
    res.status(200).json({ message: "Done" });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
}

///////////////////////////////////////////////////////////////////////////////////
// import type { NextApiResponse } from "next";

// import createOrder from "../../../lib/create-order";

// import type { SnipcartRequest, SnipcartWebhookEvent } from "../../../types";

// export default async function handler(
//   req: SnipcartRequest,
//   res: NextApiResponse
// ) {
//   const allowedEvents: SnipcartWebhookEvent[] = [
//     "order.completed",
//     "customauth:customer_updated",
//   ];

//   console.log(req.headers);
//   const token = req.headers["x-snipcart-requesttoken"];
//   console.log(token);

//   const { eventName, content } = req.body;

//   if (req.method !== "POST")
//     return res.status(405).json({ message: "Method not allowed" });

//   if (!allowedEvents.includes(eventName))
//     return res.status(400).json({ message: "This event is not permitted" });

//   // if (!token) return res.status(401).json({ message: "Not Authorized" });

//   // try {
//   //   const verifyToken = await fetch(
//   //     `https://app.snipcart.com/api/requestvalidation/${token}`
//   //   );

//   //   if (!verifyToken.ok)
//   //     return res.status(401).json({ message: "Not Authorization" });
//   // } catch (err) {
//   //   console.log(err);
//   //   return res
//   //     .status(500)
//   //     .json({ message: "Unable to verify Snipcart webhook token" });
//   // }

//   try {
//     switch (eventName) {
//       case "order.completed":
//         await createOrder(content);
//         break;
//       case "customauth:customer_updated":
//         return res
//           .status(200)
//           .json({ message: "Customer updated - no action taken" });
//       default:
//         throw new Error("No such event handler exists");
//     }

//     res.status(200).json({ message: "Done" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// }
