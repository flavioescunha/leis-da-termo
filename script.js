const blowerBtn = document.getElementById('blowerBtn');
const fire = document.getElementById('fire');
const fireGlow = document.getElementById('fireGlow');
const water = document.getElementById('water');
const movingParts = document.getElementById('movingParts');
const steam = document.getElementById('steam');
const heatBar = document.getElementById('heatBar');
const pressureBar = document.getElementById('pressureBar');

let heat = 0;       // 0 to 100
let pressure = 0;   // 0 to 100

// Configurações
const heatIncreasePerClick = 18;
const heatDecreaseRate = 1.0;     // diminuição de calor por tick (a cada 100ms)
const boilingPoint = 40;          // ponto em que começa a gerar pressão
const pressureIncreaseRate = 0.5; // multiplicador de geração de pressão
const pressureDecreaseRate = 2.0; // perda de pressão natural

blowerBtn.addEventListener('click', () => {
    heat += heatIncreasePerClick;
    if (heat > 100) heat = 100;
    
    // Efeito do vento
    createWindParticle();
    
    updateVisuals();
});

function createWindParticle() {
    const wind = document.createElement('div');
    wind.classList.add('wind-particle');
    // Offset vertical aleatório entre -15px e +15px
    const offset = (Math.random() - 0.5) * 30;
    wind.style.top = `calc(50% + ${offset}px)`;
    blowerBtn.appendChild(wind);
    
    // Remove o elemento após a animação (300ms)
    setTimeout(() => wind.remove(), 300);
}

// Loop principal de física e renderização
setInterval(() => {
    // 1. Resfriamento Natural
    if (heat > 0) {
        // Quanto mais calor, maior a taxa de perda (dificulta chegar no máximo)
        // Isso simula a dissipação térmica (aumento do gradiente de temperatura)
        const dynamicDecrease = heatDecreaseRate + (heat * 0.04); 
        heat -= dynamicDecrease;
        if (heat < 0) heat = 0;
    }

    // 2. Geração e Perda de Pressão
    if (heat >= boilingPoint) {
        // Água está fervendo, gera pressão baseada no calor excedente
        pressure += (heat - boilingPoint) * pressureIncreaseRate * 0.1;
        if (pressure > 100) pressure = 100;
    } else {
        // Água esfriou, pressão cai rapidamente (vapor condensa)
        pressure -= pressureDecreaseRate;
        if (pressure < 0) pressure = 0;
    }

    updateVisuals();
}, 100);

function updateVisuals() {
    // 1. Atualizar Barras de Status
    heatBar.style.width = `${heat}%`;
    pressureBar.style.width = `${pressure}%`;
    
    // Cor da barra de calor: gradiente de laranja para vermelho
    if (heat > 80) {
        heatBar.style.backgroundColor = '#ef4444'; // Vermelho intenso
    } else if (heat > 40) {
        heatBar.style.backgroundColor = '#f97316'; // Laranja
    } else {
        heatBar.style.backgroundColor = '#fbbf24'; // Amarelo
    }

    // 2. Comportamento do Fogo
    if (heat > 0) {
        fire.classList.add('active');
        
        // Escala e tamanho dinâmico baseados no calor
        const scaleY = 0.2 + (heat / 100) * 1.5;
        const scaleX = 0.5 + (heat / 100) * 0.8;
        const opacity = 0.4 + (heat / 200); // 0.4 to 0.9
        
        // Usamos CSS variable para a animação de flicker usar a escala certa
        fire.style.setProperty('--scale-y', scaleY);
        fire.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
        fire.style.opacity = opacity;
        
        fireGlow.style.opacity = heat / 100;
    } else {
        fire.classList.remove('active');
        fire.style.transform = `scale(0)`;
        fire.style.opacity = 0;
        fireGlow.style.opacity = 0;
    }

    // 3. Comportamento da Água (Fervura)
    if (heat >= boilingPoint) {
        water.classList.add('boiling');
        
        // Muda a cor da água de azul para avermelhada dependendo do quão acima do ponto de fervura está
        const boilIntensity = Math.min(1, (heat - boilingPoint) / (100 - boilingPoint));
        // Interpolando entre azul (#38bdf8) e laranja/vermelho
        water.style.background = `linear-gradient(180deg, rgba(239, 68, 68, ${boilIntensity * 0.5}) 0%, #0284c7 100%)`;
    } else {
        water.classList.remove('boiling');
        water.style.background = `linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)`;
    }



    // 4. Comportamento do Êmbolo (Trabalho)
    // O cilindro tem 280px de altura total, água ocupa 100px.
    // O embolo repousa sobre a água. Ele pode subir até o topo.
    // Distância máxima de subida = 280 - 100(agua) - 70(embolo total) = ~110px.
    const maxLift = -150; // pixels (negativo para subir no CSS translate)
    const lift = (pressure / 100) * maxLift;
    
    movingParts.style.transform = `translateY(${lift}px)`;
    
    // 5. Comportamento do Vapor (Steam)
    if (pressure > 0 || heat >= boilingPoint) {
        steam.classList.add('active');
        // A altura do vapor preenche exatamente o espaço deixado pelo êmbolo subindo
        steam.style.height = `${Math.abs(lift)}px`;
    } else {
        steam.classList.remove('active');
        steam.style.height = '0px';
    }
}

// Lógica de Dedução da Fórmula
const nextStepBtn = document.getElementById('nextStepBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const steps = document.querySelectorAll('.step-box');
let currentStep = 0;

if (nextStepBtn && prevStepBtn) {
    nextStepBtn.addEventListener('click', () => {
        if (currentStep < steps.length) {
            // Força o reflow para reiniciar animações CSS
            steps[currentStep].classList.remove('visible');
            void steps[currentStep].offsetWidth;
            steps[currentStep].classList.add('visible');
            
            currentStep++;
            updateButtons();
            
            // Rola a tela suavemente para o novo passo
            steps[currentStep - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    prevStepBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            steps[currentStep].classList.remove('visible');
            updateButtons();
        }
    });

    function updateButtons() {
        if (currentStep === 0) {
            prevStepBtn.style.display = 'none';
        } else {
            prevStepBtn.style.display = 'inline-block';
        }
        
        if (currentStep === steps.length) {
            nextStepBtn.style.display = 'none';
        } else {
            nextStepBtn.style.display = 'inline-block';
            nextStepBtn.innerText = `Mostrar Próximo Passo (${currentStep}/${steps.length})`;
        }
    }
    
    updateButtons();
}

// ==========================================
// Tópico 2: Primeira Lei da Termodinâmica
// ==========================================

const arrowQ = document.getElementById('arrowQ');
const gasCloud = document.getElementById('gasCloud');
const piston1stLaw = document.getElementById('piston1stLaw');
const arrowTau = document.getElementById('arrowTau');
const uLabel = document.getElementById('uLabel');

function runFirstLawAnimation() {
    // Reset
    arrowQ.classList.remove('animating');
    gasCloud.classList.remove('heated');
    piston1stLaw.classList.remove('expand');
    arrowTau.classList.remove('animating');
    uLabel.innerHTML = 'U<sub>inicial</sub>';
    
    // Força reflow
    void arrowQ.offsetWidth;

    // Fase 1: Calor entra
    setTimeout(() => {
        arrowQ.classList.add('animating');
    }, 500);

    // Fase 2: Gás absorve calor, expande o êmbolo e realiza trabalho
    setTimeout(() => {
        gasCloud.classList.add('heated');
        piston1stLaw.classList.add('expand');
        arrowTau.classList.add('animating');
    }, 1500);

    // Fase 3: Variação da Energia Interna
    setTimeout(() => {
        uLabel.innerHTML = 'U<sub>final</sub>';
    }, 2500);
}

// Inicia o ciclo da animação da 1ª Lei (a cada 5 segundos)
if (arrowQ) {
    runFirstLawAnimation();
    setInterval(runFirstLawAnimation, 5000);
}

// ==========================================
// Tópico 3: Segunda Lei da Termodinâmica
// ==========================================

const toggleMachineBtn = document.getElementById('toggleMachineBtn');
const machine2ndLaw = document.getElementById('machine2ndLaw');
let machineIsOn = false;

if (toggleMachineBtn) {
    toggleMachineBtn.addEventListener('click', () => {
        machineIsOn = !machineIsOn;
        if (machineIsOn) {
            toggleMachineBtn.textContent = 'Desligar Máquina';
            toggleMachineBtn.style.background = 'linear-gradient(135deg, #64748b, #475569)';
            toggleMachineBtn.style.borderColor = '#94a3b8';
            machine2ndLaw.classList.add('running');
        } else {
            toggleMachineBtn.textContent = 'Ligar Máquina';
            toggleMachineBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            toggleMachineBtn.style.borderColor = '#f87171';
            machine2ndLaw.classList.remove('running');
        }
    });
}

// Lógica de visualização das respostas dos exercícios
function toggleAnswer(answerId) {
    const answerDiv = document.getElementById(answerId);
    if (!answerDiv) return;
    
    // Toggle visibility
    if (answerDiv.classList.contains('show')) {
        answerDiv.classList.remove('show');
    } else {
        answerDiv.classList.add('show');
    }
}
