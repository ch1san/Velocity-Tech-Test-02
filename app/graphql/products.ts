const PRODUCT_FEEDS = `#graphql
fragment ProductFields on Product {
    id
    title
    createdAt
    variants(first: 100, sortKey: POSITION) {
        edges {
            node {
                id
                title
                availableForSale
                quantityAvailable
                price {
                    amount
                    currencyCode
                }
                image {
                    url
                    altText
                }
                currentlyNotInStock
                selectedOptions {
                    name
                    value
                }
            }
        }
    }
    featuredImage {
        url
        altText
    }
    options(first: 100) {
        optionValues {
            name
            id
        }
        name
        id
    }
    tags
}
`

export const getAllProducts = `#graphql
    query getAllProducts {
        products(first: 100) {
            edges {
                node {
                    ...ProductFields
                }
            }
        }
    }
    ${PRODUCT_FEEDS}
`;
