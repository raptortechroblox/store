const DISCORD_CLIENT_ID = "1305849017049026633"; // 填寫您的 Client ID
const REDIRECT_URI = window.location.origin + window.location.pathname; 

let productsData = [];

// 1. Fetch JSON Data
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        productsData = data;
        renderProducts();
    })
    .catch(error => console.error("Error loading products:", error));

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    let html = '';
    productsData.forEach(product => {
        html += `
            <div class="glass p-8 rounded-2xl border border-white/10 ${product.hoverClass} transition-colors group gsap-reveal flex flex-col hover-target">
                <div class="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-3xl ${product.colorClass} mb-6 group-hover:scale-110 transition-transform duration-500">
                    <iconify-icon icon="${product.icon}"></iconify-icon>
                </div>
                <h3 class="text-2xl font-bold mb-3">${product.title}</h3>
                <p class="text-white/50 font-mono text-sm mb-8 flex-grow">${product.description}</p>
                <div class="flex items-center justify-between border-t border-white/10 pt-6">
                    <div class="flex items-center gap-2 ${product.colorClass} font-mono font-bold text-lg">
                        <iconify-icon icon="simple-icons:roblox"></iconify-icon> ${product.price}
                    </div>
                    <a href="[https://discord.gg/KxY3NckXDq](https://discord.gg/KxY3NckXDq)" target="_blank" class="text-sm font-bold uppercase ${product.btnHoverClass} transition-colors flex items-center gap-1">
                        購買 <iconify-icon icon="solar:arrow-right-up-linear"></iconify-icon>
                    </a>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
    
    // 重新綁定 hover 特效 (因為 DOM 剛生成)
    bindHoverTargets();
}

// 2. Real Discord OAuth Flow
function setupDiscordAuth() {
    const loginBtn = document.getElementById('discord-login-btn');
    if(!loginBtn) return;

    function setLoginState(state, user = null) {
        if (state === 'loading') {
            loginBtn.classList.add('loading');
            loginBtn.innerHTML = `
                <iconify-icon icon="line-md:loading-loop" class="text-lg text-white"></iconify-icon>
                <span class="font-bold text-white">驗證中...</span>
            `;
        } else if (state === 'success') {
            loginBtn.classList.remove('loading');
            loginBtn.classList.add('logged-in');
            loginBtn.classList.remove('bg-white/5', 'hover:bg-[#5865F2]', 'border-white/10');
            loginBtn.classList.add('bg-[#5865F2]/20', 'border-[#5865F2]/50');
            
            loginBtn.innerHTML = `
                <img src="${user.avatar}" class="w-6 h-6 rounded-full bg-black/50 border border-[#5865F2]/50" alt="Avatar">
                <span class="font-bold text-white font-mono text-sm">${user.username}</span>
            `;
        }
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');

    if (accessToken) {
        setLoginState('loading');
        fetch('[https://discord.com/api/users/@me](https://discord.com/api/users/@me)', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
            if(data.id) {
                const avatarUrl = data.avatar 
                    ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${(data.discriminator || 0) % 5}.png`;
                setLoginState('success', { username: data.global_name || data.username, avatar: avatarUrl });
                window.history.replaceState(null, null, window.location.pathname);
            }
        }).catch(err => {
            console.error("登入驗證失敗:", err);
            loginBtn.classList.remove('loading');
        });
    }

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if(this.classList.contains('logged-in') || this.classList.contains('loading')) return;

        if (DISCORD_CLIENT_ID !== "") {
            const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
            window.location.href = oauthUrl;
        } else {
            setLoginState('loading');
            setTimeout(() => {
                setLoginState('success', { username: "TestUser", avatar: "[https://api.dicebear.com/7.x/avataaars/svg?seed=RaptorUser](https://api.dicebear.com/7.x/avataaars/svg?seed=RaptorUser)" });
                alert("提示：要啟用真實登入，請在 script.js 填入 DISCORD_CLIENT_ID。");
            }, 1000);
        }
    });
}
setupDiscordAuth();

// 3. GSAP Animations & Cursor
gsap.registerPlugin(ScrollTrigger);
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
const xSetDot = gsap.quickSetter(cursorDot, "x", "px");
const ySetDot = gsap.quickSetter(cursorDot, "y", "px");
const xSetOutline = gsap.quickSetter(cursorOutline, "x", "px");
const ySetOutline = gsap.quickSetter(cursorOutline, "y", "px");

window.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    xSetDot(mouseX);
    ySetDot(mouseY);
    gsap.to(cursorOutline, { x: mouseX, y: mouseY, duration: 0.15, ease: "power2.out" });
});

function bindHoverTargets() {
    document.querySelectorAll('.hover-target').forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(0, 216, 255, 0.1)';
        });
        target.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });
}
bindHoverTargets();

gsap.fromTo(".gsap-fade-up", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" });

gsap.utils.toArray('.gsap-reveal').forEach(elem => {
    gsap.fromTo(elem, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none none" }
    });
});

// 4. Three.js Background
window.addEventListener('load', () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 10;
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({ size: 0.015, color: 0x00D8FF, transparent: true, opacity: 0.4 });
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    let pmouseX = 0, pmouseY = 0;
    document.addEventListener('mousemove', (e) => {
        pmouseX = e.clientX / window.innerWidth - 0.5;
        pmouseY = e.clientY / window.innerHeight - 0.5;
    });

    const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001 + (pmouseX * 0.05);
        particlesMesh.rotation.x += 0.0005 + (pmouseY * 0.05);
        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
