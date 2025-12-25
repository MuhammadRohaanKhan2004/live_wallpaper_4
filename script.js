const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hoverText = document.getElementById('hoverText');

const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
};

let time = 0;
let animationFrameId;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mouse.targetX = mouse.x;
    mouse.targetY = mouse.y;
}
resize();
window.addEventListener('resize', resize);

canvas.addEventListener('mousemove', e => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
});

canvas.addEventListener('mouseenter', () => {
    hoverText.style.display = 'block';
});

canvas.addEventListener('mouseleave', () => {
    hoverText.style.display = 'none';
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.vx = Math.random() * 0.5 - 0.25;
        this.vy = Math.random() * 0.5 - 0.25;
        this.life = Math.random() * 100;
        this.maxLife = this.life;
    }

    update(mx, my) {
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const force = (200 - dist) / 200;
            this.x += (dx / dist) * force * 3;
            this.y += (dy / dist) * force * 3;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.2;

        if (
            this.life <= 0 ||
            this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50
        ) {
            this.reset();
        }
    }

    draw() {
        const alpha = (this.life / this.maxLife) * 0.8;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const particles = Array.from({ length: 150 }, () => new Particle());

function drawMouseGlow(x, y) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 250);
    g.addColorStop(0, 'rgba(100,200,255,0.3)');
    g.addColorStop(0.5, 'rgba(150,100,255,0.15)');
    g.addColorStop(1, 'rgba(200,100,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 250, 0, Math.PI * 2);
    ctx.fill();
}

function drawAurora(offset, hue, alpha, influence) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 + offset);

    for (let x = 0; x <= canvas.width; x += 5) {
        const d = Math.abs(x - mouse.x);
        const m = Math.max(0, 1 - d / 300) * influence * 50;
        const y =
            canvas.height / 2 +
            offset +
            Math.sin((x + time * 2) * 0.005) * 80 +
            Math.sin((x + time * 3) * 0.01) * 40 +
            Math.cos((x + time * 1.5) * 0.008) * 60 +
            m * Math.sin(time * 0.1);
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
    grad.addColorStop(0, `hsla(${hue},80%,60%,${alpha})`);
    grad.addColorStop(0.5, `hsla(${hue + 30},70%,50%,${alpha * 0.6})`);
    grad.addColorStop(1, `hsla(${hue + 60},60%,40%,${alpha * 0.3})`);
    ctx.fillStyle = grad;
    ctx.fill();
}

function animate() {
    time++;

    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#0a0e27');
    bg.addColorStop(0.5, '#1a1535');
    bg.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMouseGlow(mouse.x, mouse.y);

    const influence = Math.min(Math.abs(mouse.y - canvas.height / 2) / canvas.height, 1);
    drawAurora(-100, time * 0.1 % 360, 0.25, influence);
    drawAurora(-50, (time * 0.1 + 120) % 360, 0.2, influence);
    drawAurora(0, (time * 0.1 + 240) % 360, 0.15, influence);

    particles.forEach(p => {
        p.update(mouse.x, mouse.y);
        p.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
}

animate();
