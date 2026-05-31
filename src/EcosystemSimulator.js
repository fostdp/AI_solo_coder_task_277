export class EcosystemSimulator {
    constructor() {
        this.species = [];
        this.foodRelations = [];
        this.generation = 0;
        this.environmentalToxin = 0;
        this.climateFactor = 1;
        this.ENERGY_TRANSFER_EFFICIENCY = 0.1;
        this.BIOACCUMULATION_FACTOR = 1.5;
        this.TOXIN_EFFECT_MULTIPLIER = 0.01;
        this.POPULATION_COLLAPSE_THRESHOLD = 0;
    }

    addSpecies(speciesData) {
        const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
        
        const safeTrophicLevel = Math.min(4, Math.max(1, speciesData.trophicLevel));
        const safePopulation = Math.max(1, speciesData.population);
        const safeEnergy = Math.max(1, speciesData.energy);
        const safeGrowthRate = Math.min(1, Math.max(0, speciesData.growthRate || 0.1));
        const safeToxinSensitivity = Math.min(1, Math.max(0, speciesData.toxinSensitivity || 0.5));
        const safeCompetitiveAbility = Math.min(1, Math.max(0, speciesData.competitiveAbility || 0.5));
        
        const species = {
            id: Date.now() + Math.random(),
            name: speciesData.name,
            trophicLevel: safeTrophicLevel,
            population: safePopulation,
            energy: safeEnergy,
            growthRate: safeGrowthRate,
            toxinSensitivity: safeToxinSensitivity,
            competitiveAbility: safeCompetitiveAbility,
            toxinLevel: speciesData.toxinLevel || 0,
            color: colors[safeTrophicLevel - 1] || '#666',
            basePopulation: safePopulation,
            isInvasive: speciesData.isInvasive || false
        };
        this.species.push(species);
        return species;
    }

    removeSpecies(id) {
        const removedSpecies = this.species.find(s => s.id === id);
        
        if (!removedSpecies) {
            return;
        }

        const predatorsOfRemoved = this.foodRelations
            .filter(r => r.prey === id)
            .map(r => r.predator);
        
        const preysOfRemoved = this.foodRelations
            .filter(r => r.predator === id)
            .map(r => r.prey);

        this.species = this.species.filter(s => s.id !== id);
        this.foodRelations = this.foodRelations.filter(r => r.predator !== id && r.prey !== id);

        let reconnectedCount = 0;
        predatorsOfRemoved.forEach(predatorId => {
            const predator = this.species.find(s => s.id === predatorId);
            if (predator) {
                preysOfRemoved.forEach(preyId => {
                    const prey = this.species.find(s => s.id === preyId);
                    if (prey && predator.trophicLevel > prey.trophicLevel) {
                        const exists = this.foodRelations.some(
                            r => r.predator === predatorId && r.prey === preyId
                        );
                        if (!exists) {
                            this.foodRelations.push({ predator: predatorId, prey: preyId });
                            reconnectedCount++;
                        }
                    }
                });
            }
        });
    }

    addFoodRelation(predatorId, preyId) {
        const predator = this.species.find(s => s.id === predatorId);
        const prey = this.species.find(s => s.id === preyId);

        if (!predator || !prey) return false;
        if (predator.trophicLevel <= prey.trophicLevel) return false;

        const exists = this.foodRelations.some(
            r => r.predator === predatorId && r.prey === preyId
        );

        if (!exists) {
            this.foodRelations.push({ predator: predatorId, prey: preyId });
            return true;
        }
        return false;
    }

    getTrophicLevelSpecies(trophicLevel) {
        return this.species.filter(s => s.trophicLevel === trophicLevel);
    }

    getTotalEnergyByTrophicLevel(trophicLevel) {
        const total = this.species
            .filter(s => s.trophicLevel === trophicLevel)
            .reduce((sum, s) => {
                const safePopulation = Math.max(0, s.population);
                const safeEnergy = Math.max(0, s.energy);
                return sum + safePopulation * safeEnergy;
            }, 0);
        return Math.max(0, total);
    }

    getTotalPopulationByTrophicLevel(trophicLevel) {
        const total = this.species
            .filter(s => s.trophicLevel === trophicLevel)
            .reduce((sum, s) => sum + Math.max(0, s.population), 0);
        return Math.max(0, total);
    }

    getAverageToxinByTrophicLevel(trophicLevel) {
        const species = this.species.filter(s => s.trophicLevel === trophicLevel);
        if (species.length === 0) return 0;
        const totalToxin = species.reduce((sum, s) => {
            const safePopulation = Math.max(0, s.population);
            const safeToxinLevel = Math.max(0, s.toxinLevel);
            return sum + safeToxinLevel * safePopulation;
        }, 0);
        const totalPopulation = species.reduce((sum, s) => sum + Math.max(0, s.population), 0);
        const avg = totalPopulation > 0 ? totalToxin / totalPopulation : 0;
        return Math.max(0, avg);
    }

    getPreyOfPredator(predatorId) {
        return this.foodRelations
            .filter(r => r.predator === predatorId)
            .map(r => this.species.find(s => s.id === r.prey))
            .filter(Boolean);
    }

    getPredatorsOfPrey(preyId) {
        return this.foodRelations
            .filter(r => r.prey === preyId)
            .map(r => this.species.find(s => s.id === r.predator))
            .filter(Boolean);
    }

    isPopulationCollapsed(speciesId) {
        const species = this.species.find(s => s.id === speciesId);
        return !species || species.population <= this.POPULATION_COLLAPSE_THRESHOLD;
    }

    getCollapsedSpecies() {
        return this.species.filter(s => s.population <= this.POPULATION_COLLAPSE_THRESHOLD);
    }

    calculateEnergyTransferEfficiency(fromTrophicLevel, toTrophicLevel) {
        const lowerLevelEnergy = this.getTotalEnergyByTrophicLevel(fromTrophicLevel);
        const upperLevelEnergy = this.getTotalEnergyByTrophicLevel(toTrophicLevel);
        if (lowerLevelEnergy === 0) return 0;
        return upperLevelEnergy / lowerLevelEnergy;
    }

    calculateBioaccumulationFactor(fromTrophicLevel, toTrophicLevel) {
        const lowerToxin = this.getAverageToxinByTrophicLevel(fromTrophicLevel);
        const upperToxin = this.getAverageToxinByTrophicLevel(toTrophicLevel);
        if (lowerToxin === 0) return 0;
        return upperToxin / lowerToxin;
    }

    simulateStep() {
        this.generation++;
        const newPopulations = {};
        const newToxinLevels = {};

        this.species.forEach(s => {
            newPopulations[s.id] = s.population;
            newToxinLevels[s.id] = s.toxinLevel;
        });

        if (this.environmentalToxin > 0) {
            this.species.filter(s => s.trophicLevel === 1).forEach(producer => {
                newToxinLevels[producer.id] += this.environmentalToxin * 0.5 * (1 - producer.toxinSensitivity * 0.5);
            });
        }

        this.species.filter(s => s.trophicLevel > 1).forEach(predator => {
            const preys = this.getPreyOfPredator(predator.id);

            if (preys.length > 0) {
                let totalPreyEnergy = preys.reduce((sum, p) => sum + p.population * p.energy, 0);
                let predatorEnergyNeeded = predator.population * predator.energy;
                let energyObtained = Math.min(totalPreyEnergy * this.ENERGY_TRANSFER_EFFICIENCY, predatorEnergyNeeded);

                let baseGrowth = predator.growthRate * this.climateFactor;

                if (energyObtained > predatorEnergyNeeded * 0.5) {
                    newPopulations[predator.id] *= (1 + baseGrowth);
                } else if (energyObtained < predatorEnergyNeeded * 0.2) {
                    newPopulations[predator.id] *= (1 - baseGrowth * 0.5);
                }

                preys.forEach(prey => {
                    let predationRate = 0.1 * predator.competitiveAbility / prey.competitiveAbility;
                    let preyEaten = Math.min(prey.population * predationRate, prey.population);
                    newPopulations[prey.id] = Math.max(0, newPopulations[prey.id] - preyEaten);

                    if (prey.toxinLevel > 0) {
                        newToxinLevels[predator.id] += prey.toxinLevel * this.BIOACCUMULATION_FACTOR * (preyEaten / prey.population);
                    }
                });
            } else {
                newPopulations[predator.id] *= 0.95;
            }

            let toxinEffect = predator.toxinLevel * predator.toxinSensitivity * this.TOXIN_EFFECT_MULTIPLIER;
            newPopulations[predator.id] *= Math.max(0.5, 1 - toxinEffect);
        });

        this.species.filter(s => s.trophicLevel === 1).forEach(producer => {
            let growth = producer.growthRate * this.climateFactor;
            newPopulations[producer.id] *= (1 + growth);

            let toxinEffect = producer.toxinLevel * producer.toxinSensitivity * this.TOXIN_EFFECT_MULTIPLIER * 0.5;
            newPopulations[producer.id] *= Math.max(0.7, 1 - toxinEffect);
        });

        this.species.forEach(invader => {
            if (invader.isInvasive) {
                this.species.filter(s => s.id !== invader.id && s.trophicLevel === invader.trophicLevel).forEach(native => {
                    let competitionEffect = 0.05 * invader.competitiveAbility;
                    newPopulations[native.id] *= (1 - competitionEffect);
                });
            }
        });

        this.species.forEach(s => {
            if (newPopulations[s.id] !== undefined) {
                s.population = Math.max(0, Math.floor(newPopulations[s.id]));
            }
            if (newToxinLevels[s.id] !== undefined) {
                s.toxinLevel = newToxinLevels[s.id];
            }
        });

        this.species = this.species.filter(s => s.population > 0);
        this.foodRelations = this.foodRelations.filter(r =>
            this.species.some(s => s.id === r.predator) &&
            this.species.some(s => s.id === r.prey)
        );
    }

    applyPollution(intensity) {
        this.environmentalToxin = Math.min(1, this.environmentalToxin + intensity);
    }

    reset() {
        this.species = [];
        this.foodRelations = [];
        this.generation = 0;
        this.environmentalToxin = 0;
        this.climateFactor = 1;
    }

    createSimpleFoodChain() {
        this.reset();

        const producer = this.addSpecies({
            name: '草',
            trophicLevel: 1,
            population: 1000,
            energy: 10,
            growthRate: 0.1,
            toxinSensitivity: 0.3,
            competitiveAbility: 0.5
        });

        const herbivore = this.addSpecies({
            name: '兔',
            trophicLevel: 2,
            population: 100,
            energy: 50,
            growthRate: 0.08,
            toxinSensitivity: 0.6,
            competitiveAbility: 0.5
        });

        const predator = this.addSpecies({
            name: '狐',
            trophicLevel: 3,
            population: 10,
            energy: 200,
            growthRate: 0.05,
            toxinSensitivity: 0.8,
            competitiveAbility: 0.7
        });

        this.addFoodRelation(herbivore.id, producer.id);
        this.addFoodRelation(predator.id, herbivore.id);

        return { producer, herbivore, predator };
    }
}
