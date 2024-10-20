import TextWithLineBreaks from "./TextwithBreak"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const Result = ({result}) => {
    const {ethereumLogs, tronLogs, comparisonReport} = result;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="success">Show Result</Button>
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Analysis Report</DialogTitle>
          <DialogDescription>
            The overall benchmarking result
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between gap-5">
                <Card className="w-[350px]">
                  <CardHeader>
                    <CardTitle>Ethereum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="grid w-full items-center gap-4">
                        <TextWithLineBreaks text={ethereumLogs} />
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="w-[350px]">
                  <CardHeader>
                    <CardTitle>Tron</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="grid w-full items-center gap-4">
                      <TextWithLineBreaks text={tronLogs} />

                        
                      </div>
                    </div>
                  </CardContent>
                  
                </Card>
                <Card className="w-[350px]">
                  <CardHeader>
                    <CardTitle>Comparision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="grid w-full items-center gap-4">
                        <TextWithLineBreaks text={comparisonReport} />

                        
                      </div>
                    </div>
                  </CardContent>
                  
                </Card>
              </div>
        
      </DialogContent>
    </Dialog>
  )
}

export default Result