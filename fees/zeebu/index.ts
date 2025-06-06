import { request, } from "graphql-request";
import { Adapter, FetchOptions } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

// Define target contracts and chains
const CONTRACTS = {
  [CHAIN.BASE]: ["0x330EDca5D02c454725db9c1384963f82b9fC8e47"],
  [CHAIN.BSC]: [
    "0x109722F4c9C9CB5059c116C6c83fe38CB710CBfB",
    "0xEEaf4Dc07ef08B7470B0e829Ed0a8d111737715B",
    "0x09d647A0BAFec8421DEC196A5cEe207fc7a6b85A",
    "0x9a47F91A6541812F88A026bdA2d372E22Ba4d7f7",
  ],
  [CHAIN.ETHEREUM]: ["0xE843115fF0Dc2b20f5b07b6E7Ba5fED064468AC6"],
};

const endpoints = {
  [CHAIN.BSC]: 'https://api.studio.thegraph.com/query/89152/fees_reward/version/latest',
  [CHAIN.BASE]: 'https://api.studio.thegraph.com/query/89152/fees_reward_base/version/latest',
}

async function fetch(_: any, _1: any, { startOfDay, chain }: FetchOptions) {

  const dayID = (Math.floor(startOfDay / 86400)).toString(); // Ensure this aligns with your subgraph's dayID logic

  const graphQuery = `
        query ($dayID: String!) {
          dayVolumeFeesAggregates(
            orderBy: dayID
            orderDirection: desc
            where: { dayID: $dayID }
          ) {
            contract
            dailyFees
            dailyVolume
            dayID
          }
        }
      `;

  // Fetch daily fees
  const graphRes = await request(endpoints[chain], graphQuery, { dayID });
  const aggregates = graphRes.dayVolumeFeesAggregates;

  // Aggregate daily fees and daily volume
  const dailyFees = aggregates.reduce((sum: any, agg: any) => sum + ((agg as any).dailyFees / 1e18), 0);
  const dailyUserFees = dailyFees;
  const dailyRevenue = dailyFees;
  const dailyHoldersRevenue = dailyFees * 0.6 / 100;

  return { dailyFees, dailyUserFees, dailyRevenue, dailyHoldersRevenue, };

};

export default {
  adapter: {
    // Define for each chain
    [CHAIN.BASE]: {
      fetch,
      start: 1728518400,
      meta: {
        methodology: {
          Fees: "2% collectively paid by merchant and customer",
          UserFees: "Daily fees",
          Revenue: "Invoice fees",
          HoldersRevenue: "Staking rewards earned by veZBU holders, 0.6% of collected fees "
        }
      }
    },
    [CHAIN.BSC]: {
      fetch,
      start: 1688083200,
      meta: {
        methodology: {
          Fees: "2% collectively paid by merchant and customer",
          Revenue: "Invoice fees",
          HoldersRevenue: "Staking rewards earned by veZBU holders, 0.6% of collected fees "
        }
      }
    },
  },
} as Adapter;
