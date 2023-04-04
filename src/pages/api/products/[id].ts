import type { NextApiRequest, NextApiResponse } from "next";
import { printful } from "../../../lib/printful-client";

// Define the expected response data types
type Data = {
  id: string;
  price: number;
  url: string;
};

type Error = {
  errors: { key: string; message: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  // Extract the 'id' query parameter from the request object
  const { id } = req.query;

  try {
    // Make a request to the Printful API to get details for the variant with the specified ID
    const { result } = await printful.get(`store/variants/@${id}`);

    // Set the caching headers for the response
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

    // Respond with the variant data, including the ID, price, and URL
    res.status(200).json({
      id: id as string,
      price: result.retail_price,
      url: `/api/products/${id}`,
    });

  } catch ({ error }) {
    // Log any errors that occur during the request
    console.log(error);

    // If an error occurred, respond with a 404 error and the error message
    res.status(404).json({
      errors: [
        {
          key: error?.message,
          message: error?.message,
        },
      ],
    });
  }
}

/////////////////////////////////////////////////////////////////////////////
// import type { NextApiRequest, NextApiResponse } from "next";

// import { printful } from "../../../lib/printful-client";

// type Data = {
//   id: string;
//   price: number;
//   url: string;
// };

// type Error = {
//   errors: { key: string; message: string }[];
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data | Error>
// ) {
//   const { id } = req.query;

//   try {
//     const { result } = await printful.get(`store/variants/@${id}`);

//     res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

//     res.status(200).json({
//       id: id as string,
//       price: result.retail_price,
//       url: `/api/products/${id}`,
//     });
//   } catch ({ error }) {
//     console.log(error);
//     res.status(404).json({
//       errors: [
//         {
//           key: error?.message,
//           message: error?.message,
//         },
//       ],
//     });
//   }
// }
