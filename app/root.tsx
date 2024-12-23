import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { json, LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { CartProvider, useCart } from '~/context/CartContext';
import { ShopifyClientProvider } from '~/context/ShopifyClient';

// Styles
import resetCss from 'reset-css/reset.css?url';
import globalCss from '~/styles/global.css?url';

export interface LoaderData {
  storeDomain: string;
  publicStorefrontToken: string;
}

export const loader: LoaderFunction = async () => {
  return json({
    storeDomain: process.env.PUBLIC_STORE_DOMAIN,
    publicStorefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
  });
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
    },
    {
      rel: 'stylesheet',
      href: resetCss,
    },
    {
      rel: 'stylesheet',
      href: globalCss,
    },
  ];
};

export const meta: MetaFunction = () => {
  return [{ title: 'Velocity Tech Test' }, { name: 'description', content: 'Based in Remix!' }];
};

export default function App() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <ShopifyClientProvider storeDomain={loaderData.storeDomain} publicStorefrontToken={loaderData.publicStorefrontToken}>
      <CartProvider>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
          </head>
          <body>
            <RootLayout />
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </CartProvider>
    </ShopifyClientProvider>
  );
}

function RootLayout() {
  return <Outlet />;
}
