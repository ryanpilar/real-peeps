import { useState } from "react";
import Image from "next/image";

import useWishlistDispatch from "../hooks/useWishlistDispatch";
import useWishlistState from "../hooks/useWishlistState";

import VariantPicker from "./VariantPicker";

const Product = (product) => {

  // gets the function to add an item to the wishlist
  const { addItem } = useWishlistDispatch();
  // gets the state to check if the item is already saved in the wishlist
  const { isSaved } = useWishlistState();


  const { id, name, variants } = product;
  // gets the first variant from the list
  const [firstVariant] = variants;
  // checks if there's only one variant
  const oneStyle = variants.length === 1;

  // sets the active variant to the first one
  const [activeVariantExternalId, setActiveVariantExternalId] = useState(
    firstVariant.external_id
  );

  // gets the active variant object based on the active variant external id
  const activeVariant = variants.find(
    (v) => v.external_id === activeVariantExternalId
  );

  // gets the active variant's file with type "preview"
  const activeVariantFile = activeVariant.files.find(
    ({ type }) => type === "preview"
  );

  // formats the price to show in the CA dollar currency
  const formattedPrice = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: activeVariant.currency,
  }).format(activeVariant.retail_price);

  // adds the product to the wishlist when the user clicks the wishlist button
  const addToWishlist = () => addItem(product);
  // checks if the product is already saved in the wishlist
  const onWishlist = isSaved(id);

  return (
    <article className="border border-gray-200 rounded bg-white flex flex-col relative">
      <button
        aria-label="Add to wishlist"
        className="appearance-none absolute top-0 right-0 mt-3 mr-3 text-gray-300 focus:text-gray-500 hover:text-red-500 transition focus:outline-none"
        onClick={addToWishlist}
      >
        {onWishlist ? (
          // displays a filled heart icon if the product is already saved in the wishlist
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current text-red-500"
          >
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
          </svg>
        ) : (
          // displays an empty heart icon if the product is not yet saved in the wishlist
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current"
          >
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
          </svg>
        )}
      </button>
      <div className="flex items-center justify-center flex-1 sm:flex-shrink-0 w-full p-6">
        {activeVariantFile && (
          <Image
            src={activeVariantFile.preview_url}
            width={250}
            height={250}
            alt={`${activeVariant.name} ${name}`}
            title={`${activeVariant.name} ${name}`}
          />
        )}
      </div>
      <div className="flex-1 p-6 pt-0">
        <div className="text-center">
          <p className="mb-1 font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{formattedPrice}</p>
        </div>
      </div>
      <div className="p-3 flex flex-col sm:flex-row justify-center items-center">
        <VariantPicker
          value={activeVariantExternalId}
          onChange={({ target: { value } }) =>
            setActiveVariantExternalId(value)
          }
          variants={variants}
          disabled={oneStyle}
        />
        <button
          className="snipcart-add-item w-full md:w-auto transition flex-shrink-0 py-2 px-4 border border-gray-300 hover:border-transparent shadow-sm text-sm font-medium bg-white text-gray-900 focus:text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:outline-none rounded"
          data-item-id={activeVariantExternalId}
          data-item-price={activeVariant.retail_price}
          data-item-url={`/api/products/${activeVariantExternalId}`}
          data-item-description={activeVariant.name}
          data-item-image={activeVariantFile.preview_url}
          data-item-name={name}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default Product;
