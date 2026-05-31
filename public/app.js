class EcosystemSimulator {
    constructor() {
        this.species = [];
        this.foodRelations = [];
        this.generation = 0;
        this.isSimulating = false;
        this.simulationInterval = null;
        this.ecosystemType = 'grassland';
        this.currentEcosystemId = null;
        this.environmentalToxin = 0;
        this.climateFactor = 1;
        this.ENERGY_TRANSFER_EFFICIENCY = 0.1;
        this.BIOACCUMULATION_FACTOR = 1.5;
        this.TOXIN_EFFECT_MULTIPLIER = 0.01;
        this.POPULATION_COLLAPSE_THRESHOLD = 0;

        this.templates = this.createTemplates();
        this.init();
    }

    createTemplates() {
        const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
        return {
            grassland: {
                name: '草原生态系统',
                description: '典型的温带草原，包含草、兔、狐、鹰等物种',
                background: '#90EE90',
                species: [
                    { name: '青草', trophicLevel: 1, population: 1000, energy: 10, growthRate: 0.1, toxinSensitivity: 0.3, competitiveAbility: 0.6, color: colors[0] },
                    { name: '野兔', trophicLevel: 2, population: 100, energy: 50, growthRate: 0.08, toxinSensitivity: 0.6, competitiveAbility: 0.5, color: colors[1] },
                    { name: '狐狸', trophicLevel: 3, population: 25, energy: 200, growthRate: 0.05, toxinSensitivity: 0.8, competitiveAbility: 0.7, color: colors[2] }
                ],
                relations: [
                    { predator: '野兔', prey: '青草' },
                    { predator: '狐狸', prey: '野兔' }
                ]
            },
            ocean: {
                name: '海洋生态系统',
                description: '复杂的海洋食物链，从浮游生物到顶级捕食者',
                background: '#87CEEB',
                species: [
                    { name: '浮游植物', trophicLevel: 1, population: 1000, energy: 2, growthRate: 0.2, toxinSensitivity: 0.4, competitiveAbility: 0.5, color: colors[0] },
                    { name: '磷虾', trophicLevel: 2, population: 300, energy: 8, growthRate: 0.12, toxinSensitivity: 0.5, competitiveAbility: 0.4, color: colors[1] },
                    { name: '沙丁鱼', trophicLevel: 3, population: 80, energy: 25, growthRate: 0.06, toxinSensitivity: 0.7, competitiveAbility: 0.6, color: colors[2] },
                    { name: '金枪鱼', trophicLevel: 4, population: 10, energy: 80, growthRate: 0.02, toxinSensitivity: 0.9, competitiveAbility: 0.85, color: colors[3] }
                ],
                relations: [
                    { predator: '磷虾', prey: '浮游植物' },
                    { predator: '沙丁鱼', prey: '磷虾' },
                    { predator: '金枪鱼', prey: '沙丁鱼' }
                ]
            },
            rainforest: {
                name: '热带雨林',
                description: '生物多样性极高的雨林生态系统',
                background: '#228B22',
                species: [
                    { name: '榕树', trophicLevel: 1, population: 200, energy: 15, growthRate: 0.08, toxinSensitivity: 0.2, competitiveAbility: 0.7, color: colors[0] },
                    { name: '蝴蝶', trophicLevel: 2, population: 400, energy: 3, growthRate: 0.18, toxinSensitivity: 0.5, competitiveAbility: 0.4, color: colors[1] },
                    { name: '树蛙', trophicLevel: 2, population: 150, energy: 8, growthRate: 0.1, toxinSensitivity: 0.6, competitiveAbility: 0.5, color: '#FF69B4' },
                    { name: '猴子', trophicLevel: 3, population: 40, energy: 35, growthRate: 0.04, toxinSensitivity: 0.7, competitiveAbility: 0.65, color: colors[2] },
                    { name: '蟒蛇', trophicLevel: 4, population: 8, energy: 90, growthRate: 0.02, toxinSensitivity: 0.85, competitiveAbility: 0.9, color: colors[3] }
                ],
                relations: [
                    { predator: '蝴蝶', prey: '榕树' },
                    { predator: '树蛙', prey: '蝴蝶' },
                    { predator: '猴子', prey: '树蛙' },
                    { predator: '蟒蛇', prey: '猴子' }
                ]
            },
            temperate: {
                name: '温带森林',
                description: '四季分明的温带落叶林生态系统',
                background: '#8B4513',
                species: [
                    { name: '橡树', trophicLevel: 1, population: 150, energy: 20, growthRate: 0.06, toxinSensitivity: 0.25, competitiveAbility: 0.75, color: colors[0] },
                    { name: '松鼠', trophicLevel: 2, population: 120, energy: 12, growthRate: 0.09, toxinSensitivity: 0.55, competitiveAbility: 0.55, color: colors[1] },
                    { name: '鹿', trophicLevel: 2, population: 60, energy: 30, growthRate: 0.05, toxinSensitivity: 0.45, competitiveAbility: 0.6, color: '#D2691E' },
                    { name: '狼', trophicLevel: 4, population: 12, energy: 70, growthRate: 0.03, toxinSensitivity: 0.8, competitiveAbility: 0.85, color: colors[3] }
                ],
                relations: [
                    { predator: '松鼠', prey: '橡树' },
                    { predator: '鹿', prey: '橡树' },
                    { predator: '狼', prey: '鹿' }
                ]
            },
            desert: {
                name: '沙漠生态系统',
                description: '极端干旱环境下的特殊生态系统',
                background: '#F4A460',
                species: [
                    { name: '仙人掌', trophicLevel: 1, population: 80, energy: 10, growthRate: 0.04, toxinSensitivity: 0.15, competitiveAbility: 0.8, color: colors[0] },
                    { name: '沙漠鼠', trophicLevel: 2, population: 60, energy: 8, growthRate: 0.07, toxinSensitivity: 0.5, competitiveAbility: 0.6, color: colors[1] },
                    { name: '蝎子', trophicLevel: 3, population: 30, energy: 12, growthRate: 0.05, toxinSensitivity: 0.4, competitiveAbility: 0.7, color: colors[2] },
                    { name: '沙漠狐', trophicLevel: 4, population: 6, energy: 45, growthRate: 0.025, toxinSensitivity: 0.75, competitiveAbility: 0.8, color: colors[3] }
                ],
                relations: [
                    { predator: '沙漠鼠', prey: '仙人掌' },
                    { predator: '蝎子', prey: '沙漠鼠' },
                    { predator: '沙漠狐', prey: '蝎子' },
                    { predator: '沙漠狐', prey: '沙漠鼠' }
                ]
            },
            tundra: {
                name: '苔原生态系统',
                description: '寒冷冻土带的脆弱生态系统',
                background: '#E0FFFF',
                species: [
                    { name: '苔藓', trophicLevel: 1, population: 300, energy: 3, growthRate: 0.05, toxinSensitivity: 0.35, competitiveAbility: 0.5, color: colors[0] },
                    { name: '旅鼠', trophicLevel: 2, population: 200, energy: 6, growthRate: 0.1, toxinSensitivity: 0.55, competitiveAbility: 0.45, color: colors[1] },
                    { name: '北极狐', trophicLevel: 3, population: 20, energy: 35, growthRate: 0.035, toxinSensitivity: 0.75, competitiveAbility: 0.75, color: colors[2] },
                    { name: '北极熊', trophicLevel: 4, population: 3, energy: 120, growthRate: 0.015, toxinSensitivity: 0.9, competitiveAbility: 0.95, color: colors[3] }
                ],
                relations: [
                    { predator: '旅鼠', prey: '苔藓' },
                    { predator: '北极狐', prey: '旅鼠' },
                    { predator: '北极熊', prey: '北极狐' }
                ]
            }
        };
    }

    init() {
        this.bindEvents();
        this.setupInputValidation();
        this.updateSpeciesSelects();
        this.renderAll();
    }

    setupInputValidation() {
        const inputs = [
            { id: 'population', min: 1, max: 100000 },
            { id: 'energy', min: 1, max: 10000 },
            { id: 'growthRate', min: 0, max: 1 },
            { id: 'toxinSensitivity', min: 0, max: 1 },
            { id: 'competitiveAbility', min: 0, max: 1 },
            { id: 'disturbanceIntensity', min: 0, max: 1 }
        ];

        inputs.forEach(({ id, min, max }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    let value = parseFloat(e.target.value);
                    if (isNaN(value)) return;
                    value = Math.min(max, Math.max(min, value));
                    e.target.value = value;
                });

                element.addEventListener('blur', (e) => {
                    let value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                        value = Math.min(max, Math.max(min, value));
                        e.target.value = value;
                    }
                });
            }
        });
    }

    bindEvents() {
        document.getElementById('addSpeciesBtn').addEventListener('click', () => this.addSpecies());
        document.getElementById('addRelationBtn').addEventListener('click', () => this.addFoodRelation());
        document.getElementById('applyDisturbanceBtn').addEventListener('click', () => this.applyDisturbance());
        document.getElementById('startSimBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pauseSimBtn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveEcosystem());
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideLoadModal());
        document.getElementById('loadTemplateBtn').addEventListener('click', () => this.showTemplateModal());
        document.getElementById('closeTemplateModal').addEventListener('click', () => this.hideTemplateModal());
        document.getElementById('ecosystemType').addEventListener('change', (e) => {
            this.ecosystemType = e.target.value;
            this.renderFoodWeb();
        });
        document.getElementById('simSpeed').addEventListener('input', (e) => {
            document.getElementById('simSpeedValue').textContent = `${e.target.value}x`;
        });
    }

    addSpecies() {
        const name = document.getElementById('speciesName').value.trim();
        const trophicLevel = parseInt(document.getElementById('trophicLevel').value);
        const population = parseInt(document.getElementById('population').value);
        const energy = parseInt(document.getElementById('energy').value);
        const growthRate = parseFloat(document.getElementById('growthRate').value);
        const toxinSensitivity = parseFloat(document.getElementById('toxinSensitivity').value);
        const competitiveAbility = parseFloat(document.getElementById('competitiveAbility').value);

        if (!name) {
            alert('请输入物种名称！');
            return;
        }

        const safeTrophicLevel = Math.min(4, Math.max(1, trophicLevel));
        const safePopulation = Math.max(1, population);
        const safeEnergy = Math.max(1, energy);
        const safeGrowthRate = Math.min(1, Math.max(0, growthRate));
        const safeToxinSensitivity = Math.min(1, Math.max(0, toxinSensitivity));
        const safeCompetitiveAbility = Math.min(1, Math.max(0, competitiveAbility));

        const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];

        this.species.push({
            id: Date.now(),
            name,
            trophicLevel: safeTrophicLevel,
            population: safePopulation,
            energy: safeEnergy,
            growthRate: safeGrowthRate,
            toxinSensitivity: safeToxinSensitivity,
            competitiveAbility: safeCompetitiveAbility,
            toxinLevel: 0,
            color: colors[safeTrophicLevel - 1],
            basePopulation: safePopulation,
            isInvasive: false
        });

        document.getElementById('speciesName').value = '';
        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
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
        
        if (reconnectedCount > 0) {
            console.log(`已删除物种: ${removedSpecies.name}, 自动重连 ${reconnectedCount} 条食物关系`);
        }
        
        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
    }

    addFoodRelation() {
        const predatorId = parseInt(document.getElementById('predator').value);
        const preyId = parseInt(document.getElementById('prey').value);

        if (!predatorId || !preyId) {
            alert('请选择捕食者和猎物！');
            return;
        }

        if (predatorId === preyId) {
            alert('物种不能捕食自己！');
            return;
        }

        const predator = this.species.find(s => s.id === predatorId);
        const prey = this.species.find(s => s.id === preyId);

        if (predator.trophicLevel <= prey.trophicLevel) {
            alert('捕食者的营养级必须高于猎物！');
            return;
        }

        const exists = this.foodRelations.some(
            r => r.predator === predatorId && r.prey === preyId
        );

        if (!exists) {
            this.foodRelations.push({ predator: predatorId, prey: preyId });
            this.renderAll();
        }
    }

    updateSpeciesSelects() {
        const predatorSelect = document.getElementById('predator');
        const preySelect = document.getElementById('prey');

        predatorSelect.innerHTML = '<option value="">选择捕食者</option>';
        preySelect.innerHTML = '<option value="">选择猎物</option>';

        this.species.forEach(s => {
            predatorSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
            preySelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
    }

    updateSpeciesList() {
        const list = document.getElementById('speciesList');
        list.innerHTML = '';

        this.species.forEach(s => {
            const item = document.createElement('div');
            item.className = 'species-item';
            item.style.borderLeftColor = s.color;
            const invasiveTag = s.isInvasive ? ' ⚠️入侵' : '';
            const toxinDisplay = s.toxinLevel > 0.1 ? ` | 毒素: ${s.toxinLevel.toFixed(1)}` : '';
            item.innerHTML = `
                <div>
                    <span>${s.name}${invasiveTag} (${s.population})</span>
                    <div class="species-info">
                        生长: ${(s.growthRate * 100).toFixed(0)}%${toxinDisplay}
                    </div>
                </div>
                <button onclick="simulator.removeSpecies(${s.id})">×</button>
            `;
            list.appendChild(item);
        });
    }

    renderAll() {
        this.renderFoodWeb();
        this.renderEnergyPyramid();
        this.renderNumberPyramid();
        this.renderToxinPyramid();
    }

    renderFoodWeb() {
        const canvas = document.getElementById('foodWebCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const template = this.templates[this.ecosystemType];
        if (template) {
            ctx.fillStyle = template.background;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
        }

        const positions = {};
        const trophicGroups = [[], [], [], []];

        this.species.forEach(s => {
            trophicGroups[s.trophicLevel - 1].push(s);
        });

        trophicGroups.forEach((group, level) => {
            const y = 80 + level * 90;
            const spacing = canvas.width / (group.length + 1);
            group.forEach((s, i) => {
                positions[s.id] = { x: spacing * (i + 1), y };
            });
        });

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        this.foodRelations.forEach(r => {
            const predatorPos = positions[r.predator];
            const preyPos = positions[r.prey];
            if (predatorPos && preyPos) {
                ctx.beginPath();
                ctx.moveTo(predatorPos.x, predatorPos.y);
                ctx.lineTo(preyPos.x, preyPos.y);
                ctx.stroke();

                const angle = Math.atan2(preyPos.y - predatorPos.y, preyPos.x - predatorPos.x);
                const arrowX = predatorPos.x + (preyPos.x - predatorPos.x) * 0.7;
                const arrowY = predatorPos.y + (preyPos.y - predatorPos.y) * 0.7;

                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
            }
        });

        this.species.forEach(s => {
            const pos = positions[s.id];
            if (pos) {
                const radius = Math.min(30, 10 + Math.sqrt(s.population) / 2);

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();

                if (s.toxinLevel > 0) {
                    const toxinRatio = Math.min(s.toxinLevel / 100, 1);
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * toxinRatio);
                    ctx.strokeStyle = '#8B008B';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.lineWidth = 2;
                }

                if (s.isInvasive) {
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = 3;
                } else {
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 2;
                }
                ctx.stroke();

                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(s.name, pos.x, pos.y + radius + 15);
                ctx.fillText(`数量: ${s.population}`, pos.x, pos.y + radius + 28);
                if (s.toxinLevel > 0.1) {
                    ctx.fillStyle = '#8B008B';
                    ctx.fillText(`毒素: ${s.toxinLevel.toFixed(1)}`, pos.x, pos.y + radius + 40);
                }
            }
        });

        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('生产者', 10, 30);
        ctx.fillText('初级消费者', 10, 120);
        ctx.fillText('次级消费者', 10, 210);
        ctx.fillText('三级消费者', 10, 300);

        if (this.environmentalToxin > 0) {
            ctx.fillStyle = '#8B008B';
            ctx.fillText(`环境毒素: ${(this.environmentalToxin * 100).toFixed(0)}%`, 10, canvas.height - 20);
        }
    }

    renderEnergyPyramid() {
        const canvas = document.getElementById('energyPyramidCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const trophicEnergy = [0, 0, 0, 0];
        this.species.forEach(s => {
            const safePopulation = Math.max(0, s.population);
            const safeEnergy = Math.max(0, s.energy);
            trophicEnergy[s.trophicLevel - 1] += safePopulation * safeEnergy;
        });

        trophicEnergy.forEach((energy, i) => {
            trophicEnergy[i] = Math.max(0, energy);
        });

        const maxEnergy = Math.max(...trophicEnergy, 1);
        const centerX = canvas.width / 2;
        const baseWidth = 250;
        const height = 60;
        const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
        const labels = ['生产者', '初级消费者', '次级消费者', '三级消费者'];

        for (let i = 3; i >= 0; i--) {
            const safeTrophicEnergy = Math.max(0, trophicEnergy[i]);
            const ratio = safeTrophicEnergy / maxEnergy;
            const width = Math.max(20, baseWidth * ratio);
            const y = 30 + (3 - i) * (height + 10);

            ctx.beginPath();
            ctx.moveTo(centerX - width / 2, y);
            ctx.lineTo(centerX + width / 2, y);
            ctx.lineTo(centerX + width / 2 - 10, y + height);
            ctx.lineTo(centerX - width / 2 + 10, y + height);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${labels[i]}: ${safeTrophicEnergy}`, centerX, y + height / 2 + 4);
        }
    }

    renderNumberPyramid() {
        const canvas = document.getElementById('numberPyramidCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const trophicNumbers = [0, 0, 0, 0];
        this.species.forEach(s => {
            trophicNumbers[s.trophicLevel - 1] += Math.max(0, s.population);
        });

        trophicNumbers.forEach((num, i) => {
            trophicNumbers[i] = Math.max(0, num);
        });

        const maxNumber = Math.max(...trophicNumbers, 1);
        const centerX = canvas.width / 2;
        const baseWidth = 250;
        const height = 60;
        const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
        const labels = ['生产者', '初级消费者', '次级消费者', '三级消费者'];

        for (let i = 3; i >= 0; i--) {
            const safeTrophicNumber = Math.max(0, trophicNumbers[i]);
            const ratio = safeTrophicNumber / maxNumber;
            const width = Math.max(20, baseWidth * ratio);
            const y = 30 + (3 - i) * (height + 10);

            ctx.beginPath();
            ctx.moveTo(centerX - width / 2, y);
            ctx.lineTo(centerX + width / 2, y);
            ctx.lineTo(centerX + width / 2 - 10, y + height);
            ctx.lineTo(centerX - width / 2 + 10, y + height);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${labels[i]}: ${safeTrophicNumber}`, centerX, y + height / 2 + 4);
        }
    }

    renderToxinPyramid() {
        const canvas = document.getElementById('toxinPyramidCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const trophicToxin = [0, 0, 0, 0];
        const trophicCounts = [0, 0, 0, 0];

        this.species.forEach(s => {
            const safePopulation = Math.max(0, s.population);
            const safeToxinLevel = Math.max(0, s.toxinLevel);
            trophicToxin[s.trophicLevel - 1] += safeToxinLevel * safePopulation;
            trophicCounts[s.trophicLevel - 1] += safePopulation;
        });

        trophicToxin.forEach((toxin, i) => {
            trophicToxin[i] = Math.max(0, toxin);
        });

        const avgToxin = trophicToxin.map((total, i) => {
            if (trophicCounts[i] > 0) {
                return Math.max(0, total / trophicCounts[i]);
            }
            return 0;
        });

        const maxToxin = Math.max(...avgToxin, 0.1);
        const centerX = canvas.width / 2;
        const baseWidth = 250;
        const height = 60;
        const colors = ['#9370DB', '#8B008B', '#4B0082', '#2F0047'];
        const labels = ['生产者', '初级消费者', '次级消费者', '三级消费者'];

        for (let i = 3; i >= 0; i--) {
            const safeAvgToxin = Math.max(0, avgToxin[i]);
            const ratio = safeAvgToxin / maxToxin;
            const width = Math.max(20, baseWidth * ratio);
            const y = 30 + (3 - i) * (height + 10);

            ctx.beginPath();
            ctx.moveTo(centerX - width / 2, y);
            ctx.lineTo(centerX + width / 2, y);
            ctx.lineTo(centerX + width / 2 - 10, y + height);
            ctx.lineTo(centerX - width / 2 + 10, y + height);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${labels[i]}: ${safeAvgToxin.toFixed(2)}`, centerX, y + height / 2 + 4);
        }

        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('生物富集作用：毒素沿食物链逐级放大', centerX, canvas.height - 10);
    }

    startSimulation() {
        if (this.isSimulating) return;
        if (this.species.length === 0) {
            alert('请先添加物种！');
            return;
        }
        this.isSimulating = true;
        const speed = parseInt(document.getElementById('simSpeed').value);
        this.simulationInterval = setInterval(() => this.simulateStep(), 1000 / speed);
    }

    pauseSimulation() {
        this.isSimulating = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    simulateStep() {
        this.generation++;
        document.getElementById('generation').textContent = `世代: ${this.generation}`;

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
            const preys = this.foodRelations
                .filter(r => r.predator === predator.id)
                .map(r => this.species.find(s => s.id === r.prey))
                .filter(Boolean);

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

        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
    }

    applyDisturbance() {
        const type = document.getElementById('disturbanceType').value;
        const intensity = parseFloat(document.getElementById('disturbanceIntensity').value);

        switch (type) {
            case 'drought':
                this.climateFactor = Math.max(0.3, this.climateFactor - intensity * 0.3);
                this.species.filter(s => s.trophicLevel === 1).forEach(s => {
                    s.population = Math.floor(s.population * (1 - intensity * 0.6));
                });
                break;
            case 'pollution':
                this.environmentalToxin = Math.min(1, this.environmentalToxin + intensity);
                break;
            case 'pesticide':
                this.environmentalToxin = Math.min(1, this.environmentalToxin + intensity * 0.5);
                this.species.filter(s => s.trophicLevel <= 2).forEach(s => {
                    s.population = Math.floor(s.population * (1 - intensity * s.toxinSensitivity * 0.5));
                });
                break;
            case 'overhunting':
                this.species.filter(s => s.trophicLevel >= 3).forEach(s => {
                    s.population = Math.floor(s.population * (1 - intensity * 0.8));
                });
                break;
            case 'invasion':
                const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
                const invasiveSpecies = {
                    id: Date.now(),
                    name: '入侵物种',
                    trophicLevel: 2,
                    population: Math.floor(100 * intensity),
                    energy: 15,
                    growthRate: 0.15,
                    toxinSensitivity: 0.3,
                    competitiveAbility: 0.9,
                    toxinLevel: 0,
                    color: '#9400D3',
                    basePopulation: 50,
                    isInvasive: true
                };
                this.species.push(invasiveSpecies);
                break;
            case 'climateChange':
                this.climateFactor = 1 - intensity * 0.5;
                this.species.forEach(s => {
                    let effect = intensity * (0.5 + Math.random() * 0.5);
                    s.population = Math.floor(s.population * (1 - effect * 0.3));
                });
                break;
        }

        this.species = this.species.filter(s => s.population > 0);
        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
    }

    reset() {
        this.pauseSimulation();
        this.species = [];
        this.foodRelations = [];
        this.generation = 0;
        this.currentEcosystemId = null;
        this.environmentalToxin = 0;
        this.climateFactor = 1;
        document.getElementById('generation').textContent = '世代: 0';
        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
    }

    loadTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;

        this.reset();
        this.ecosystemType = templateKey;
        document.getElementById('ecosystemType').value = templateKey;

        const idMap = {};
        template.species.forEach(s => {
            const id = Date.now() + Math.random();
            idMap[s.name] = id;
            this.species.push({
                id,
                ...s,
                toxinLevel: 0,
                basePopulation: s.population,
                isInvasive: false
            });
        });

        template.relations.forEach(r => {
            const predatorId = idMap[r.predator];
            const preyId = idMap[r.prey];
            if (predatorId && preyId) {
                this.foodRelations.push({ predator: predatorId, prey: preyId });
            }
        });

        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
        this.hideTemplateModal();
    }

    showTemplateModal() {
        const templateList = document.getElementById('templateList');
        templateList.innerHTML = '';

        Object.entries(this.templates).forEach(([key, template]) => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            `;
            item.addEventListener('click', () => this.loadTemplate(key));
            templateList.appendChild(item);
        });

        document.getElementById('templateModal').classList.add('show');
    }

    hideTemplateModal() {
        document.getElementById('templateModal').classList.remove('show');
    }

    async saveEcosystem() {
        const ecosystem = {
            name: this.templates[this.ecosystemType]?.name || '自定义生态系统',
            type: this.ecosystemType,
            species: this.species,
            foodRelations: this.foodRelations,
            generation: this.generation,
            environmentalToxin: this.environmentalToxin,
            climateFactor: this.climateFactor
        };

        try {
            let response;
            if (this.currentEcosystemId) {
                response = await fetch(`/api/ecosystems/${this.currentEcosystemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ecosystem)
                });
            } else {
                response = await fetch('/api/ecosystems', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ecosystem)
                });
            }

            const saved = await response.json();
            this.currentEcosystemId = saved.id;
            alert('保存成功！');
        } catch (error) {
            alert('保存失败：' + error.message);
        }
    }

    async showLoadModal() {
        try {
            const response = await fetch('/api/ecosystems');
            const ecosystems = await response.json();

            const saveList = document.getElementById('saveList');
            saveList.innerHTML = '';

            if (ecosystems.length === 0) {
                saveList.innerHTML = '<p>暂无存档</p>';
            } else {
                ecosystems.forEach(eco => {
                    const item = document.createElement('div');
                    item.className = 'save-item';
                    item.innerHTML = `
                        <div class="save-name">${eco.name}</div>
                        <div class="save-date">${new Date(eco.createdAt).toLocaleString()}</div>
                    `;
                    item.addEventListener('click', () => this.loadEcosystem(eco));
                    saveList.appendChild(item);
                });
            }

            document.getElementById('loadModal').classList.add('show');
        } catch (error) {
            alert('加载存档列表失败：' + error.message);
        }
    }

    hideLoadModal() {
        document.getElementById('loadModal').classList.remove('show');
    }

    loadEcosystem(eco) {
        this.pauseSimulation();
        this.ecosystemType = eco.type || 'grassland';
        this.species = eco.species || [];
        this.foodRelations = eco.foodRelations || [];
        this.generation = eco.generation || 0;
        this.currentEcosystemId = eco.id;
        this.environmentalToxin = eco.environmentalToxin || 0;
        this.climateFactor = eco.climateFactor || 1;

        document.getElementById('ecosystemType').value = this.ecosystemType;
        document.getElementById('generation').textContent = `世代: ${this.generation}`;
        this.updateSpeciesSelects();
        this.updateSpeciesList();
        this.renderAll();
        this.hideLoadModal();
    }
}

const simulator = new EcosystemSimulator();
