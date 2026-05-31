import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EcosystemSimulator } from '../src/EcosystemSimulator.js';

describe('Bug修复测试', () => {
    let sim;

    beforeEach(() => {
        sim = new EcosystemSimulator();
    });

    describe('Bug 1: 删除中间物种时食物关系断链未处理', () => {
        it('删除中间物种后，捕食者应该直接连接到猎物', () => {
            const producer = sim.addSpecies({
                name: '草',
                trophicLevel: 1,
                population: 1000,
                energy: 10
            });
            const herbivore = sim.addSpecies({
                name: '兔',
                trophicLevel: 2,
                population: 100,
                energy: 50
            });
            const predator = sim.addSpecies({
                name: '狐',
                trophicLevel: 3,
                population: 10,
                energy: 200
            });

            sim.addFoodRelation(herbivore.id, producer.id);
            sim.addFoodRelation(predator.id, herbivore.id);

            assert.equal(sim.foodRelations.length, 2);

            sim.removeSpecies(herbivore.id);

            assert.equal(sim.foodRelations.length, 1);
            assert.equal(sim.foodRelations[0].predator, predator.id);
            assert.equal(sim.foodRelations[0].prey, producer.id);
        });

        it('删除不存在的物种不应抛出错误', () => {
            const producer = sim.addSpecies({
                name: '草',
                trophicLevel: 1,
                population: 1000,
                energy: 10
            });

            assert.doesNotThrow(() => {
                sim.removeSpecies(9999);
            });
        });

        it('删除非中间物种时应正常移除且不影响其他关系', () => {
            const producer = sim.addSpecies({
                name: '草',
                trophicLevel: 1,
                population: 1000,
                energy: 10
            });
            const herbivore = sim.addSpecies({
                name: '兔',
                trophicLevel: 2,
                population: 100,
                energy: 50
            });
            const otherProducer = sim.addSpecies({
                name: '灌木',
                trophicLevel: 1,
                population: 500,
                energy: 15
            });

            sim.addFoodRelation(herbivore.id, producer.id);
            sim.addFoodRelation(herbivore.id, otherProducer.id);

            assert.equal(sim.foodRelations.length, 2);

            sim.removeSpecies(otherProducer.id);

            assert.equal(sim.foodRelations.length, 1);
            assert.equal(sim.foodRelations[0].predator, herbivore.id);
            assert.equal(sim.foodRelations[0].prey, producer.id);
        });
    });

    describe('Bug 2: 能量金字塔在能量流为负时显示错乱', () => {
        it('getTotalEnergyByTrophicLevel应永远返回非负值', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });
            species.population = -100;
            species.energy = -10;

            const energy = sim.getTotalEnergyByTrophicLevel(1);
            assert.ok(energy >= 0);
            assert.equal(energy, 0);
        });

        it('getTotalPopulationByTrophicLevel应永远返回非负值', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });
            species.population = -50;

            const population = sim.getTotalPopulationByTrophicLevel(1);
            assert.ok(population >= 0);
            assert.equal(population, 0);
        });

        it('getAverageToxinByTrophicLevel应永远返回非负值', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                toxinLevel: 0
            });
            species.toxinLevel = -5;

            const avgToxin = sim.getAverageToxinByTrophicLevel(1);
            assert.ok(avgToxin >= 0);
            assert.equal(avgToxin, 0);
        });

        it('多物种混合正负值应正确计算', () => {
            const species1 = sim.addSpecies({
                name: '物种1',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });
            const species2 = sim.addSpecies({
                name: '物种2',
                trophicLevel: 1,
                population: 200,
                energy: 15
            });
            species1.population = -100;

            const energy = sim.getTotalEnergyByTrophicLevel(1);
            const population = sim.getTotalPopulationByTrophicLevel(1);
            
            assert.ok(energy >= 0);
            assert.ok(population >= 0);
            assert.equal(energy, 200 * 15);
            assert.equal(population, 200);
        });

        it('没有物种的营养级应返回0能量和0种群', () => {
            const energy = sim.getTotalEnergyByTrophicLevel(5);
            const population = sim.getTotalPopulationByTrophicLevel(5);
            const toxin = sim.getAverageToxinByTrophicLevel(5);

            assert.equal(energy, 0);
            assert.equal(population, 0);
            assert.equal(toxin, 0);
        });
    });

    describe('Bug 3: 自定义物种属性超出设定范围未限制', () => {
        it('营养级应限制在1-4之间', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 0,
                population: 100,
                energy: 10
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 5,
                population: 100,
                energy: 10
            });
            const species3 = sim.addSpecies({
                name: '测试3',
                trophicLevel: 2,
                population: 100,
                energy: 10
            });

            assert.equal(species1.trophicLevel, 1);
            assert.equal(species2.trophicLevel, 4);
            assert.equal(species3.trophicLevel, 2);
        });

        it('种群数量应限制为至少1', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 1,
                population: 0,
                energy: 10
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 1,
                population: -50,
                energy: 10
            });

            assert.equal(species1.population, 1);
            assert.equal(species2.population, 1);
        });

        it('能量应限制为至少1', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 1,
                population: 100,
                energy: 0
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 1,
                population: 100,
                energy: -10
            });

            assert.equal(species1.energy, 1);
            assert.equal(species2.energy, 1);
        });

        it('生长率应限制在0-1之间', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                growthRate: -0.5
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                growthRate: 1.5
            });
            const species3 = sim.addSpecies({
                name: '测试3',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                growthRate: 0.5
            });

            assert.equal(species1.growthRate, 0);
            assert.equal(species2.growthRate, 1);
            assert.equal(species3.growthRate, 0.5);
        });

        it('毒素敏感度应限制在0-1之间', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                toxinSensitivity: -0.2
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                toxinSensitivity: 1.2
            });

            assert.equal(species1.toxinSensitivity, 0);
            assert.equal(species2.toxinSensitivity, 1);
        });

        it('竞争力应限制在0-1之间', () => {
            const species1 = sim.addSpecies({
                name: '测试1',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                competitiveAbility: -0.3
            });
            const species2 = sim.addSpecies({
                name: '测试2',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                competitiveAbility: 1.8
            });

            assert.equal(species1.competitiveAbility, 0);
            assert.equal(species2.competitiveAbility, 1);
        });

        it('所有属性超出范围应同时正确限制', () => {
            const species = sim.addSpecies({
                name: '极限测试',
                trophicLevel: 10,
                population: -100,
                energy: -50,
                growthRate: 2.5,
                toxinSensitivity: -1.5,
                competitiveAbility: 3.2
            });

            assert.equal(species.trophicLevel, 4);
            assert.equal(species.population, 1);
            assert.equal(species.energy, 1);
            assert.equal(species.growthRate, 1);
            assert.equal(species.toxinSensitivity, 0);
            assert.equal(species.competitiveAbility, 1);
        });
    });

    describe('综合测试：修复后系统稳定性', () => {
        it('完整食物链移除中间环节后应保持连接', () => {
            const producer = sim.addSpecies({ name: '草', trophicLevel: 1, population: 1000, energy: 10 });
            const herbivore1 = sim.addSpecies({ name: '兔', trophicLevel: 2, population: 100, energy: 50 });
            const herbivore2 = sim.addSpecies({ name: '鼠', trophicLevel: 2, population: 150, energy: 30 });
            const predator = sim.addSpecies({ name: '狐', trophicLevel: 3, population: 10, energy: 200 });

            sim.addFoodRelation(herbivore1.id, producer.id);
            sim.addFoodRelation(herbivore2.id, producer.id);
            sim.addFoodRelation(predator.id, herbivore1.id);

            assert.equal(sim.foodRelations.length, 3);

            sim.removeSpecies(herbivore1.id);

            assert.equal(sim.foodRelations.length, 2);
            assert.ok(sim.foodRelations.some(r => 
                r.predator === predator.id && r.prey === producer.id
            ));
        });

        it('极端负值输入后金字塔计算应正常', () => {
            const species1 = sim.addSpecies({
                name: '物种1',
                trophicLevel: 1,
                population: 1000,
                energy: 100
            });
            const species2 = sim.addSpecies({
                name: '物种2',
                trophicLevel: 2,
                population: 50,
                energy: 20,
                toxinLevel: 0
            });
            species1.population = -1000;
            species1.energy = -100;
            species2.toxinLevel = -10;

            const energy1 = sim.getTotalEnergyByTrophicLevel(1);
            const energy2 = sim.getTotalEnergyByTrophicLevel(2);
            const toxin2 = sim.getAverageToxinByTrophicLevel(2);

            assert.equal(energy1, 0);
            assert.equal(energy2, 50 * 20);
            assert.equal(toxin2, 0);
        });

        it('删除所有中间物种后系统应稳定', () => {
            const producer = sim.addSpecies({ name: '草', trophicLevel: 1, population: 1000, energy: 10 });
            const herbivore = sim.addSpecies({ name: '兔', trophicLevel: 2, population: 100, energy: 50 });
            const predator = sim.addSpecies({ name: '狐', trophicLevel: 3, population: 10, energy: 200 });

            sim.addFoodRelation(herbivore.id, producer.id);
            sim.addFoodRelation(predator.id, herbivore.id);

            sim.removeSpecies(herbivore.id);

            assert.doesNotThrow(() => {
                for (let i = 0; i < 10; i++) {
                    sim.simulateStep();
                }
            });
        });
    });
});
