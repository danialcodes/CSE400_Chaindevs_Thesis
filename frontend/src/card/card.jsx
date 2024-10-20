import { ModeToggle } from "@/components/mode-toggle";
import Result from "@/components/Result";
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
import { Textarea } from "@/components/ui/textarea";
import { testingSchema } from "@/schemas/schema";
import Typewriter from 'typewriter-effect';

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";


export function CardWithForm() {

  
  const [func, setfunc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // const deployedapiUrl = `${import.meta.env.VITE_DEPLOYED_SERVER_URL}/execute`;
  const localapiUrl = `${import.meta.env.VITE_LOCAL_SERVER_URL}/execute`;

  const form = useForm({
    resolver: zodResolver(testingSchema),
    defaultValues: {
      ethNetwork: "https://eth-holesky.g.alchemy.com/v2/j8pR71uR77igUWtSTwIBPBe2WBaQRxuV",
      ethContractAddress: "0xcAb90413BE11c645aEf0fDb9b781518Dad2ea3C4",
      tronNetwork: "https://api.shasta.trongrid.io",
      tronContractAddress: "TJQEXZPMNWJh9BFJ6T11AwTaELCASQRXjd",
      abi:"",
      functionName:"",
      params : "",
      numberOfTransactions: ""
    },
  });


  const onAbiChange = (e) => {

    try {
      const abi = JSON.parse(e.target.value);
      const func = abi.filter((data)=> {
        if(data.stateMutability==='nonpayable' || data.stateMutability==='payable'){
            return data
        }
      })
      

      setfunc(func);
    } catch (error) {
      toast.error("Invalid ABI");
    }
    
  };
  const onSubmit = async (data) => {
    setResult(null);
    setLoading(true);
    // console.log(data);
    try {
      const jsonData = {
        networks: {
          Ethereum: data.ethNetwork,
          Tron: data.tronNetwork,
        },
        contractAddresses: {
          ethereum: data.ethContractAddress,
          tron: data.tronContractAddress,
        },
  
        abi:  JSON.parse(data.abi),
        functionName: data.functionName,
        params: {
          value: JSON.parse(data.params),
        },
        numberOfTransactions: data.numberOfTransactions,
      };
  
  
      const res = await axios.post(localapiUrl, jsonData);
      toast.success(res.data.message);
      setLoading(false);
      setResult(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error.message);
      toast.error("Invalid Input Data");
    }

    

    
    
    
  };

  return (
   
      <Card className="mx-5">
        <CardHeader className="flex justify-between">
          <div className="flex justify-between">
            <div>
              <CardTitle>Chaindevs Thesis Project</CardTitle>
              <CardDescription>A Performance Evaluation Framework for Public
              Blockchain based Systems</CardDescription>
            </div>
            <ModeToggle/>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-5">
              <div className="flex justify-between gap-5">
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
                                required
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
                                  required
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
                                required
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
                                  required  
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
                  
                </Card>
              </div>
              <Card>
                <CardContent className="mt-2 flex flex-col gap-4">
                  <FormField
                            control={form.control}
                            name="abi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Identical Contract ABI</FormLabel>
                                <FormControl>
                                <Textarea
                                    required
                                    placeholder="Please paste your identical contract ABI"
                                    
                                    {...field}
                                    onChange={(e)=>{
                                      field.onChange(e);
                                      onAbiChange(e,field)}}
                                  />
                                  
                                </FormControl>
                              </FormItem>
                            )}
                    />
                    <div className="flex w-full items-center justify-between gap-5">
                      <div className="w-full">
                      <FormField
                          control={form.control}
                          name="functionName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Function Name</FormLabel>
                              <Select
                                required
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" className="w-full" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>

                                  {func ? func.map((data,index)=>{
                                    return <SelectItem key={index} value={data.name} data={data}>{data.name}</SelectItem>
                                  }):<SelectItem value="No function found">No function found</SelectItem>}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div >
                      <div className="w-full">
                          <FormField
                            control={form.control}
                            name="params"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Function Parameter </FormLabel>
                                <FormControl>
                                <Input
                                    required
                                    placeholder="Parameter"
                                    {...field}
                                  />
                                  
                                </FormControl>
                              </FormItem>
                            )}
                    />
                      </div>
                      <div className="w-full">
                          <FormField
                          
                            control={form.control}
                            name="numberOfTransactions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction load </FormLabel>
                                <FormControl>
                                <Input
                                    required
                                    placeholder="Load of transactions"
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
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              {/* <Button variant="outline" type="button">Clear</Button> */}
              
              {
                result?<Result result={result}/>:<Button type="submit" variant="destructive">{loading?<Typewriter
                  options={{
                    strings: ['Analyzing......'],
                    autoStart: true,
                    loop: true,
                  }}
                />:"Proceed"}</Button>
              }
              
            </CardFooter>
          </form>
        </Form>
      </Card>
      
   
  );
}
