import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export function DifferenceCard() {
  return (
    <div>
      <Card className="w-screen mx-5">
        <CardHeader>
          <CardTitle>Chaindevs Thesis Project</CardTitle>
          <CardDescription>View Test Status-</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Card className="w-[350px] place-items-center">
            <CardHeader>
              <CardTitle>Difference</CardTitle>
              <CardDescription>Difference project Stat.</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <div className="grid w-full items-center gap-4"></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-center gap-4"></CardFooter>
      </Card>
    </div>
  );
}
