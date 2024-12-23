/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type ProductFieldsFragment = (
  Pick<StorefrontTypes.Product, 'id' | 'title' | 'tags' | 'createdAt'>
  & { variants: { edges: Array<{ node: (
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'currentlyNotInStock'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
      ) }> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, options: Array<(
    Pick<StorefrontTypes.ProductOption, 'name' | 'id'>
    & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name' | 'id'>> }
  )> }
);

export type GetAllProductsQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetAllProductsQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'tags' | 'createdAt'>
        & { variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'currentlyNotInStock'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, options: Array<(
          Pick<StorefrontTypes.ProductOption, 'name' | 'id'>
          & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name' | 'id'>> }
        )> }
      ) }> } };

interface GeneratedQueryTypes {
  "#graphql\n    query getAllProducts {\n        products(first: 100) {\n            edges {\n                node {\n                    ...ProductFields\n                }\n            }\n        }\n    }\n    #graphql\nfragment ProductFields on Product {\n    id\n    title\n    variants(first: 100, sortKey: POSITION) {\n        edges {\n            node {\n                id\n                title\n                availableForSale\n                quantityAvailable\n                price {\n                    amount\n                    currencyCode\n                }\n                image {\n                    url\n                    altText\n                }\n                currentlyNotInStock\n                selectedOptions {\n                    name\n                    value\n                }\n            }\n        }\n    }\n    featuredImage {\n        url\n        altText\n    }\n    options(first: 100) {\n        optionValues {\n            name\n            id\n        }\n        name\n        id\n    }\n}\n\n": {return: GetAllProductsQuery, variables: GetAllProductsQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
