import { z } from "zod";

const testingSchema = z.object({
    ethNetwork: z.string(),
    ethContractAddress: z.string(),
    abi: z.string(),
    tronNetwork: z.string(),
    tronContractAddress: z.string(),
    params: z.union([z.string(), z.object()]),
    functionName: z.string(),
    numberOfTransactions: z.string(),
  });

export { testingSchema };