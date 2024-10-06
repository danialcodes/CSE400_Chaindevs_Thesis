import "./App.css";
import { CardWithForm } from "./card/card";
import { DifferenceCard } from "./card/difference";
import { StatCard } from "./card/revCard";

function App() {
  console.log(import.meta.env.VITE_DEPLOYED_SERVER_URL);
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        <CardWithForm />
      </div>

      <StatCard />
      <DifferenceCard />
    </>
  );
}

export default App;
