import { gql } from '@apollo/client';

export const getWorkerpools = gql`
  query GetWorkerpools {
    workerpools {
      id
      owner {
        id
        balance
        frozen
      }
    }
  }
`;

export const getUsageByWorkerpool = gql`
  query usageByWorkerpool($timestamp: BigInt!) {
    workerpools {
      id
      usages(
        first: 1000
        orderBy: timestamp
        orderDirection: asc
        where: { timestamp_gt: $timestamp }
      ) {
        id
        workerpoolPrice
        timestamp
        tasks {
          id
          status
          timestamp
          events(orderBy: timestamp, orderDirection: asc) {
            id
            timestamp
          }
        }
      }
    }
  }
`;
