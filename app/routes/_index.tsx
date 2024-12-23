import type { LinksFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Header from '~/components/header/Header';
import Cart from '~/components/cart/Cart';
import Footer from '~/components/footer/Footer';
import ProductCard from '~/components/productCard/ProductCard';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { typedjson } from 'remix-typedjson';

// GraphQL
import { getAllProducts } from '~/graphql/products';
import { GetAllProductsQuery, ProductFieldsFragment } from 'types/storefront.generated';

// Types

// Styles
import indexStyles from '~/styles/routes/index.css?url';

interface LoaderData {
  products: ProductFieldsFragment[];
}

export const loader = async () => {
  const client = createStorefrontApiClient({
    storeDomain: `${process.env.PUBLIC_STORE_DOMAIN}`,
    apiVersion: '2024-10',
    publicAccessToken: `${process.env.PUBLIC_STOREFRONT_API_TOKEN}`,
  });

  const { data, errors } = await client.request<GetAllProductsQuery>(getAllProducts);
  if (data && !errors) {
    return typedjson<LoaderData>({
      products: data.products.edges.map(({ node }) => node as ProductFieldsFragment),
    });
  }

  return json<LoaderData>({
    products: [],
  });
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: indexStyles }];
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <Cart />
      <main>
        <div className="page-title">
          <h1>This is a page title</h1>
        </div>
        <div className="product-list">
          {products?.map((product: ProductFieldsFragment) => {
            return <ProductCard key={product.id} product={product} />;
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
