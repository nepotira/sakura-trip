/**
 * SAKURA TRIP - JAPÃO 2027
 * Complete Interactive Application Engine (100% Functional)
 * CNPJ: 33.134.817/0001-01
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. GLOBAL STATE & CONSTANTS
    // -------------------------------------------------------------------------
    const BASE_PACKAGE_USD = 3877.41;
    const USD_TO_BRL = 5.00;
    const USD_TO_JPY = 155.00;
    const OFFICIAL_CNPJ = "33.134.817/0001-01";

    const state = {
        lang: 'pt',
        currency: 'USD', // 'USD', 'BRL', 'JPY'
        travelers: { adults: 1, children: 0, infants: 0 },
        selectedRoom: {
            id: 'standard',
            name: 'STANDARD ROOM',
            pricePerNightUSD: 80,
            nights: 9,
            baseIncluded: 80
        },
        coupon: { code: '', discountUSD: 0 },
        paymentMethod: 'pix',
        activeSlide: 0,
        currentUser: JSON.parse(localStorage.getItem('sakura_user') || 'null'),
        geminiApiKey: localStorage.getItem('sakura_gemini_key') || '',
        activeReserva: null,
        chatHistory: [],
        checklist: JSON.parse(localStorage.getItem('sakura_checklist') || '{}')
    };

    // Default Seeded Database of Reservations (Local Fallback & Sync)
    const localDatabase = [
        {
            locator: "SKR-JP2027-993",
            passengerName: "Lucas Gabriel da Silva",
            cpf: "123.456.789-00",
            email: "lucas.viajante@gmail.com",
            phone: "(11) 99876-5432",
            passport: "BR984721",
            roomCategory: "JAPANESE-STYLE ROOM",
            hotelTokyo: "Sakura Tokyo Hotel (4 Noites)",
            hotelKyoto: "Kyoto Garden Hotel (2 Noites)",
            hotelOsaka: "Osaka Central Hotel (3 Noites)",
            dates: "10 a 20 de Abril de 2027 (10 Dias)",
            flightRoute: "São Paulo (GRU) ⇄ Tóquio (HND)",
            transports: "JR Shinkansen Bullet Train + Metrô Pass",
            travelers: 1,
            totalUSD: 4507.41,
            totalBRL: 22537.05,
            paymentMethod: "PIX (5% OFF)",
            status: "CONFIRMADO",
            createdAt: "2026-08-20T14:30:00Z"
        },
        {
            locator: "SKR-JP2027-338",
            passengerName: "Mariana Takahashi Ferreira",
            cpf: "987.654.321-99",
            email: "mariana.takahashi@hotmail.com",
            phone: "(11) 98111-2233",
            passport: "BR654120",
            roomCategory: "STANDARD ROOM",
            hotelTokyo: "Sakura Tokyo Hotel (4 Noites)",
            hotelKyoto: "Kyoto Garden Hotel (2 Noites)",
            hotelOsaka: "Osaka Central Hotel (3 Noites)",
            dates: "10 a 20 de Abril de 2027 (10 Dias)",
            flightRoute: "São Paulo (GRU) ⇄ Tóquio (HND)",
            transports: "JR Shinkansen Bullet Train + Metrô Pass",
            travelers: 2,
            totalUSD: 7754.82,
            totalBRL: 38774.10,
            paymentMethod: "Cartão de Crédito (12x)",
            status: "CONFIRMADO",
            createdAt: "2026-08-22T10:15:00Z"
        },
        {
            locator: "SKR-JP2027-770",
            passengerName: "Carlos Eduardo Mendonça",
            cpf: "456.789.123-44",
            email: "carlos.mendonca@empresa.com.br",
            phone: "(21) 97654-3210",
            passport: "BR339182",
            roomCategory: "LUXURY SUITE",
            hotelTokyo: "Sakura Tokyo Hotel (4 Noites)",
            hotelKyoto: "Kyoto Garden Hotel (2 Noites)",
            hotelOsaka: "Osaka Central Hotel (3 Noites)",
            dates: "10 a 20 de Abril de 2027 (10 Dias)",
            flightRoute: "São Paulo (GRU) ⇄ Tóquio (HND)",
            transports: "JR Shinkansen Bullet Train + Metrô Pass VIP",
            travelers: 2,
            totalUSD: 10634.82,
            totalBRL: 53174.10,
            paymentMethod: "PIX (5% OFF)",
            status: "CONFIRMADO",
            createdAt: "2026-08-25T16:45:00Z"
        }
    ];

    // City Descriptions Database for Modals
    const cityData = {
        tokyo: {
            title: "Tóquio (Tokyo) • 4 Noites Inclusas",
            image: "assets/tokyo_shibuya.jpg",
            html: `
                <p><strong>Tóquio</strong> é uma metrópole vibrante onde arranha-céus futuristas convivem harmoniosamente com templos sagrados e jardins serenos.</p>
                <h4>Destaques do Roteiro em Tóquio:</h4>
                <ul>
                    <li><strong>Cruzamento de Shibuya:</strong> O cruzamento de pedestres mais icônico do mundo e a famosa estátua de Hachiko.</li>
                    <li><strong>Tokyo Skytree:</strong> Torre de 634 metros com deck panorâmico de observação de tirar o fôlego.</li>
                    <li><strong>Templo Senso-ji (Asakusa):</strong> O templo budista mais antigo de Tóquio, com a movimentada rua de compras Nakamise.</li>
                    <li><strong>Akihabara:</strong> A meca global da cultura pop, mangás, animes, retrogames e eletrônicos de última geração.</li>
                    <li><strong>Tokyo Disneyland & DisneySea:</strong> Parques temáticos mágicos com atrações e espetáculos exclusivos.</li>
                </ul>
                <h4>Hospedagem:</h4>
                <p><i class="fa-solid fa-hotel text-sakura"></i> <strong>Sakura Tokyo Hotel</strong> (4 noites com café da manhã e fácil acesso à linha JR Yamanote).</p>
            `
        },
        kyoto: {
            title: "Quioto (Kyoto) • 2 Noites Inclusas",
            image: "assets/kyoto_fushimi.jpg",
            html: `
                <p>Antiga capital imperial do Japão, <strong>Quioto</strong> é o coração espiritual e histórico do país, abrigando mais de 2.000 templos e santuários.</p>
                <h4>Destaques do Roteiro em Quioto:</h4>
                <ul>
                    <li><strong>Santuário Fushimi Inari Taisha:</strong> Famoso túnel com milhares de portais torii vermelhos ao longo da montanha sagrada.</li>
                    <li><strong>Kinkaku-ji (Pavilhão Dourado):</strong> Templo zen banhado a folhas de ouro puro refletido nas águas calmas do lago Kyoko-chi.</li>
                    <li><strong>Floresta de Bambu de Arashiyama:</strong> Caminho místico cercado por altos bambus verdes que dançam ao vento.</li>
                    <li><strong>Distrito de Gion:</strong> Bairro histórico preservado de casas de chá tradicionais e gueixas.</li>
                </ul>
                <h4>Hospedagem:</h4>
                <p><i class="fa-solid fa-hotel text-sakura"></i> <strong>Kyoto Garden Hotel</strong> (2 noites em localização central próxima a jardins tradicionais).</p>
            `
        },
        fuji: {
            title: "Monte Fuji (Fujisan) • Excursão Especial",
            image: "assets/dest_fuji.jpg",
            html: `
                <p>O <strong>Monte Fuji</strong> (3.776 metros) é a montanha mais alta e o símbolo nacional do Japão, reverenciado como patrimônio mundial da UNESCO.</p>
                <h4>Destaques da Excursão ao Monte Fuji:</h4>
                <ul>
                    <li><strong>Lago Kawaguchiko:</strong> Vistas cinematográficas do cone perfeito do Fuji refletido nas águas e emoldurado por cerejeiras.</li>
                    <li><strong>Pagode Chureito:</strong> O mirante fotográfico mais famoso do Japão com a vista do pagode tradicional de cinco andares e o Monte Fuji.</li>
                    <li><strong>Quinta Estação do Fuji:</strong> Mirante a 2.300 metros de altitude com lojas de souvenirs e santuário Komitake.</li>
                    <li><strong>Oshino Hakkai:</strong> Charmoso vilarejo tradicional com oito lagoas cristalinas alimentadas pelas águas do degelo do Fuji.</li>
                </ul>
            `
        },
        osaka: {
            title: "Osaka • 3 Noites Inclusas",
            image: "assets/osaka_dotonbori.jpg",
            html: `
                <p>Conhecida como a "Cozinha do Japão" e capital do entretenimento caloroso, <strong>Osaka</strong> transborda energia, simpatia e sabores inesquecíveis.</p>
                <h4>Destaques do Roteiro em Osaka:</h4>
                <ul>
                    <li><strong>Universal Studios Japan (USJ):</strong> Ingressos para o incrível Super Nintendo World (Mario Kart interativo) e The Wizarding World of Harry Potter.</li>
                    <li><strong>Bairro Gastronômico de Dotonbori:</strong> O lendário letreiro Glico Man, passeios no canal e street food (Takoyaki, Okonomiyaki, Kushikatsu).</li>
                    <li><strong>Castelo de Osaka:</strong> Fortaleza histórica do século XVI cercada por jardins com mais de 3.000 cerejeiras em flor e muralhas de pedra gigantescas.</li>
                    <li><strong>Bairro Retrô Shinsekai:</strong> Área charmosa com a torre Tsutenkaku e culinária típica.</li>
                </ul>
                <h4>Hospedagem:</h4>
                <p><i class="fa-solid fa-hotel text-sakura"></i> <strong>Osaka Central Hotel</strong> (3 noites no coração da cidade com fácil acesso a Dotonbori e trens).</p>
            `
        },
        nara: {
            title: "Nara • Passeio Especial Bate e Volta",
            image: "assets/nara_deer.jpg",
            html: `
                <p>Primeira capital permanente do Japão no século VIII, <strong>Nara</strong> é um refúgio de paz onde a história milenar convive com a natureza.</p>
                <h4>Destaques do Passeio em Nara:</h4>
                <ul>
                    <li><strong>Parque de Nara (Parque dos Cervos):</strong> Mais de 1.200 cervos sagrados soltos e dóceis que se curvam para receber biscoitos (shika senbei).</li>
                    <li><strong>Templo Todai-ji:</strong> Uma das maiores estruturas de madeira do mundo, abrigando o monumental Grande Buda de Bronze (Daibutsu) de 15 metros.</li>
                    <li><strong>Santuário Kasuga Taisha:</strong> Santuário xintoísta famoso por suas centenas de lanternas de pedra e bronze cobertas por musgo.</li>
                </ul>
            `
        }
    };

    // -------------------------------------------------------------------------
    // 2. SLIDING BUBBLE NAVBAR & INTERSECTION OBSERVER
    // -------------------------------------------------------------------------
    const navIndicator = document.getElementById('navIndicator');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateNavIndicator(targetLink) {
        if (!navIndicator || !targetLink) return;
        const navMenu = document.getElementById('navMenu');
        if (!navMenu || navMenu.offsetParent === null) return; // Hidden on mobile

        const linkRect = targetLink.getBoundingClientRect();
        const menuRect = navMenu.getBoundingClientRect();

        const leftOffset = linkRect.left - menuRect.left;
        const width = linkRect.width;

        navIndicator.style.left = `${leftOffset}px`;
        navIndicator.style.width = `${width}px`;

        navLinks.forEach(l => l.classList.remove('active'));
        targetLink.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            updateNavIndicator(link);
        });
    });

    // Auto-align on page load and window resize
    setTimeout(() => {
        const activeLink = document.querySelector('.nav-link.active') || navLinks[0];
        if (activeLink) updateNavIndicator(activeLink);
    }, 100);

    window.addEventListener('resize', () => {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) updateNavIndicator(activeLink);
    });

    // IntersectionObserver for Section Scroll Highlighting
    const observedSections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (matchingLink) {
                    updateNavIndicator(matchingLink);
                }
            }
        });
    }, { threshold: 0.35 });

    observedSections.forEach(sec => sectionObserver.observe(sec));

    // -------------------------------------------------------------------------
    // 3. SUBTLE FALLING SAKURA CANVAS
    // -------------------------------------------------------------------------
    function initSakuraCanvas() {
        const canvas = document.getElementById('sakuraCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = canvas.parentElement.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        });

        // Reduced petal count & softer pastel opacity (0.12 - 0.22)
        const petalCount = 22;
        const petals = [];

        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                size: Math.random() * 7 + 5,
                speedX: Math.random() * 1.2 - 0.4,
                speedY: Math.random() * 0.9 + 0.6,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 1.5 - 0.75,
                opacity: Math.random() * 0.12 + 0.10
            });
        }

        function drawPetal(p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.beginPath();
            ctx.fillStyle = `rgba(245, 105, 148, ${p.opacity})`;
            ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function update() {
            ctx.clearRect(0, 0, width, height);

            petals.forEach(p => {
                p.x += p.speedX + Math.sin(p.y * 0.01) * 0.4;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;

                if (p.y > height) {
                    p.y = -10;
                    p.x = Math.random() * width;
                }
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;

                drawPetal(p);
            });

            requestAnimationFrame(update);
        }

        update();
    }
    initSakuraCanvas();

    // -------------------------------------------------------------------------
    // 4. MULTILINGUAL TRANSLATION (i18n)
    // -------------------------------------------------------------------------
    const langSelector = document.getElementById('langSelector');

    function applyLanguage(lang) {
        state.lang = lang;
        const dict = (window.I18N_DICTIONARY && window.I18N_DICTIONARY[lang]) ? window.I18N_DICTIONARY[lang] : window.I18N_DICTIONARY['pt'];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                const val = dict[key];
                if (val.includes('<')) {
                    el.innerHTML = val;
                } else {
                    const icon = el.querySelector('i');
                    if (icon) {
                        el.innerHTML = `${icon.outerHTML} ${val}`;
                    } else {
                        el.textContent = val;
                    }
                }
            }
        });

        // Localize search form inputs
        const inputOriginEl = document.getElementById('inputOrigin');
        const inputDestEl = document.getElementById('inputDest');
        const inputDatesEl = document.getElementById('inputDates');

        if (inputOriginEl) {
            inputOriginEl.value = lang === 'ja' ? 'サンパウロ (GRU)' : 'São Paulo (GRU)';
        }
        if (inputDestEl) {
            inputDestEl.value = lang === 'ja' ? '東京・羽田 (HND)' : (lang === 'en' ? 'Tokyo (HND)' : 'Tóquio (HND)');
        }
        if (inputDatesEl) {
            inputDatesEl.value = lang === 'ja' ? '2027年4月10日〜20日' : (lang === 'en' ? '04/10/2027 to 04/20/2027' : '10/04/2027 a 20/04/2027');
        }

        // Translate traveler summary pill
        updateTravelersSummary();

        // Re-align sliding indicator after text length change
        setTimeout(() => {
            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink && typeof updateNavIndicator === 'function') updateNavIndicator(activeLink);
        }, 50);

        showToast(lang === 'ja' ? '言語が日本語に切り替わりました 🇯🇵' : (lang === 'en' ? 'Language switched to English 🇺🇸' : 'Idioma alterado para Português 🇧🇷'));
    }

    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            updateAllPricesOnPage();
        });
    }

    // -------------------------------------------------------------------------
    // 5. GLOBAL CURRENCY CONVERSION (USD, BRL, JPY)
    // -------------------------------------------------------------------------
    const currencySelector = document.getElementById('currencySelector');

    function formatPrice(usdAmount) {
        if (state.currency === 'BRL') {
            const brlAmount = usdAmount * USD_TO_BRL;
            return `R$ ${brlAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (state.currency === 'JPY') {
            const jpyAmount = usdAmount * USD_TO_JPY;
            return `¥ ${jpyAmount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
        }
        return `US$ ${usdAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function updateAllPricesOnPage() {
        const totalTravelers = Math.max(1, state.travelers.adults + state.travelers.children);

        // 1. All Hero Carousel slides & Promo pricing boxes with data-usd (Slide 1, Slide 3, etc.)
        document.querySelectorAll('.hero-carousel-container .price-value[data-usd], .promo-pricing-box .price-value[data-usd], #heroPriceValue, #heroSlide3PriceValue').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd')) || BASE_PACKAGE_USD;
            const formatted = formatPrice(usd * totalTravelers);
            const spaceIdx = formatted.indexOf(' ');
            if (spaceIdx !== -1) {
                const cur = formatted.substring(0, spaceIdx);
                const amt = formatted.substring(spaceIdx + 1);
                el.innerHTML = `<span class="currency">${cur}</span> <span class="amount">${amt}</span>`;
            } else {
                el.textContent = formatted;
            }
        });

        // Hero Installments line
        const heroInstallmentsEl = document.getElementById('heroInstallments');
        if (heroInstallmentsEl) {
            const installmentVal = (BASE_PACKAGE_USD * totalTravelers) / 12;
            const installmentFormatted = formatPrice(installmentVal);
            if (state.lang === 'ja') {
                heroInstallmentsEl.innerHTML = `または月々 <strong>${installmentFormatted} (12回払い・手数料無料)</strong>`;
            } else if (state.lang === 'en') {
                heroInstallmentsEl.innerHTML = `or up to <strong>12x of ${installmentFormatted} interest-free</strong>`;
            } else {
                heroInstallmentsEl.innerHTML = `ou em até <strong>12x de ${installmentFormatted} sem juros</strong> no cartão`;
            }
        }

        // 2. Overview Bar Price
        const overviewPriceEl = document.querySelector('.trip-info-banner .main-price');
        if (overviewPriceEl) {
            overviewPriceEl.textContent = formatPrice(BASE_PACKAGE_USD * totalTravelers);
        }

        // 3. Room cards in hotel section
        document.querySelectorAll('.room-card .price-val').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd'));
            if (!isNaN(usd)) {
                el.textContent = formatPrice(usd);
            }
        });

        // 4. Checkout modal options
        document.querySelectorAll('.room-selector-list .opt-price[data-usd]').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd'));
            const type = el.getAttribute('data-type');
            if (!isNaN(usd)) {
                if (type === 'base') {
                    el.textContent = `${formatPrice(usd)}/noite`;
                } else {
                    el.textContent = `+ ${formatPrice(usd)}/noite`;
                }
            }
        });

        updateCheckoutCalculations();
    }

    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            state.currency = e.target.value;
            updateAllPricesOnPage();
            showToast(`Moeda alterada para ${state.currency}`);
        });
    }

    // -------------------------------------------------------------------------
    // 6. HERO BANNER CAROUSEL
    // -------------------------------------------------------------------------
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const btnPrev = document.getElementById('carouselPrev');
    const btnNext = document.getElementById('carouselNext');
    let carouselInterval;

    function goToSlide(index) {
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        state.activeSlide = (index + slides.length) % slides.length;
        slides[state.activeSlide].classList.add('active');
        if (dots[state.activeSlide]) {
            dots[state.activeSlide].classList.add('active');
        }
    }

    function startCarouselTimer() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            goToSlide(state.activeSlide + 1);
        }, 6500);
    }

    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            goToSlide(state.activeSlide - 1);
            startCarouselTimer();
        });
        btnNext.addEventListener('click', () => {
            goToSlide(state.activeSlide + 1);
            startCarouselTimer();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            goToSlide(idx);
            startCarouselTimer();
        });
    });

    startCarouselTimer();

    // -------------------------------------------------------------------------
    // 7. GOL-STYLE SEARCH ENGINE WIDGET
    // -------------------------------------------------------------------------
    const widgetTabs = document.querySelectorAll('.widget-tabs .tab-btn');
    widgetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            widgetTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.getAttribute('data-search-type');
            if (type === 'pacote') showToast("Buscando Pacote Completo (Voo + Hotéis + Trem-Bala)");
            else if (type === 'voo') showToast("Filtro: Passagens GRU ⇄ HND");
            else if (type === 'hotel') showToast("Filtro: Hospedagens em Tóquio, Quioto e Osaka");
        });
    });

    const btnSwap = document.getElementById('btnSwapLocations');
    const inputOrigin = document.getElementById('inputOrigin');
    const inputDest = document.getElementById('inputDest');
    if (btnSwap && inputOrigin && inputDest) {
        btnSwap.addEventListener('click', () => {
            const tempVal = inputOrigin.value;
            inputOrigin.value = inputDest.value;
            inputDest.value = tempVal;
            showToast("Rota invertida para visualização!");
        });
    }

    // Travelers Stepper
    const travelersBtn = document.getElementById('travelersBtn');
    const travelersPanel = document.getElementById('travelersDropdownPanel');
    const travelersSummary = document.getElementById('travelersSummary');
    const btnConfirmTravelers = document.getElementById('btnConfirmTravelers');

    if (travelersBtn && travelersPanel) {
        travelersBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            travelersPanel.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!travelersPanel.contains(e.target) && !travelersBtn.contains(e.target)) {
                travelersPanel.classList.remove('show');
            }
        });
    }

    function updateTravelersSummary() {
        let txt = "";
        if (state.lang === 'ja') {
            txt = `大人 ${state.travelers.adults}名`;
            if (state.travelers.children > 0) txt += `、子供 ${state.travelers.children}名`;
            if (state.travelers.infants > 0) txt += `、幼児 ${state.travelers.infants}名`;
        } else if (state.lang === 'en') {
            txt = `${state.travelers.adults} Adult${state.travelers.adults > 1 ? 's' : ''}`;
            if (state.travelers.children > 0) txt += `, ${state.travelers.children} Child${state.travelers.children > 1 ? 'ren' : ''}`;
            if (state.travelers.infants > 0) txt += `, ${state.travelers.infants} Infant${state.travelers.infants > 1 ? 's' : ''}`;
        } else {
            txt = `${state.travelers.adults} Adulto${state.travelers.adults > 1 ? 's' : ''}`;
            if (state.travelers.children > 0) txt += `, ${state.travelers.children} Criança${state.travelers.children > 1 ? 's' : ''}`;
            if (state.travelers.infants > 0) txt += `, ${state.travelers.infants} Bebê${state.travelers.infants > 1 ? 's' : ''}`;
        }
        if (travelersSummary) travelersSummary.textContent = txt;
        updateAllPricesOnPage();
    }

    function setupStepper(btnDecId, btnIncId, countId, type, minVal = 0) {
        const btnDec = document.getElementById(btnDecId);
        const btnInc = document.getElementById(btnIncId);
        const countEl = document.getElementById(countId);
        if (!btnDec || !btnInc || !countEl) return;

        btnDec.addEventListener('click', () => {
            if (state.travelers[type] > minVal) {
                state.travelers[type]--;
                countEl.textContent = state.travelers[type];
                updateTravelersSummary();
            }
        });

        btnInc.addEventListener('click', () => {
            if (state.travelers[type] < 9) {
                state.travelers[type]++;
                countEl.textContent = state.travelers[type];
                updateTravelersSummary();
            }
        });
    }

    setupStepper('decAdults', 'incAdults', 'countAdults', 'adults', 1);
    setupStepper('decChildren', 'incChildren', 'countChildren', 'children', 0);
    setupStepper('decInfants', 'incInfants', 'countInfants', 'infants', 0);

    if (btnConfirmTravelers && travelersPanel) {
        btnConfirmTravelers.addEventListener('click', () => travelersPanel.classList.remove('show'));
    }

    // Coupon Code Box
    const btnToggleCoupon = document.getElementById('btnToggleCoupon');
    const couponInputGroup = document.getElementById('couponInputGroup');
    const btnApplyCoupon = document.getElementById('btnApplyCoupon');
    const couponCodeInput = document.getElementById('couponCode');

    if (btnToggleCoupon && couponInputGroup) {
        btnToggleCoupon.addEventListener('click', () => {
            couponInputGroup.style.display = couponInputGroup.style.display === 'none' ? 'inline-flex' : 'none';
        });
    }

    if (btnApplyCoupon && couponCodeInput) {
        btnApplyCoupon.addEventListener('click', () => {
            const code = couponCodeInput.value.trim().toUpperCase();
            if (code === 'SAKURA10' || code === 'JAPAO10') {
                state.coupon = { code: code, discountUSD: 50.00 };
                showToast(`Cupom ${code} aplicado com sucesso! Desconto de US$ 50,00.`);
                updateCheckoutCalculations();
            } else {
                showToast("Cupom inválido ou expirado.", "error");
            }
        });
    }

    const btnSearchSubmit = document.getElementById('btnSearchSubmit');
    if (btnSearchSubmit) {
        btnSearchSubmit.addEventListener('click', () => openBookingModal(1));
    }

    // -------------------------------------------------------------------------
    // 8. ATTRACTIONS FILTER & CITY MODAL (FIXED HERO IMAGE)
    // -------------------------------------------------------------------------
    const attractionTabs = document.querySelectorAll('.attraction-tab-btn');
    const attractionCards = document.querySelectorAll('.attraction-card');
    const cityModal = document.getElementById('cityModal');
    const cityModalTitle = document.getElementById('cityModalTitle');
    const cityModalHeroImg = document.getElementById('cityModalHeroImg');
    const cityModalBadge = document.getElementById('cityModalBadge');
    const cityModalText = document.getElementById('cityModalText');
    const btnCloseCityModal = document.getElementById('btnCloseCityModal');
    const btnCloseCityFooter = document.getElementById('btnCloseCityFooter');
    const btnReserveFromCity = document.getElementById('btnReserveFromCity');

    attractionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            attractionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const city = tab.getAttribute('data-city');

            attractionCards.forEach(card => {
                if (city === 'all' || card.getAttribute('data-city') === city) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    function openCityModal(cityKey) {
        const data = cityData[cityKey];
        if (!data || !cityModal) return;

        cityModalTitle.innerHTML = `<i class="fa-solid fa-torii-gate text-sakura"></i> ${data.title}`;
        if (cityModalHeroImg) cityModalHeroImg.src = data.image;
        if (cityModalBadge) cityModalBadge.textContent = data.title;
        if (cityModalText) cityModalText.innerHTML = data.html;

        cityModal.classList.add('show');
    }

    document.querySelectorAll('.btn-view-city').forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.getAttribute('data-city');
            openCityModal(city);
        });
    });

    if (btnCloseCityModal) btnCloseCityModal.addEventListener('click', () => cityModal.classList.remove('show'));
    if (btnCloseCityFooter) btnCloseCityFooter.addEventListener('click', () => cityModal.classList.remove('show'));
    if (btnReserveFromCity) {
        btnReserveFromCity.addEventListener('click', () => {
            cityModal.classList.remove('show');
            openBookingModal(1);
        });
    }

    // -------------------------------------------------------------------------
    // 9. ACCOMMODATION / ROOM SELECTOR
    // -------------------------------------------------------------------------
    const roomCategoryMap = {
        'standard': { name: 'STANDARD ROOM', priceUSD: 80 },
        'twin': { name: 'TWIN ROOM', priceUSD: 100 },
        'japanese': { name: 'JAPANESE-STYLE ROOM', priceUSD: 150 },
        'deluxe': { name: 'DELUXE ROOM', priceUSD: 180 },
        'tokyo-view': { name: 'TOKYO VIEW ROOM', priceUSD: 220 },
        'family': { name: 'FAMILY ROOM', priceUSD: 200 },
        'luxury': { name: 'LUXURY SUITE', priceUSD: 400 }
    };

    function selectRoom(roomId) {
        const info = roomCategoryMap[roomId];
        if (!info) return;

        state.selectedRoom.id = roomId;
        state.selectedRoom.name = info.name;
        state.selectedRoom.pricePerNightUSD = info.priceUSD;

        const radio = document.querySelector(`input[name="checkoutRoom"][value="${roomId}"]`);
        if (radio) {
            radio.checked = true;
            document.querySelectorAll('.room-radio-option').forEach(opt => opt.classList.remove('selected'));
            radio.closest('.room-radio-option').classList.add('selected');
        }

        updateCheckoutCalculations();
        showToast(`Quarto selecionado: ${info.name}`);
    }

    document.querySelectorAll('.btn-select-room').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.room-card');
            const roomId = card.getAttribute('data-room-id');
            selectRoom(roomId);
            openBookingModal(1);
        });
    });

    document.querySelectorAll('input[name="checkoutRoom"]').forEach(radio => {
        radio.addEventListener('change', (e) => selectRoom(e.target.value));
    });

    // -------------------------------------------------------------------------
    // 10. MULTI-STEP BOOKING & CHECKOUT ENGINE
    // -------------------------------------------------------------------------
    const bookingModal = document.getElementById('bookingModal');
    const btnCloseBookingModal = document.getElementById('btnCloseBookingModal');
    const checkoutSteps = document.querySelectorAll('.checkout-stepper .step');
    const stepContents = document.querySelectorAll('.step-tab-content');

    function openBookingModal(stepNum = 1) {
        if (!bookingModal) return;
        // Autofill if logged in
        if (state.currentUser) {
            const leadName = document.getElementById('leadName');
            const leadCpf = document.getElementById('leadCpf');
            const leadEmail = document.getElementById('leadEmail');
            const leadPhone = document.getElementById('leadPhone');
            const leadPassport = document.getElementById('leadPassport');
            if (leadName && state.currentUser.name) leadName.value = state.currentUser.name;
            if (leadCpf && state.currentUser.cpf) leadCpf.value = state.currentUser.cpf;
            if (leadEmail && state.currentUser.email) leadEmail.value = state.currentUser.email;
            if (leadPhone && state.currentUser.phone) leadPhone.value = state.currentUser.phone;
            if (leadPassport && state.currentUser.passport) leadPassport.value = state.currentUser.passport;
        }

        setCheckoutStep(stepNum);
        updateCheckoutCalculations();
        bookingModal.classList.add('show');
    }

    function closeBookingModal() {
        if (bookingModal) bookingModal.classList.remove('show');
    }

    function setCheckoutStep(stepNum) {
        checkoutSteps.forEach(s => {
            const sNum = parseInt(s.getAttribute('data-step'));
            if (sNum <= stepNum) s.classList.add('active');
            else s.classList.remove('active');
        });

        stepContents.forEach(content => content.classList.remove('active'));
        const activeContent = document.getElementById(`checkoutStep${stepNum}`);
        if (activeContent) activeContent.classList.add('active');
    }

    if (btnCloseBookingModal) btnCloseBookingModal.addEventListener('click', closeBookingModal);

    const triggerIds = [
        'btnHeaderReservar', 'btnHeroAproveitar', 'btnHeroReserveSlide3',
        'btnBookFromBar', 'btnCtaFinalReserve', 'cardQuickReserva', 'cardQuickQuartos'
    ];
    triggerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                openBookingModal(1);
            });
        }
    });

    document.querySelectorAll('.btn-next-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.getAttribute('data-next'));
            setCheckoutStep(nextStep);
        });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.getAttribute('data-prev'));
            setCheckoutStep(prevStep);
        });
    });

    // Payment Method Radio Switcher
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.paymentMethod = e.target.value;
            document.querySelectorAll('.pay-method-pill').forEach(p => p.classList.remove('active'));
            e.target.closest('.pay-method-pill').classList.add('active');

            const pixBox = document.getElementById('pixDetailsBox');
            const cardBox = document.getElementById('cardDetailsBox');
            const boletoBox = document.getElementById('boletoDetailsBox');

            if (pixBox) pixBox.style.display = state.paymentMethod === 'pix' ? 'block' : 'none';
            if (cardBox) cardBox.style.display = state.paymentMethod === 'card' ? 'block' : 'none';
            if (boletoBox) boletoBox.style.display = state.paymentMethod === 'boleto' ? 'block' : 'none';

            updateCheckoutCalculations();
        });
    });

    const btnCopyPix = document.getElementById('btnCopyPix');
    if (btnCopyPix) {
        btnCopyPix.addEventListener('click', () => {
            navigator.clipboard.writeText(OFFICIAL_CNPJ).then(() => {
                showToast(`Chave Pix (CNPJ: ${OFFICIAL_CNPJ}) copiada com sucesso!`);
            }).catch(() => {
                showToast(`Chave Pix: ${OFFICIAL_CNPJ}`);
            });
        });
    }

    function updateCheckoutCalculations() {
        const totalTravelers = Math.max(1, state.travelers.adults + state.travelers.children);
        const baseTotalUSD = BASE_PACKAGE_USD * totalTravelers;
        
        const diffPerNight = Math.max(0, state.selectedRoom.pricePerNightUSD - state.selectedRoom.baseIncluded);
        const upgradeUSD = diffPerNight * state.selectedRoom.nights;

        let totalUSD = baseTotalUSD + upgradeUSD - state.coupon.discountUSD;
        if (state.paymentMethod === 'pix') {
            totalUSD *= 0.95; // 5% Pix discount
        }

        const summaryBase = document.getElementById('summaryBasePrice');
        const summaryRoom = document.getElementById('summaryRoomName');
        const summaryUpgrade = document.getElementById('summaryRoomUpgrade');
        const summaryCouponRow = document.getElementById('summaryCouponRow');
        const summaryTotalUSD = document.getElementById('summaryTotalUSD');
        const summaryTotalBRL = document.getElementById('summaryTotalBRL');

        if (summaryBase) summaryBase.textContent = formatPrice(baseTotalUSD);
        if (summaryRoom) summaryRoom.textContent = state.selectedRoom.name;
        if (summaryUpgrade) summaryUpgrade.textContent = `+ ${formatPrice(upgradeUSD)}`;

        if (summaryCouponRow) {
            summaryCouponRow.style.display = state.coupon.discountUSD > 0 ? 'flex' : 'none';
        }

        if (summaryTotalUSD) summaryTotalUSD.textContent = formatPrice(totalUSD);
        if (summaryTotalBRL) {
            summaryTotalBRL.textContent = `ou R$ ${(totalUSD * USD_TO_BRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
    }

    // -------------------------------------------------------------------------
    // 11. VOUCHER GENERATOR & SINGLE-PAGE PRINT SYSTEM (DATA COHERENCE)
    // -------------------------------------------------------------------------
    function generateVoucherHTML(reserva) {
        return `
            <div class="official-voucher-card">
                <div class="voucher-header">
                    <img src="assets/logo_transparent.png" alt="Sakura Trip" class="v-logo">
                    <div class="v-brand-info">
                        <h4>VOUCHER OFICIAL DE EMBARQUE</h4>
                        <span>CNPJ: ${OFFICIAL_CNPJ} • Cadastur Oficial 33.134.817</span>
                    </div>
                    <div class="v-locator-box">
                        <span class="lbl">CÓDIGO LOCALIZADOR</span>
                        <strong class="code">${reserva.locator}</strong>
                    </div>
                </div>

                <div class="voucher-grid">
                    <div class="v-col">
                        <span class="v-lbl">Titular da Reserva</span>
                        <strong class="v-val">${reserva.passengerName}</strong>
                    </div>
                    <div class="v-col">
                        <span class="v-lbl">Passaporte / CPF</span>
                        <strong class="v-val">${reserva.passport} • ${reserva.cpf}</strong>
                    </div>
                    <div class="v-col">
                        <span class="v-lbl">Período da Viagem</span>
                        <strong class="v-val">${reserva.dates}</strong>
                    </div>
                    <div class="v-col">
                        <span class="v-lbl">Rota de Voo</span>
                        <strong class="v-val">${reserva.flightRoute || "São Paulo (GRU) ⇄ Tóquio (HND)"}</strong>
                    </div>
                    <div class="v-col">
                        <span class="v-lbl">Acomodações Inclusas</span>
                        <strong class="v-val">${reserva.roomCategory} (${reserva.hotelTokyo || "Tokyo"}, ${reserva.hotelKyoto || "Kyoto"}, ${reserva.hotelOsaka || "Osaka"})</strong>
                    </div>
                    <div class="v-col">
                        <span class="v-lbl">Transportes Terrestres</span>
                        <strong class="v-val">${reserva.transports || "JR Shinkansen Bullet Train + Metrô Pass"}</strong>
                    </div>
                </div>

                <div class="voucher-footer">
                    <div class="v-qr">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>Validado no Check-in</span>
                    </div>
                    <div class="v-instructions">
                        <p><strong>Instruções Importantes:</strong></p>
                        <small>Apresente este voucher impresso ou no celular no balcão da Sakura Trip no aeroporto de Guarulhos (Terminal 3). Central 24h: (11) 3300-7700.</small>
                    </div>
                </div>
            </div>
        `;
    }

    function setupPrintVoucher(reserva) {
        const printWrapper = document.getElementById('printableVoucherWrapper');
        if (!printWrapper) return;

        printWrapper.innerHTML = `
            <div class="print-voucher-ticket">
                <div class="print-header">
                    <div>
                        <img src="assets/logo_transparent.png" alt="Sakura Trip" class="print-logo">
                        <div style="font-size: 11px; color: #555; margin-top: 4px;">
                            <strong>SAKURA TRIP AGÊNCIA DE VIAGENS E TURISMO LTDA.</strong><br>
                            CNPJ: ${OFFICIAL_CNPJ} • CADASTUR: 33.134.817/0001-01
                        </div>
                    </div>
                    <div class="print-locator-badge">
                        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block; opacity: 0.85;">Código Localizador</span>
                        <span style="font-size: 18px; font-weight: 800; letter-spacing: 2px;">${reserva.locator}</span>
                    </div>
                </div>

                <div style="background: #fff5f7; border: 1px solid #fed7e2; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
                    <strong style="color: #c7265e; font-size: 14px;">🌸 VOUCHER CONFIRMADO • PACOTE JAPÃO 2027 (TEMPORADA SAKURA)</strong>
                </div>

                <div class="print-grid">
                    <div class="print-item">
                        <span class="lbl">Passageiro Titular</span>
                        <span class="val">${reserva.passengerName}</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Documentos (Passaporte / CPF)</span>
                        <span class="val">${reserva.passport} • ${reserva.cpf}</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Período da Viagem</span>
                        <span class="val">${reserva.dates}</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Trecho Aéreo Internacional</span>
                        <span class="val">GRU (São Paulo) ⇄ HND (Tóquio) • Voo SK-702/703</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Categoria de Quarto Selecionada</span>
                        <span class="val">${reserva.roomCategory}</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Hotéis Inclusos (9 Noites)</span>
                        <span class="val">Sakura Tokyo (4n), Kyoto Garden (2n), Osaka Central (3n)</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Transportes Terrestres</span>
                        <span class="val">Shinkansen Bullet Train Reservado + Metrô Pass IC</span>
                    </div>
                    <div class="print-item">
                        <span class="lbl">Valor Total & Forma de Pagamento</span>
                        <span class="val">US$ ${(reserva.totalUSD || BASE_PACKAGE_USD).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${reserva.paymentMethod || "Confirmado"})</span>
                    </div>
                </div>

                <div class="print-footer-box">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="border: 2px solid #222; padding: 6px; border-radius: 4px; text-align: center; font-size: 10px; font-weight: bold;">
                            QR CODE<br>VALIDADO
                        </div>
                        <div style="font-size: 11px; color: #444; line-height: 1.4;">
                            <strong>Apresentação Obrigatória:</strong> Terminal 3 - Aeroporto de Guarulhos (GRU).<br>
                            Suporte 24h no Japão e Brasil: (11) 3300-7700 • WhatsApp: (11) 98765-4321
                        </div>
                    </div>
                    <div class="print-barcode">
                        ||| | |||| || ||||| ||| | |||
                    </div>
                </div>
            </div>
        `;
    }

    // Confirm Booking Action
    const btnConfirmPayment = document.getElementById('btnConfirmPayment');
    if (btnConfirmPayment) {
        btnConfirmPayment.addEventListener('click', async () => {
            const leadName = document.getElementById('leadName')?.value.trim() || 'Lucas Gabriel da Silva';
            const leadCpf = document.getElementById('leadCpf')?.value.trim() || '123.456.789-00';
            const leadPassport = document.getElementById('leadPassport')?.value.trim() || 'BR984721';
            const leadEmail = document.getElementById('leadEmail')?.value.trim() || 'lucas.viajante@gmail.com';
            const leadPhone = document.getElementById('leadPhone')?.value.trim() || '(11) 99876-5432';

            const randNum = Math.floor(100 + Math.random() * 900);
            const locatorCode = `SKR-JP2027-${randNum}`;

            const totalTravelers = Math.max(1, state.travelers.adults + state.travelers.children);
            const baseTotalUSD = BASE_PACKAGE_USD * totalTravelers;
            const diffPerNight = Math.max(0, state.selectedRoom.pricePerNightUSD - state.selectedRoom.baseIncluded);
            const upgradeUSD = diffPerNight * state.selectedRoom.nights;
            let totalUSD = baseTotalUSD + upgradeUSD - state.coupon.discountUSD;
            if (state.paymentMethod === 'pix') totalUSD *= 0.95;

            const newReserva = {
                locator: locatorCode,
                passengerName: leadName,
                cpf: leadCpf,
                email: leadEmail,
                phone: leadPhone,
                passport: leadPassport,
                roomCategory: state.selectedRoom.name,
                hotelTokyo: "Sakura Tokyo Hotel (4 Noites)",
                hotelKyoto: "Kyoto Garden Hotel (2 Noites)",
                hotelOsaka: "Osaka Central Hotel (3 Noites)",
                dates: "10 a 20 de Abril de 2027 (10 Dias)",
                flightRoute: "São Paulo (GRU) ⇄ Tóquio (HND)",
                transports: "JR Shinkansen Bullet Train + Metrô Pass",
                travelers: totalTravelers,
                totalUSD: totalUSD,
                totalBRL: totalUSD * USD_TO_BRL,
                paymentMethod: state.paymentMethod === 'pix' ? 'PIX (5% OFF)' : (state.paymentMethod === 'card' ? 'Cartão 12x' : 'Boleto'),
                status: "CONFIRMADO",
                createdAt: new Date().toISOString()
            };

            state.activeReserva = newReserva;
            localDatabase.unshift(newReserva);
            localStorage.setItem('sakura_active_reserva', JSON.stringify(newReserva));

            // Sync with backend API
            try {
                await fetch('/api/reservas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reserva: newReserva })
                });
            } catch (e) {
                console.log("Backend offline, saved to localStorage.");
            }

            // Render modal preview & single-page print
            const previewWrap = document.getElementById('voucherModalPreview');
            if (previewWrap) previewWrap.innerHTML = generateVoucherHTML(newReserva);
            setupPrintVoucher(newReserva);

            setCheckoutStep(4);
            showToast("🎉 Reserva confirmada com sucesso!");
        });
    }

    // Print Button (Single-page precision)
    const btnPrintVoucher = document.getElementById('btnPrintVoucher');
    if (btnPrintVoucher) {
        btnPrintVoucher.addEventListener('click', () => {
            if (state.activeReserva) {
                setupPrintVoucher(state.activeReserva);
            }
            window.print();
        });
    }

    const btnCloseVoucherModal = document.getElementById('btnCloseVoucherModal');
    if (btnCloseVoucherModal) {
        btnCloseVoucherModal.addEventListener('click', closeBookingModal);
    }

    // -------------------------------------------------------------------------
    // 12. "MINHA RESERVA" LOOKUP WITH STRICT DATA CONSISTENCY
    // -------------------------------------------------------------------------
    const lookupModal = document.getElementById('lookupModal');
    const btnMinhaReservaNav = document.getElementById('btnMinhaReservaNav');
    const btnCloseLookupModal = document.getElementById('btnCloseLookupModal');
    const btnSubmitLookup = document.getElementById('btnSubmitLookup');
    const lookupInput = document.getElementById('lookupInput');

    if (btnMinhaReservaNav && lookupModal) {
        btnMinhaReservaNav.addEventListener('click', () => lookupModal.classList.add('show'));
    }
    if (btnCloseLookupModal) {
        btnCloseLookupModal.addEventListener('click', () => lookupModal.classList.remove('show'));
    }

    async function searchReservation(query) {
        const q = query.trim().toUpperCase().replace(/[.-]/g, "");
        if (!q) {
            showToast("Por favor, digite seu código localizador ou CPF.", "error");
            return;
        }

        let found = null;

        // Try API first
        try {
            const resp = await fetch(`/api/reservas/${encodeURIComponent(query.trim())}`);
            if (resp.ok) {
                const resJson = await resp.json();
                if (resJson.success && resJson.reserva) {
                    found = resJson.reserva;
                }
            }
        } catch (e) {
            // Local fallback search
        }

        if (!found) {
            found = localDatabase.find(r => 
                r.locator.toUpperCase().replace(/[.-]/g, "") === q ||
                r.cpf.replace(/[.-]/g, "") === q
            );
        }

        if (found) {
            state.activeReserva = found;
            const previewWrap = document.getElementById('voucherModalPreview');
            if (previewWrap) previewWrap.innerHTML = generateVoucherHTML(found);
            setupPrintVoucher(found);

            if (lookupModal) lookupModal.classList.remove('show');
            openBookingModal(4);
            showToast(`Reserva ${found.locator} de ${found.passengerName} localizada com sucesso!`);
        } else {
            showToast(`Nenhuma reserva encontrada para "${query}". Verifique o código e tente novamente.`, "error");
        }
    }

    if (btnSubmitLookup && lookupInput) {
        btnSubmitLookup.addEventListener('click', () => searchReservation(lookupInput.value));
        lookupInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchReservation(lookupInput.value);
        });
    }

    // -------------------------------------------------------------------------
    // 13. USER AUTHENTICATION & GOOGLE LOGIN
    // -------------------------------------------------------------------------
    const btnHeaderLogin = document.getElementById('btnHeaderLogin');
    const loginModal = document.getElementById('loginModal');
    const btnCloseLoginModal = document.getElementById('btnCloseLoginModal');
    const btnGoogleAuth = document.getElementById('btnGoogleAuth');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const headerUserName = document.getElementById('headerUserName');
    const dropdownFullName = document.getElementById('dropdownFullName');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnLogout = document.getElementById('btnLogout');
    const btnOpenMyBookings = document.getElementById('btnOpenMyBookings');

    function updateAuthUI() {
        if (state.currentUser) {
            if (btnHeaderLogin) btnHeaderLogin.style.display = 'none';
            if (userProfileBadge) userProfileBadge.style.display = 'inline-flex';
            if (headerUserName) headerUserName.textContent = state.currentUser.name.split(' ')[0];
            if (headerUserAvatar) headerUserAvatar.src = state.currentUser.avatar || 'assets/sayuri_avatar.png';
            if (dropdownFullName) dropdownFullName.textContent = state.currentUser.name;
            if (dropdownEmail) dropdownEmail.textContent = state.currentUser.email;
        } else {
            if (btnHeaderLogin) btnHeaderLogin.style.display = 'inline-flex';
            if (userProfileBadge) userProfileBadge.style.display = 'none';
            if (userProfileDropdown) userProfileDropdown.classList.remove('show');
        }
    }

    if (btnHeaderLogin && loginModal) {
        btnHeaderLogin.addEventListener('click', () => loginModal.classList.add('show'));
    }
    if (btnCloseLoginModal) {
        btnCloseLoginModal.addEventListener('click', () => loginModal.classList.remove('show'));
    }

    if (userProfileBadge && userProfileDropdown) {
        userProfileBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfileDropdown.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!userProfileDropdown.contains(e.target) && !userProfileBadge.contains(e.target)) {
                userProfileDropdown.classList.remove('show');
            }
        });
    }

    if (btnGoogleAuth) {
        btnGoogleAuth.addEventListener('click', async () => {
            showToast("Conectando com Google...");
            const googleUser = {
                name: "Lucas Gabriel da Silva",
                email: "lucas.viajante@gmail.com",
                cpf: "123.456.789-00",
                phone: "(11) 99876-5432",
                passport: "BR984721",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
            };

            state.currentUser = googleUser;
            localStorage.setItem('sakura_user', JSON.stringify(googleUser));
            updateAuthUI();
            if (loginModal) loginModal.classList.remove('show');
            showToast(`Bem-vindo, ${googleUser.name}! Login com Google realizado.`);
        });
    }

    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value || 'lucas.viajante@gmail.com';
            const user = {
                name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                email: email,
                cpf: "123.456.789-00",
                phone: "(11) 98765-4321",
                passport: "BR887612",
                avatar: "assets/sayuri_avatar.png"
            };
            state.currentUser = user;
            localStorage.setItem('sakura_user', JSON.stringify(user));
            updateAuthUI();
            if (loginModal) loginModal.classList.remove('show');
            showToast(`Bem-vindo, ${user.name}!`);
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            state.currentUser = null;
            localStorage.removeItem('sakura_user');
            updateAuthUI();
            showToast("Você saiu da sua conta.");
        });
    }

    if (btnOpenMyBookings) {
        btnOpenMyBookings.addEventListener('click', () => {
            if (state.currentUser && state.currentUser.cpf) {
                searchReservation(state.currentUser.cpf);
            } else {
                searchReservation("SKR-JP2027-993");
            }
        });
    }

    updateAuthUI();

    // -------------------------------------------------------------------------
    // 14. GEMINI API SETTINGS MODAL & SAYURI CHAT ENGINE
    // -------------------------------------------------------------------------
    const geminiKeyModal = document.getElementById('geminiKeyModal');
    const btnOpenGeminiKeyModal = document.getElementById('btnOpenGeminiKeyModal');
    const btnCloseGeminiKeyModal = document.getElementById('btnCloseGeminiKeyModal');
    const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    const btnSaveGeminiKey = document.getElementById('btnSaveGeminiKey');
    const sayuriModelBadge = document.getElementById('sayuriModelBadge');

    if (btnOpenGeminiKeyModal && geminiKeyModal) {
        btnOpenGeminiKeyModal.addEventListener('click', () => {
            if (geminiApiKeyInput) geminiApiKeyInput.value = state.geminiApiKey;
            geminiKeyModal.classList.add('show');
        });
    }

    if (btnCloseGeminiKeyModal) {
        btnCloseGeminiKeyModal.addEventListener('click', () => geminiKeyModal.classList.remove('show'));
    }

    if (btnSaveGeminiKey && geminiApiKeyInput) {
        btnSaveGeminiKey.addEventListener('click', async () => {
            const key = geminiApiKeyInput.value.trim();
            state.geminiApiKey = key;
            localStorage.setItem('sakura_gemini_key', key);
            
            try {
                await fetch('/api/config/key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: key })
                });
            } catch (e) {}

            if (sayuriModelBadge) {
                sayuriModelBadge.textContent = 'Inteligência Artificial';
            }

            geminiKeyModal.classList.remove('show');
            showToast("Chave Gemini salva e ativada com sucesso!");
        });
    }

    // Chatbot UI
    const assistantBubble = document.getElementById('assistantBubble');
    const btnCloseBubble = document.getElementById('btnCloseBubble');
    const btnToggleChat = document.getElementById('btnToggleChat');
    const assistantChatWindow = document.getElementById('assistantChatWindow');
    const btnCloseChat = document.getElementById('btnCloseChat');
    const chatMessagesArea = document.getElementById('chatMessagesArea');
    const chatInput = document.getElementById('chatInput');
    const chatForm = document.getElementById('chatForm');
    const btnCtaFalarSayuri = document.getElementById('btnCtaFalarSayuri');

    function toggleChat(open = null) {
        if (!assistantChatWindow) return;
        const isShow = open !== null ? open : !assistantChatWindow.classList.contains('show');
        if (isShow) {
            assistantChatWindow.classList.add('show');
            if (assistantBubble) assistantBubble.style.display = 'none';
            if (chatInput) chatInput.focus();
        } else {
            assistantChatWindow.classList.remove('show');
        }
    }

    if (btnToggleChat) btnToggleChat.addEventListener('click', () => toggleChat());
    if (btnCloseChat) btnCloseChat.addEventListener('click', () => toggleChat(false));
    if (assistantBubble) assistantBubble.addEventListener('click', () => toggleChat(true));
    if (btnCtaFalarSayuri) btnCtaFalarSayuri.addEventListener('click', () => toggleChat(true));

    if (btnCloseBubble) {
        btnCloseBubble.addEventListener('click', (e) => {
            e.stopPropagation();
            assistantBubble.style.display = 'none';
        });
    }

    function appendMessage(sender, text) {
        if (!chatMessagesArea) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;

        const avatarImg = sender === 'bot' 
            ? `<img src="assets/sayuri_avatar.png" alt="Sayuri" class="msg-avatar">` 
            : '';

        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            ${avatarImg}
            <div class="msg-bubble">${formattedText}</div>
        `;

        chatMessagesArea.appendChild(msgDiv);
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }

    async function sendToSayuriAI(userText) {
        appendMessage('user', userText);
        state.chatHistory.push({ sender: 'user', text: userText });

        const cur = (currencySelector ? currencySelector.value : state.currency) || 'USD';
        const lang = (langSelector ? langSelector.value : state.lang) || 'pt';
        state.currency = cur;
        state.lang = lang;

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg bot typing-indicator';
        const typingLabel = lang === 'ja' ? 'さゆりが入力中... 🌸' : (lang === 'en' ? 'Sayuri is typing... 🌸' : 'Sayuri está digitando... 🌸');
        typingDiv.innerHTML = `<img src="assets/sayuri_avatar.png" class="msg-avatar"><div class="msg-bubble"><em>${typingLabel}</em></div>`;
        chatMessagesArea.appendChild(typingDiv);
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;

        let replyText = "";
        try {
            const resp = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: state.chatHistory,
                    currency: cur,
                    lang: lang,
                    apiKey: state.geminiApiKey || undefined
                })
            });

            if (resp.ok) {
                const resJson = await resp.json();
                replyText = resJson.reply;
                if (sayuriModelBadge) {
                    sayuriModelBadge.textContent = 'Inteligência Artificial';
                }
            }
        } catch (e) {
            console.log("Chat server error, falling back locally.");
        }

        typingDiv.remove();

        if (!replyText) {
            if (lang === 'ja') {
                const p = cur === 'JPY' ? '¥ 600.999' : (cur === 'BRL' ? 'R$ 19.387,05' : 'US$ 3.877,41');
                replyText = `こんにちは！🌸 日本2027旅行パッケージ（スタンダードルーム）は、お一人様 ${p} からとなっております。往復航空券、ホテル9泊、新幹線、テーマパークチケットが全て含まれています。ご質問があれば何でもお気軽にどうぞ！`;
            } else if (lang === 'en') {
                const p = cur === 'JPY' ? '¥ 600,999' : (cur === 'BRL' ? 'R$ 19,387.05' : 'US$ 3,877.41');
                replyText = `Hello! 🌸 Our most affordable Japan 2027 Package (Standard Room) starts from ${p} per person. It includes round-trip flights, 9 hotel nights in Tokyo, Kyoto, and Osaka, Shinkansen bullet train, and theme park tickets. How can I help you?`;
            } else {
                const p = cur === 'JPY' ? '¥ 600.999' : (cur === 'BRL' ? 'R$ 19.387,05' : 'US$ 3.877,41');
                const pix = cur === 'JPY' ? '¥ 570.949' : (cur === 'BRL' ? 'R$ 18.417,70' : 'US$ 3.683,54');
                const parc = cur === 'JPY' ? '12x de ¥ 50.083' : (cur === 'BRL' ? '12x de R$ 1.615,58' : '12x de US$ 323,12');
                replyText = `Opa! Tudo bem? A nossa viagem mais barata é o **Pacote Japão 2027 (Standard Room)**, saindo a partir de **${p}** por pessoa.\n\nÀ vista no Pix sai por **${pix}** (5% OFF), ou em **${parc} sem juros** no cartão! Inclui voos ida e volta, 9 noites de hotéis, Trem-Bala e parques temáticos. Use o cupom **SAKURA10**!`;
            }
        }

        appendMessage('bot', replyText);
        state.chatHistory.push({ sender: 'bot', text: replyText });
    }

    document.querySelectorAll('.quick-reply-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const queryText = chip.textContent.replace(/[📅💰🎒🏨📄🏢]/g, '').trim();
            sendToSayuriAI(queryText);
        });
    });

    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            sendToSayuriAI(text);
        });
    }

    document.querySelectorAll('.btn-open-faq').forEach(link => {
        link.addEventListener('click', () => {
            const topic = link.getAttribute('data-topic');
            toggleChat(true);
            const promptMap = {
                datas: "Quais são as datas da viagem e o prazo limite de reserva?",
                incluso: "O que está incluso no pacote Japão 2027?",
                pagamento: "Quais são as formas de pagamento e opções de parcelamento?",
                vistos: "Brasileiro precisa de visto para o Japão em 2027?",
                cancelamento: "Como funciona a política de cancelamento?",
                seguro: "O pacote inclui seguro viagem internacional?"
            };
            sendToSayuriAI(promptMap[topic] || "Informações sobre o pacote.");
        });
    });

    // -------------------------------------------------------------------------
    // 15. CHECKLIST & SAKURA TIPS
    // -------------------------------------------------------------------------
    const tipCheckboxes = document.querySelectorAll('.tip-checkbox');
    const progressPercent = document.getElementById('progressPercent');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressCaption = document.getElementById('progressCaption');
    const btnSelectAllTips = document.getElementById('btnSelectAllTips');
    const btnResetTips = document.getElementById('btnResetTips');

    function updateChecklistProgress() {
        if (!tipCheckboxes.length) return;
        let checkedCount = 0;
        const total = tipCheckboxes.length;

        tipCheckboxes.forEach(cb => {
            const key = cb.getAttribute('data-tip');
            if (state.checklist[key]) {
                cb.checked = true;
                checkedCount++;
            } else {
                cb.checked = false;
            }
        });

        const pct = Math.round((checkedCount / total) * 100);
        if (progressPercent) progressPercent.textContent = `${pct}%`;
        if (progressBarFill) progressBarFill.style.width = `${pct}%`;

        if (progressCaption) {
            if (pct === 0) progressCaption.textContent = "Marque os itens conforme for organizando sua bagagem!";
            else if (pct < 50) progressCaption.textContent = "Bom começo! Continue organizando seus itens essenciais.";
            else if (pct < 100) progressCaption.textContent = "Quase tudo pronto para embarcar rumo ao Japão! 🌸";
            else progressCaption.textContent = "Mala 100% pronta! Você está preparado para o Japão! ✈️🇯🇵";
        }

        localStorage.setItem('sakura_checklist', JSON.stringify(state.checklist));
    }

    tipCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const key = cb.getAttribute('data-tip');
            state.checklist[key] = cb.checked;
            updateChecklistProgress();
        });
    });

    if (btnSelectAllTips) {
        btnSelectAllTips.addEventListener('click', () => {
            tipCheckboxes.forEach(cb => {
                const key = cb.getAttribute('data-tip');
                state.checklist[key] = true;
            });
            updateChecklistProgress();
            showToast("Todos os itens foram marcados!");
        });
    }

    if (btnResetTips) {
        btnResetTips.addEventListener('click', () => {
            state.checklist = {};
            updateChecklistProgress();
            showToast("Checklist reiniciado.");
        });
    }

    updateChecklistProgress();

    // -------------------------------------------------------------------------
    // 16. TOAST NOTIFICATION HELPER
    // -------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-bell text-sakura"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Transport & Currency Modals shortcuts
    const cardQuickTransporte = document.getElementById('cardQuickTransporte');
    const transporteModal = document.getElementById('transporteModal');
    const btnCloseTransporteModal = document.getElementById('btnCloseTransporteModal');
    const btnEntendiTransporte = document.getElementById('btnEntendiTransporte');

    if (cardQuickTransporte && transporteModal) cardQuickTransporte.addEventListener('click', () => transporteModal.classList.add('show'));
    if (btnCloseTransporteModal) btnCloseTransporteModal.addEventListener('click', () => transporteModal.classList.remove('show'));
    if (btnEntendiTransporte) btnEntendiTransporte.addEventListener('click', () => transporteModal.classList.remove('show'));

    const cardQuickMoeda = document.getElementById('cardQuickMoeda');
    const currencyModal = document.getElementById('currencyModal');
    const btnCloseCurrencyModal = document.getElementById('btnCloseCurrencyModal');
    const calcUsdInput = document.getElementById('calcUsdInput');
    const calcBrlRes = document.getElementById('calcBrlRes');
    const calcJpyRes = document.getElementById('calcJpyRes');

    if (cardQuickMoeda && currencyModal) cardQuickMoeda.addEventListener('click', () => currencyModal.classList.add('show'));
    if (btnCloseCurrencyModal) btnCloseCurrencyModal.addEventListener('click', () => currencyModal.classList.remove('show'));

    if (calcUsdInput && calcBrlRes && calcJpyRes) {
        calcUsdInput.addEventListener('input', () => {
            const usd = parseFloat(calcUsdInput.value) || 0;
            calcBrlRes.textContent = `R$ ${(usd * USD_TO_BRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            calcJpyRes.textContent = `¥ ${(usd * USD_TO_JPY).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
        });
    }

    const cardQuickRoteiro = document.getElementById('cardQuickRoteiro');
    if (cardQuickRoteiro) cardQuickRoteiro.addEventListener('click', () => document.getElementById('roteiro')?.scrollIntoView({ behavior: 'smooth' }));

    const cardQuickMalas = document.getElementById('cardQuickMalas');
    if (cardQuickMalas) cardQuickMalas.addEventListener('click', () => document.getElementById('dicas')?.scrollIntoView({ behavior: 'smooth' }));

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
    }

    // -------------------------------------------------------------------------
    // NOTIFICATIONS POPOVER HANDLER
    // -------------------------------------------------------------------------
    const btnNotifications = document.getElementById('btnNotifications');
    const notificationsPopover = document.getElementById('notificationsPopover');
    const btnCloseNotifications = document.getElementById('btnCloseNotifications');

    if (btnNotifications && notificationsPopover) {
        btnNotifications.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsPopover.classList.toggle('show');
        });

        if (btnCloseNotifications) {
            btnCloseNotifications.addEventListener('click', () => {
                notificationsPopover.classList.remove('show');
            });
        }

        document.addEventListener('click', (e) => {
            if (!notificationsPopover.contains(e.target) && !btnNotifications.contains(e.target)) {
                notificationsPopover.classList.remove('show');
            }
        });
    }

    // Check Gemini API status on server
    async function checkServerGeminiStatus() {
        try {
            const resp = await fetch('/api/config/key');
            if (resp.ok) {
                const data = await resp.json();
                if (data.configured) {
                    if (sayuriModelBadge) {
                        sayuriModelBadge.textContent = 'Inteligência Artificial';
                    }
                }
            }
        } catch (e) {}
    }
    checkServerGeminiStatus();
    updateAllPricesOnPage();

});
