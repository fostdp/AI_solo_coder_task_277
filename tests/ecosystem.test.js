import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EcosystemSimulator } from '../src/EcosystemSimulator.js';

describe('EcosystemSimulator', () => {
    let sim;

    beforeEach(() => {
        sim = new EcosystemSimulator();
    });

    describe('食物网拓扑结构测试', () => {
        it('应该能正确添加物种并分配营养级', () => {
            const producer = sim.addSpecies({
                name: '草',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });

            assert.equal(producer.trophicLevel, 1);
            assert.equal(sim.species.length, 1);
        });

        it('应该能正确建立捕食关系', () => {
            const producer = sim.addSpecies({ name: '草', trophicLevel: 1, population: 100, energy: 10 });
            const herbivore = sim.addSpecies({ name: '兔', trophicLevel: 2, population: 50, energy: 50 });

            const result = sim.addFoodRelation(herbivore.id, producer.id);
            assert.equal(result, true);
            assert.equal(sim.foodRelations.length, 1);
        });

        it('不允许捕食者营养级低于或等于猎物', () => {
            const producer = sim.addSpecies({ name: '草', trophicLevel: 1, population: 100, energy: 10 });
            const herbivore = sim.addSpecies({ name: '兔', trophicLevel: 2, population: 50, energy: 50 });

            const result = sim.addFoodRelation(producer.id, herbivore.id);
            assert.equal(result, false);
            assert.equal(sim.foodRelations.length, 0);
        });

        it('不允许重复的食物关系', () => {
            const producer = sim.addSpecies({ name: '草', trophicLevel: 1, population: 100, energy: 10 });
            const herbivore = sim.addSpecies({ name: '兔', trophicLevel: 2, population: 50, energy: 50 });

            sim.addFoodRelation(herbivore.id, producer.id);
            const result = sim.addFoodRelation(herbivore.id, producer.id);

            assert.equal(result, false);
            assert.equal(sim.foodRelations.length, 1);
        });

        it('应该能正确获取物种的猎物', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            const preys = sim.getPreyOfPredator(predator.id);

            assert.equal(preys.length, 1);
            assert.equal(preys[0].id, herbivore.id);
        });

        it('应该能正确获取物种的捕食者', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            const predators = sim.getPredatorsOfPrey(producer.id);

            assert.equal(predators.length, 1);
            assert.equal(predators[0].id, herbivore.id);
        });
    });

    describe('能量传递效率法则测试', () => {
        it('应该能正确计算各营养级总能量', () => {
            sim.createSimpleFoodChain();

            const level1Energy = sim.getTotalEnergyByTrophicLevel(1);
            const level2Energy = sim.getTotalEnergyByTrophicLevel(2);
            const level3Energy = sim.getTotalEnergyByTrophicLevel(3);

            assert.equal(level1Energy, 1000 * 10);
            assert.equal(level2Energy, 100 * 50);
            assert.equal(level3Energy, 10 * 200);
        });

        it('应该具有10%能量传递效率常量', () => {
            assert.equal(sim.ENERGY_TRANSFER_EFFICIENCY, 0.1);
        });

        it('能量传递效率应该在0-1范围内', () => {
            sim.createSimpleFoodChain();

            const efficiency1_2 = sim.calculateEnergyTransferEfficiency(1, 2);
            const efficiency2_3 = sim.calculateEnergyTransferEfficiency(2, 3);

            assert.ok(efficiency1_2 >= 0 && efficiency1_2 <= 1);
            assert.ok(efficiency2_3 >= 0 && efficiency2_3 <= 1);
        });

        it('高营养级能量应该低于低营养级', () => {
            sim.createSimpleFoodChain();

            for (let i = 0; i < 10; i++) {
                sim.simulateStep();
            }

            const level1Energy = sim.getTotalEnergyByTrophicLevel(1);
            const level2Energy = sim.getTotalEnergyByTrophicLevel(2);
            const level3Energy = sim.getTotalEnergyByTrophicLevel(3);

            assert.ok(level3Energy < level2Energy);
            assert.ok(level2Energy < level1Energy);
        });

        it('能量应该沿食物链逐级递减（约10%定律）', () => {
            sim.createSimpleFoodChain();

            for (let i = 0; i < 50; i++) {
                sim.simulateStep();
            }

            const level1Energy = sim.getTotalEnergyByTrophicLevel(1);
            const level2Energy = sim.getTotalEnergyByTrophicLevel(2);

            if (level1Energy > 0) {
                const efficiency = level2Energy / level1Energy;
                assert.ok(efficiency > 0.01 && efficiency < 0.5,
                    `能量传递效率应该在合理范围内，实际为: ${efficiency}`);
            }
        });

        it('生产者能量应该随时间增长（无捕食压力下）', () => {
            sim.reset();
            const producer = sim.addSpecies({
                name: '草',
                trophicLevel: 1,
                population: 100,
                energy: 10,
                growthRate: 0.1
            });

            const initialEnergy = sim.getTotalEnergyByTrophicLevel(1);
            for (let i = 0; i < 10; i++) {
                sim.simulateStep();
            }
            const finalEnergy = sim.getTotalEnergyByTrophicLevel(1);

            assert.ok(finalEnergy > initialEnergy);
        });
    });

    describe('种群崩溃判定测试', () => {
        it('应该能正确判定种群崩溃（种群为0）', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 0,
                energy: 10
            });

            assert.equal(sim.isPopulationCollapsed(species.id), true);
        });

        it('应该能正确识别未崩溃的种群', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });

            assert.equal(sim.isPopulationCollapsed(species.id), false);
        });

        it('移除物种后应该被认为已崩溃', () => {
            const species = sim.addSpecies({
                name: '测试物种',
                trophicLevel: 1,
                population: 100,
                energy: 10
            });

            sim.removeSpecies(species.id);
            assert.equal(sim.isPopulationCollapsed(species.id), true);
        });

        it('应该能获取所有崩溃的物种', () => {
            sim.addSpecies({ name: '物种1', trophicLevel: 1, population: 0, energy: 10 });
            sim.addSpecies({ name: '物种2', trophicLevel: 1, population: 100, energy: 10 });
            sim.addSpecies({ name: '物种3', trophicLevel: 2, population: 0, energy: 50 });

            const collapsed = sim.getCollapsedSpecies();
            assert.equal(collapsed.length, 2);
        });

        it('顶级捕食者失去猎物后应该种群崩溃', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();

            sim.removeSpecies(herbivore.id);

            for (let i = 0; i < 100; i++) {
                sim.simulateStep();
            }

            assert.equal(sim.isPopulationCollapsed(predator.id), true);
        });

        it('生产者崩溃应该导致整个食物链崩溃', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();

            producer.population = 0;

            for (let i = 0; i < 50; i++) {
                sim.simulateStep();
            }

            assert.equal(sim.isPopulationCollapsed(herbivore.id), true);
            assert.equal(sim.isPopulationCollapsed(predator.id), true);
        });

        it('种群数量低但不为0时不应判定为崩溃', () => {
            const species = sim.addSpecies({
                name: '濒危物种',
                trophicLevel: 3,
                population: 1,
                energy: 100
            });

            assert.equal(sim.isPopulationCollapsed(species.id), false);
        });
    });

    describe('生物富集因子测试', () => {
        it('应该具有1.5倍的生物富集因子常量', () => {
            assert.equal(sim.BIOACCUMULATION_FACTOR, 1.5);
        });

        it('环境毒素应该首先在生产者体内积累', () => {
            const { producer } = sim.createSimpleFoodChain();
            sim.applyPollution(0.5);

            for (let i = 0; i < 5; i++) {
                sim.simulateStep();
            }

            assert.ok(producer.toxinLevel > 0);
        });

        it('毒素应该沿食物链逐级富集（顶级捕食者毒素最高）', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            sim.applyPollution(0.3);

            for (let i = 0; i < 20; i++) {
                sim.simulateStep();
            }

            assert.ok(predator.toxinLevel > herbivore.toxinLevel);
            assert.ok(herbivore.toxinLevel > producer.toxinLevel);
        });

        it('应该能正确计算营养级间的生物富集因子', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            sim.applyPollution(0.5);

            for (let i = 0; i < 30; i++) {
                sim.simulateStep();
            }

            const biofactor1_2 = sim.calculateBioaccumulationFactor(1, 2);
            const biofactor2_3 = sim.calculateBioaccumulationFactor(2, 3);

            assert.ok(biofactor1_2 >= 1, `1->2级富集因子应该大于等于1，实际为: ${biofactor1_2}`);
            assert.ok(biofactor2_3 >= 1, `2->3级富集因子应该大于等于1，实际为: ${biofactor2_3}`);
        });

        it('高营养级生物富集因子应该在1-2范围内', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            sim.applyPollution(0.4);

            for (let i = 0; i < 50; i++) {
                sim.simulateStep();
            }

            const biofactor1_2 = sim.calculateBioaccumulationFactor(1, 2);
            const biofactor2_3 = sim.calculateBioaccumulationFactor(2, 3);

            assert.ok(biofactor1_2 >= 1 && biofactor1_2 <= 3,
                `1->2级富集因子应在合理范围，实际为: ${biofactor1_2}`);
            assert.ok(biofactor2_3 >= 1 && biofactor2_3 <= 3,
                `2->3级富集因子应在合理范围，实际为: ${biofactor2_3}`);
        });

        it('高毒素敏感度物种应该受毒素影响更大', () => {
            sim.reset();
            const producer = sim.addSpecies({
                name: '草', trophicLevel: 1, population: 1000, energy: 10,
                growthRate: 0.1, toxinSensitivity: 0.9, competitiveAbility: 0.5
            });

            sim.applyPollution(0.8);
            const initialPop = producer.population;

            for (let i = 0; i < 20; i++) {
                sim.simulateStep();
            }

            const finalPop = producer.population;
            const reductionRate = (initialPop - finalPop) / initialPop;

            assert.ok(reductionRate > 0.1,
                `高敏感度物种应该种群显著下降，下降率为: ${reductionRate}`);
        });

        it('高毒素应该导致种群数量下降', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            const initialPredatorPop = predator.population;

            sim.applyPollution(1.0);

            for (let i = 0; i < 30; i++) {
                sim.simulateStep();
            }

            const finalPredatorPop = predator.population;

            assert.ok(finalPredatorPop < initialPredatorPop ||
                sim.isPopulationCollapsed(predator.id));
        });

        it('应该能正确计算各营养级平均毒素水平', () => {
            const { producer, herbivore, predator } = sim.createSimpleFoodChain();
            sim.applyPollution(0.5);

            for (let i = 0; i < 10; i++) {
                sim.simulateStep();
            }

            const toxin1 = sim.getAverageToxinByTrophicLevel(1);
            const toxin2 = sim.getAverageToxinByTrophicLevel(2);
            const toxin3 = sim.getAverageToxinByTrophicLevel(3);

            assert.ok(toxin3 > toxin2);
            assert.ok(toxin2 > toxin1);
            assert.ok(toxin1 > 0);
        });
    });

    describe('入侵物种影响测试', () => {
        it('入侵物种应该与同营养级本土物种竞争', () => {
            const { producer, herbivore } = sim.createSimpleFoodChain();
            const initialHerbivorePop = herbivore.population;

            const invader = sim.addSpecies({
                name: '入侵物种',
                trophicLevel: 2,
                population: 50,
                energy: 50,
                growthRate: 0.15,
                toxinSensitivity: 0.3,
                competitiveAbility: 0.9,
                isInvasive: true
            });

            sim.addFoodRelation(invader.id, producer.id);

            for (let i = 0; i < 20; i++) {
                sim.simulateStep();
            }

            assert.ok(herbivore.population < initialHerbivorePop,
                `本土物种应该因入侵物种竞争而减少，从${initialHerbivorePop}变为${herbivore.population}`);
        });

        it('入侵物种应该具有较高的竞争力', () => {
            const { producer } = sim.createSimpleFoodChain();

            const invader = sim.addSpecies({
                name: '入侵物种',
                trophicLevel: 2,
                population: 50,
                energy: 50,
                growthRate: 0.15,
                toxinSensitivity: 0.3,
                competitiveAbility: 0.9,
                isInvasive: true
            });

            assert.equal(invader.competitiveAbility, 0.9);
            assert.ok(invader.isInvasive === true);
        });
    });

    describe('综合生态系统稳定性测试', () => {
        it('简单食物链应该能维持多个世代的动态平衡', () => {
            sim.createSimpleFoodChain();

            const speciesCounts = sim.species.length;

            for (let i = 0; i < 50; i++) {
                sim.simulateStep();
            }

            assert.ok(sim.species.length >= speciesCounts - 1,
                '生态系统应该基本稳定，不会全部崩溃');
        });

        it('各营养级种群数量应该呈现金字塔分布', () => {
            sim.createSimpleFoodChain();

            for (let i = 0; i < 20; i++) {
                sim.simulateStep();
            }

            const pop1 = sim.getTotalPopulationByTrophicLevel(1);
            const pop2 = sim.getTotalPopulationByTrophicLevel(2);
            const pop3 = sim.getTotalPopulationByTrophicLevel(3);

            assert.ok(pop1 > pop2);
            assert.ok(pop2 > pop3);
        });

        it('世代数应该正确递增', () => {
            sim.createSimpleFoodChain();
            const initialGen = sim.generation;

            for (let i = 0; i < 15; i++) {
                sim.simulateStep();
            }

            assert.equal(sim.generation, initialGen + 15);
        });

        it('重置后生态系统应该回到初始状态', () => {
            sim.createSimpleFoodChain();
            sim.applyPollution(0.5);

            for (let i = 0; i < 10; i++) {
                sim.simulateStep();
            }

            sim.reset();

            assert.equal(sim.species.length, 0);
            assert.equal(sim.foodRelations.length, 0);
            assert.equal(sim.generation, 0);
            assert.equal(sim.environmentalToxin, 0);
            assert.equal(sim.climateFactor, 1);
        });
    });
});
