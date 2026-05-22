import { Entity } from "./entity";
import { readFile } from "fs/promises";

export class Scenario {
    name: string
    context: any
    entities: Entity[]
    locations: any[]

    constructor(name: string, context: any, entities: Entity[], locations: any[]) {
        this.name = name;
        this.context = context;
        this.entities = entities;
        this.locations = locations;
    }
}

interface ScenarioProvider {
    getScenario(): Promise<any>;
}

export class FileScenarioProvider implements ScenarioProvider {
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async getScenario(): Promise<any> {
        const fileContents = await readFile(this.filePath, "utf-8");
        return JSON.parse(fileContents);
    }
}

// parse the scenario json into a Scenario object
export function parseScenario(scenarioJson: any): Scenario {
    const { name, context, entities, locations } = scenarioJson;
    let scenarioEntities: Entity[] = [];
    let scenarioLocations: any[] = [];


    for (const entity of entities) {
        let entityObject = new Entity(entity.id, entity.name, entity.description, entity.attributes, entity.relations)
        entityObject.ledger = entity.ledger;
        scenarioEntities.push(entityObject);
    }


    return new Scenario(name, context, scenarioEntities, scenarioLocations);
}
