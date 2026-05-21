
interface AffectVector {
    [key: string]: number;
}

type LedgerEntry = {
    event: string;
    affect_vector: AffectVector;
};


export class Entity {
    name: string;
    description: string; 
    ledger: LedgerEntry[];

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.ledger = [];
    }

    recordEvent(event: string, affect_vector: AffectVector) {
        this.ledger.push({ event, affect_vector });
    }
}

