import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
const formSchema = z.object({
  ethNetwork: z.string(),
  ethContractAddress: z.string(),
  tronNetwork: z.string(),
  tronContractAddress: z.string(),
});

export function CardWithForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ethNetwork: "",
      ethContractAddress: "",
      tronNetwork: "",
      tronContractAddress: "",
    },
  });

  const onSubmit = async (data) => {
    const apiUrl = "http://localhost:5000/execute";
    const jsonData = {
      networks: {
        Ethereum: data.ethNetwork,
        Tron: data.tronNetwork,
      },
      contractAddresses: {
        ethereum: data.ethContractAddress,
        tron: data.tronContractAddress,
      },
      
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "val",
              type: "uint256",
            },
          ],
          name: "setval",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "x",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "setval",
      value: 2,
      numberOfTransactions: 2,
    };

    const res = await axios.post(apiUrl, jsonData);

    console.log(res.data);
  };

  return (
    <Card className="mx-5">
      <CardHeader>
        <CardTitle>Chaindevs Thesis Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex justify-between gap-5">
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Ethereum</CardTitle>
                <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="grid w-full items-center gap-4">
                    <FormField
                      control={form.control}
                      name="ethNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Network</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="https://eth-sepolia.g.alchemy.com/v2/j8pR71uR77igUWtSTwIBPBe2WBaQRxuV">
                                Sepolia
                              </SelectItem>
                              <SelectItem value="https://eth-holesky.g.alchemy.com/v2/j8pR71uR77igUWtSTwIBPBe2WBaQRxuV">
                                Holesky
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ethContractAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Etherum contact address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Tron</CardTitle>
                <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="grid w-full items-center gap-4">
                    <FormField
                      control={form.control}
                      name="tronNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Network</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="https://api.shasta.trongrid.io">
                                Shasta
                              </SelectItem>
                              <SelectItem value="https://nile.trongrid.io">
                                Nile
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tronContractAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tron contact address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between"></CardFooter>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline">Clear</Button>
            <Button type="submit">Proceed</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
