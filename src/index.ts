import { FileScenarioProvider, parseScenario } from "./scenarioLoader";
import { Scenario } from "./scenarioLoader";

function main() {
    let scenario: Scenario;
    const scenarioProvider = new FileScenarioProvider('/home/sortedcord/Projects/NLAVS/src/scenarios/scene1.json');
    scenarioProvider.getScenario().then(scenarioJson => {
        scenario = parseScenario(scenarioJson);
    }).catch(error => {
        console.error("Error loading scenario:", error);
    });


}

main();