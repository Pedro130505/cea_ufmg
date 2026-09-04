document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       LANGUAGE SWITCHER (i18n: EN Default with PT Toggle)
       ========================================================================== */
    const langToggleBtn = document.getElementById('lang-toggle');

    function setLanguage(lang) {
        document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
        localStorage.setItem('cea_lang', lang);

        document.querySelectorAll('.lang-opt').forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        document.querySelectorAll('[data-en][data-pt]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.innerHTML = text;
                }
            }
        });
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('cea_lang') || 'en';
            const nextLang = currentLang === 'en' ? 'pt' : 'en';
            setLanguage(nextLang);
        });
    }

    // Initialize language (default: English)
    const savedLang = localStorage.getItem('cea_lang') || 'en';
    setLanguage(savedLang);

    /* ==========================================================================
       NAVBAR SCROLL EFFECT & MOBILE MENU (Shared across all pages)
       ========================================================================== */
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Keep scrolled class on subpages (header has it statically or dynamically)
            if (!document.querySelector('.subpage-hero')) {
                header.classList.remove('scrolled');
            }
        }
    });

    // Mobile nav toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile nav on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && mobileToggle) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });


    /* ==========================================================================
       AIRCRAFT SPECIFICATION VIEWER (TABS - Homepage only)
       ========================================================================== */
    const tabButtons = document.querySelectorAll('#aircraft-selector .tab-btn');
    const aircraftPanes = document.querySelectorAll('#aircraft-display .aircraft-content');

    if (tabButtons.length > 0 && aircraftPanes.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetAircraft = button.getAttribute('data-aircraft');
                
                // Toggle buttons active state
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Toggle panes active state
                aircraftPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('id') === `pane-${targetAircraft}`) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }


    /* ==========================================================================
       AIRFOIL SIMULATOR (Homepage only - Enhanced with Cl vs AoA Graph)
       ========================================================================== */
    const canvas = document.getElementById('airfoil-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const aoaSlider = document.getElementById('aoa-slider');
        const aoaValueDisp = document.getElementById('aoa-value');
        const clDisp = document.getElementById('cl-val');
        const cdDisp = document.getElementById('cd-val');
        const ldDisp = document.getElementById('ld-val');
        const statusDisp = document.getElementById('status-val');
        const explainBox = document.getElementById('explain-box');
        const stallWarning = document.getElementById('stall-warning');

        let aoa = aoaSlider ? parseInt(aoaSlider.value) : 4;
        let particles = [];
        const maxParticles = 90;
        
        // Set canvas resolution for scaling (responsive across desktop & mobile)
        function resizeCanvas() {
            canvas.width = 600;
            canvas.height = 350;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * 600,
                y: Math.random() * 350,
                speed: 3.5 + Math.random() * 2,
                size: 1 + Math.random() * 1.5,
                history: [] // to draw streamline tails
            });
        }

        function calculateAerodynamics(angle) {
            let cl, cd, status, explanation;
            
            if (angle < -10) angle = -10;
            if (angle > 22) angle = 22;

            if (angle >= 14) {
                // STALL STATE
                status = 'ESTOL (Stall)';
                cl = (1.4 - (angle - 14) * 0.08).toFixed(2);
                cd = (0.12 + (angle - 14) * 0.025).toFixed(2);
                explanation = '<strong>Alerta de Estol!</strong> O ângulo de ataque é muito alto. O fluxo de ar descola da parte superior da asa, criando turbulência maciça. A sustentação despenca e o arrasto aumenta severamente.';
                if (stallWarning) stallWarning.classList.add('active');
                if (statusDisp) statusDisp.className = 'tel-val status-stall';
            } else {
                // NORMAL LAMINAR STATE
                if (stallWarning) stallWarning.classList.remove('active');
                if (statusDisp) statusDisp.className = 'tel-val status-normal';
                
                cl = (angle * 0.1).toFixed(2);
                cd = (0.015 + (angle * 0.005) * (angle * 0.005)).toFixed(2);
                
                if (angle > 10) {
                    status = 'Fluxo Instável';
                    explanation = 'O fluxo começa a mostrar sinais de separação na parte posterior da asa. A sustentação está no máximo, mas o arrasto cresce rapidamente.';
                } else if (angle > 2) {
                    status = 'Fluxo Laminar (Sustentação)';
                    explanation = 'Excelente desempenho. O fluxo de ar corre suavemente pelo perfil. A diferença de velocidade gera menor pressão acima da asa, gerando a força de sustentação para o voo.';
                } else if (angle >= -2 && angle <= 2) {
                    status = 'Fluxo Simétrico (Cruzeiro)';
                    explanation = 'Condição de voo nivelado ou cruzeiro de alta velocidade. Resistência ao avanço (arrasto) mínima e sustentação equilibrada.';
                } else {
                    status = 'Sustentação Negativa (Downforce)';
                    explanation = 'A asa gera força para baixo. Utilizado em aerofólios de carros de corrida para aumentar a aderência dos pneus com o solo.';
                }
            }

            const numCl = parseFloat(cl);
            const numCd = parseFloat(cd);
            const ld = numCd > 0 ? (numCl / numCd).toFixed(1) : '—';

            return { cl: numCl, cd: numCd, ld, status, explanation };
        }

        // Update display based on slider
        if (aoaSlider) {
            aoaSlider.addEventListener('input', (e) => {
                aoa = parseInt(e.target.value);
                if (aoaValueDisp) aoaValueDisp.textContent = aoa;
                
                const aero = calculateAerodynamics(aoa);
                if (clDisp) clDisp.textContent = aero.cl.toFixed(2);
                if (cdDisp) cdDisp.textContent = aero.cd.toFixed(2);
                if (ldDisp) ldDisp.textContent = aero.ld;
                if (statusDisp) statusDisp.textContent = aero.status;
                if (explainBox) explainBox.innerHTML = `<p>${aero.explanation}</p>`;
            });
        }

        // Helper to draw the Cl vs AoA Graph
        function drawClGraph() {
            const graphLeft = 430;
            const graphTop = 60;
            const graphWidth = 140;
            const graphHeight = 220;

            // Draw Box and Grid
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.fillRect(graphLeft, graphTop, graphWidth, graphHeight);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

            // Grid lines (vertical and horizontal)
            // Horiz lines (Cl value lines: Cl = 1.5, 1.0, 0.5, 0, -0.5, -1.0)
            ctx.beginPath();
            for (let val = -1.0; val <= 1.5; val += 0.5) {
                // map Cl value to Y
                let y = graphTop + graphHeight * (1 - (val + 1.0) / 2.8);
                ctx.moveTo(graphLeft, y);
                ctx.lineTo(graphLeft + graphWidth, y);
            }
            // Vert lines (AoA value lines: -10, 0, 10, 20)
            for (let ang = -10; ang <= 20; ang += 10) {
                let x = graphLeft + graphWidth * ((ang + 10) / 32);
                ctx.moveTo(x, graphTop);
                ctx.lineTo(x, graphTop + graphHeight);
            }
            ctx.stroke();

            // Draw Zero-Axes in brighter color
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            // Y-axis (AoA = 0)
            let zeroX = graphLeft + graphWidth * (10 / 32);
            ctx.moveTo(zeroX, graphTop);
            ctx.lineTo(zeroX, graphTop + graphHeight);
            // X-axis (Cl = 0)
            let zeroY = graphTop + graphHeight * (1 - (0 + 1.0) / 2.8);
            ctx.moveTo(graphLeft, zeroY);
            ctx.lineTo(graphLeft + graphWidth, zeroY);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = '8px monospace';
            ctx.fillText('Cl', graphLeft + 5, graphTop + 12);
            ctx.fillText('AoA', graphLeft + graphWidth - 22, zeroY - 4);
            ctx.fillText('1.5', graphLeft + 5, graphTop + graphHeight * (1 - (1.5 + 1.0) / 2.8) - 2);
            ctx.fillText('0.0', graphLeft + 5, zeroY - 2);

            // Curve points calculation and path drawing
            ctx.beginPath();
            for (let a = -10; a <= 22; a++) {
                let clVal = 0;
                if (a >= 14) {
                    clVal = 1.4 - (a - 14) * 0.08;
                } else {
                    clVal = a * 0.1;
                }
                let gx = graphLeft + graphWidth * ((a + 10) / 32);
                let gy = graphTop + graphHeight * (1 - (clVal + 1.0) / 2.8);
                if (a === -10) {
                    ctx.moveTo(gx, gy);
                } else {
                    ctx.lineTo(gx, gy);
                }
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw dynamic point for current AoA
            let curA = aoa;
            let curCl = 0;
            if (curA >= 14) {
                curCl = 1.4 - (curA - 14) * 0.08;
            } else {
                curCl = curA * 0.1;
            }
            let px = graphLeft + graphWidth * ((curA + 10) / 32);
            let py = graphTop + graphHeight * (1 - (curCl + 1.0) / 2.8);

            // Glowing dot
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fillStyle = aoa >= 14 ? '#ef4444' : '#00f0ff';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = aoa >= 14 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Main animation loop
        function animate() {
            // Clear background
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, 600, 350);

            // Draw grid lines on background (left 410px only to avoid overlapping graph)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 410; i += 30) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 350);
                ctx.stroke();
            }
            for (let j = 0; j < 350; j += 30) {
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(410, j);
                ctx.stroke();
            }

            // Draw Airfoil (Shifted slightly left to make room for graph)
            ctx.save();
            const ax = 190; // center x of airfoil (shifted from 280)
            const ay = 175; // center y of airfoil
            const aoaRad = (aoa * Math.PI) / 180;

            ctx.translate(ax, ay);
            ctx.rotate(-aoaRad); // Rotate negatively since nose goes UP for positive AoA

            ctx.beginPath();
            ctx.moveTo(-90, 0);
            ctx.bezierCurveTo(-70, -32, 20, -32, 90, 0);
            ctx.bezierCurveTo(20, 24, -70, 24, -90, 0);
            
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.strokeStyle = aoa >= 14 ? '#ef4444' : '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // Animate particles
            particles.forEach(p => {
                p.x += p.speed;
                
                let dx = p.x - ax;
                let dy = p.y - ay;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    let rx = dx * Math.cos(aoaRad) - dy * Math.sin(aoaRad);
                    let ry = dx * Math.sin(aoaRad) + dy * Math.cos(aoaRad);

                    if (aoa >= 14) {
                        // STALL TURBULENCE STATE
                        if (rx > -90 && rx < 120 && ry < 10) {
                            const turbulence = (rx + 90) * 0.25;
                            p.y += Math.sin(p.x * 0.15 + p.speed) * (1.8 + turbulence * 0.1);
                            p.x -= p.speed * 0.45; 
                        } else if (rx >= 120) {
                            p.y += Math.sin(p.x * 0.1 + p.speed) * 3;
                        }
                    } else {
                        // LAMINAR FLOW
                        const influence = Math.max(0, 1 - (dist / 140));
                        const liftCurvature = (aoa * 1.5) * influence;
                        
                        if (ry < 0) {
                            p.y -= 28 * influence * Math.cos(rx * 0.015);
                            p.y += liftCurvature * 0.4;
                        } else {
                            p.y += 18 * influence * Math.cos(rx * 0.015);
                            p.y += liftCurvature * 0.4;
                        }
                    }
                }

                // Reset particle if off-screen (we cap it before X=410 so it doesn't enter graph area)
                if (p.x > 410) {
                    p.x = -10;
                    p.y = Math.random() * 350;
                    p.history = [];
                }

                p.history.push({ x: p.x, y: p.y });
                if (p.history.length > 8) {
                    p.history.shift();
                }

                // Draw streamline
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                for (let k = p.history.length - 1; k >= 0; k--) {
                    ctx.lineTo(p.history[k].x, p.history[k].y);
                }
                ctx.strokeStyle = aoa >= 14 ? 'rgba(239, 68, 68, 0.23)' : 'rgba(0, 240, 255, 0.2)';
                ctx.lineWidth = p.size;
                ctx.stroke();
            });

            // Draw the Right-side Cl Graph
            drawClGraph();

            requestAnimationFrame(animate);
        }
        animate();
    }


    /* ==========================================================================
       TESTIMONIALS CAROUSEL (Curso Page only)
       ========================================================================== */
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.carousel-dots .dot');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');

    if (testimonialSlides.length > 0) {
        let currentSlideIndex = 0;

        function showTestimonialSlide(index) {
            testimonialSlides.forEach(slide => slide.classList.remove('active'));
            testimonialDots.forEach(dot => dot.classList.remove('active'));
            
            testimonialSlides[index].classList.add('active');
            testimonialDots[index].classList.add('active');
            currentSlideIndex = index;
        }

        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                let index = currentSlideIndex + 1;
                if (index >= testimonialSlides.length) index = 0;
                showTestimonialSlide(index);
            });
        }

        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', () => {
                let index = currentSlideIndex - 1;
                if (index < 0) index = testimonialSlides.length - 1;
                showTestimonialSlide(index);
            });
        }

        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonialSlide(index);
            });
        });
    }


    /* ==========================================================================
       TEAM DIRECTORY TABS (Equipe Page only)
       ========================================================================== */
    const teamTabButtons = document.querySelectorAll('.team-tab-btn');
    const teamPanes = document.querySelectorAll('.team-pane');

    if (teamTabButtons.length > 0 && teamPanes.length > 0) {
        teamTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTeam = button.getAttribute('data-team');
                
                // Toggle active buttons
                teamTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Toggle active team grids
                teamPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('id') === `team-pane-${targetTeam}`) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }


    /* ==========================================================================
       PUBLICATIONS SEARCH & FILTER (Artigos Page only)
       ========================================================================== */
    const searchInput = document.getElementById('article-search');
    const articleFilterButtons = document.querySelectorAll('.filter-btn');
    const articleItems = document.querySelectorAll('.article-item');
    const emptySearchMsg = document.getElementById('empty-search-msg');

    if (articleItems.length > 0) {
        let activeCategory = 'all';
        let searchQuery = '';

        function filterArticles() {
            let visibleCount = 0;
            
            articleItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const itemTitle = item.querySelector('.article-title').textContent.toLowerCase();
                const itemAuthors = item.querySelector('.article-authors').textContent.toLowerCase();
                const itemYear = item.querySelector('.article-year').textContent.toLowerCase();
                
                const matchesCategory = (activeCategory === 'all' || itemCategory === activeCategory);
                const matchesSearch = (
                    searchQuery === '' || 
                    itemTitle.includes(searchQuery) || 
                    itemAuthors.includes(searchQuery) ||
                    itemYear.includes(searchQuery)
                );
                
                if (matchesCategory && matchesSearch) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (emptySearchMsg) {
                if (visibleCount === 0) {
                    emptySearchMsg.style.display = 'flex';
                } else {
                    emptySearchMsg.style.display = 'none';
                }
            }
        }

        // Search Input Event
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                filterArticles();
            });
        }

        // Filter Tab Buttons Event
        articleFilterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                articleFilterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                activeCategory = btn.getAttribute('data-category');
                filterArticles();
            });
        });
    }


    /* ==========================================================================
       CONTACT FORM SUBMISSION HANDLER
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const successPane = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('btn-reset-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Processando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (successPane) successPane.classList.add('active');
            }, 1200);
        });
    }

    if (resetFormBtn && contactForm) {
        resetFormBtn.addEventListener('click', () => {
            contactForm.reset();
            if (successPane) successPane.classList.remove('active');
        });
    }

    /* ==========================================================================
       FLUID SCROLL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const animScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animScrollElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Once visible, we can unobserve to avoid repeat triggers
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px' // triggers slightly before entering view
        });

        animScrollElements.forEach(el => scrollObserver.observe(el));
    }


    /* ==========================================================================
       INTERACTIVE ACCORDION (Iniciativas - Oportunidades Page only)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.accordion-item');
                const isActive = item.classList.contains('active');
                
                // Optional: close other accordions (single-open behavior)
                const container = header.closest('.accordion-container');
                if (container) {
                    const siblingItems = container.querySelectorAll('.accordion-item');
                    siblingItems.forEach(sibling => {
                        if (sibling !== item) {
                            sibling.classList.remove('active');
                            const toggleIcon = sibling.querySelector('.accordion-toggle-icon i');
                            if (toggleIcon) {
                                toggleIcon.classList.remove('fa-minus');
                                toggleIcon.classList.add('fa-plus');
                            }
                        }
                    });
                }
                
                // Toggle active state
                item.classList.toggle('active');
                
                // Update icon
                const icon = header.querySelector('.accordion-toggle-icon i');
                if (icon) {
                    if (item.classList.contains('active')) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    } else {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                }
            });
        });
        
        // Open first item by default for demonstration & premium user experience
        const firstItem = document.querySelector('.accordion-container .accordion-item');
        if (firstItem) {
            firstItem.classList.add('active');
            const icon = firstItem.querySelector('.accordion-toggle-icon i');
            if (icon) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        }
    }


    /* ==========================================================================
       DYNAMIC SPEED & FLIGHT RECORD COMPARATOR (Interactive Module)
       ========================================================================== */
    const aircraftDatabase = {
        'gaivota': {
            name: 'CB.1 Gaivota',
            code: 'CEA-101 (1964)',
            speed: 120,
            speedKts: 65,
            mach: 0.10,
            glide: '20:1',
            emptyWeight: '120 kg',
            material: 'Madeira Freijó & Tela',
            propulsion: 'Planador Puro',
            record: '1º Protótipo Akaflieg UFMG',
            desc: 'A gênese do CEA: projetado pelo Prof. Cláudio Barros para ensinar engenharia construindo aeronaves físicas.'
        },
        'minuano': {
            name: 'CB.2 Minuano',
            code: 'CEA-102 (1974)',
            speed: 210,
            speedKts: 113,
            mach: 0.17,
            glide: '38:1',
            emptyWeight: '190 kg',
            material: 'Freijó & Fibra de Vidro',
            propulsion: 'Planador Alto Desempenho',
            record: 'Campeão Brasileiro de Voo a Vela (1978)',
            desc: 'Perfil laminar Wortmann de alto rendimento. Superou os melhores planadores de competição do Brasil na década de 70.'
        },
        'cea308': {
            name: 'CEA-308',
            code: 'Recordista FAI (2001)',
            speed: 360,
            speedKts: 194,
            mach: 0.29,
            glide: '14:1',
            emptyWeight: '150 kg',
            material: 'Compósito Misto & Freijó',
            propulsion: 'Hirth F-30 (80 HP)',
            record: '4× Recordista Mundial FAI C-1.a/0',
            desc: 'A aeronave com motor a pistão de até 300kg mais eficiente do mundo, atingindo 360 km/h com apenas 80 HP.'
        },
        'anequim': {
            name: 'CEA-311 Anequim',
            code: 'Recordista Absoluto (2015)',
            speed: 521,
            speedKts: 281,
            mach: 0.43,
            glide: '16:1',
            emptyWeight: '248 kg',
            material: '100% Fibra de Carbono / Nomex',
            propulsion: 'Lycoming IO-360 (220 HP)',
            record: '5× Recordista Mundial FAI (521.08 km/h)',
            desc: 'Ápice da engenharia aeroespacial discente: a aeronave monomotor a pistão até 500kg mais rápida da história.'
        },
        'cea314': {
            name: 'Projeto CEA-314',
            code: 'Nova Geração (Em Construção)',
            speed: 420,
            speedKts: 227,
            mach: 0.34,
            glide: '18:1',
            emptyWeight: '310 kg',
            material: '100% Fibra de Carbono Integral',
            propulsion: 'Acrobática / Treinamento',
            record: 'Biplace em Tandem Acrobático',
            desc: 'Síntese metodológica do CEA (Cláudio Barros / Paulo Iscold) e da herança projetual de Joseph Kovács (Tucano).'
        },
        'aeromot': {
            name: 'Bimotor Aeromot',
            code: 'Parceria Industrial Ativa',
            speed: 480,
            speedKts: 259,
            mach: 0.39,
            glide: '17:1',
            emptyWeight: 'Consultoria P&D',
            material: 'Compósitos Estruturais Avançados',
            propulsion: 'Bimotor c/ Opção a Etanol',
            record: 'Transição Energética & Descarbonização',
            desc: 'Desenvolvimento conjunto de uma aeronave bimotora regional de alta eficiência movida a biocombustível.'
        }
    };

    const speedSlider = document.getElementById('speed-throttle-slider');
    const speedValDisp = document.getElementById('digital-speed-num');
    const speedKtsDisp = document.getElementById('digital-kts-num');
    const machBadgeDisp = document.getElementById('digital-mach-badge');
    const acButtons = document.querySelectorAll('.ac-select-btn');
    
    // Telemetry fields
    const specName = document.getElementById('comp-spec-name');
    const specCode = document.getElementById('comp-spec-code');
    const specRecord = document.getElementById('comp-spec-record');
    const specGlide = document.getElementById('comp-spec-glide');
    const specMaterial = document.getElementById('comp-spec-material');
    const specEngine = document.getElementById('comp-spec-engine');
    const specDesc = document.getElementById('comp-spec-desc');

    function updateComparator(acKey) {
        const data = aircraftDatabase[acKey];
        if (!data) return;

        // Update active button state
        acButtons.forEach(btn => {
            if (btn.getAttribute('data-ac') === acKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update slider and gauges
        if (speedSlider) speedSlider.value = data.speed;
        if (speedValDisp) speedValDisp.textContent = data.speed;
        if (speedKtsDisp) speedKtsDisp.textContent = data.speedKts;
        if (machBadgeDisp) machBadgeDisp.textContent = `MACH ${data.mach.toFixed(2)}`;

        // Update telemetry panel
        if (specName) specName.textContent = data.name;
        if (specCode) specCode.textContent = data.code;
        if (specRecord) specRecord.textContent = data.record;
        if (specGlide) specGlide.textContent = data.glide;
        if (specMaterial) specMaterial.textContent = data.material;
        if (specEngine) specEngine.textContent = data.propulsion;
        if (specDesc) specDesc.textContent = data.desc;
    }

    if (acButtons.length > 0) {
        acButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const acKey = btn.getAttribute('data-ac');
                updateComparator(acKey);
            });
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const currentSpeed = parseInt(e.target.value);
            if (speedValDisp) speedValDisp.textContent = currentSpeed;
            if (speedKtsDisp) speedKtsDisp.textContent = Math.round(currentSpeed / 1.852);
            if (machBadgeDisp) machBadgeDisp.textContent = `MACH ${(currentSpeed / 1225).toFixed(2)}`;

            // Highlight closest aircraft
            let closestKey = 'gaivota';
            let minDiff = 9999;
            for (const key in aircraftDatabase) {
                const diff = Math.abs(aircraftDatabase[key].speed - currentSpeed);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestKey = key;
                }
            }
            acButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-ac') === closestKey);
            });
            const d = aircraftDatabase[closestKey];
            if (specName) specName.textContent = d.name;
            if (specCode) specCode.textContent = d.code;
            if (specRecord) specRecord.textContent = d.record;
            if (specGlide) specGlide.textContent = d.glide;
            if (specMaterial) specMaterial.textContent = d.material;
            if (specEngine) specEngine.textContent = d.propulsion;
            if (specDesc) specDesc.textContent = d.desc;
        });
    }


    /* ==========================================================================
       BLUEPRINT X-RAY HOTSPOTS VIEWER (Interactive Inspection)
       ========================================================================== */
    const hotspotData = {
        'wing': {
            title: 'Perfil de Asa de Fluxo Laminar Natural (NLF)',
            tag: '// AERODINÂMICA COMPUTACIONAL',
            chips: ['NLF 65% CORDA', 'FIBRA CARBONO T700', 'WASHOUT GEOMÉTRICO'],
            desc: 'Geometria de aerofólio otimizada em CFD para estender o escoamento laminar na superfície superior, atrasando a transição turbulenta e reduzindo drasticamente o coeficiente de arrasto parasita (Cd).'
        },
        'cockpit': {
            title: 'Cockpit Tandem & Ergonomia Acrobática',
            tag: '// DNA KOVÁCS · BI-POSTO EM TANDEM',
            chips: ['ASSENTOS EM LINHA', 'CANOPY ÓPTICO POLICARBONATO', 'CG BALANCEADO'],
            desc: 'Posicionamento em linha (tandem) com ambos os tripulantes centrados no eixo longitudinal de inércia. Mantém a resposta dinâmica e o equilíbrio de comandos idênticos em voo solo ou com instrutor.'
        },
        'engine': {
            title: 'Grupo Motopropulsor & Propulsão Sustentável',
            tag: '// TRANSIÇÃO ENERGÉTICA & POTÊNCIA',
            chips: ['OPÇÃO ETANOL E100', 'BERÇO CROMO-MOLIBDÊNIO 4130', 'DUTOS DE BAIXA PERDA'],
            desc: 'Integração de motores de alta taxa de compressão calibrados para biocombustível renovável, reduzindo emissões e custos por hora de voo com máxima segurança termodinâmica.'
        },
        'gear': {
            title: 'Trem de Pouso Retrátil de Baixo Arrasto',
            tag: '// SISTEMAS MECÂNICOS DE PRECISÃO',
            chips: ['RECOLHIMENTO ELETRO-HIDRÁULICO', 'VEDAÇÃO COMPLETA', 'AMORTECIMENTO OLEOPNEUMÁTICO'],
            desc: 'Recolhimento integral dentro das cavidades da asa e fuselagem com portas vedadas a vácuo, eliminando todo o arrasto parasita de pernas de trem fixas durante o voo em alta velocidade.'
        },
        'tail': {
            title: 'Empenagem & Estabilidade Dinâmica',
            tag: '// CONTROLE & ZERO FLUTTER',
            chips: ['COMANDOS RÍGIDOS', 'BALANCEAMENTO DE MASSA', 'ANÁLISE AEROELÁSTICA'],
            desc: 'Superfícies de controle balanceadas dinamicamente para garantir flutter-free envelope até 1.2x Vne (Velocidade Nunca Exceder) e excelente autoridade de profundor e leme em manobras radicais.'
        }
    };

    const hotspotNodes = document.querySelectorAll('.hotspot-node');
    const hotspotTitleDisp = document.getElementById('hotspot-title');
    const hotspotTagDisp = document.getElementById('hotspot-tag');
    const hotspotChipsDisp = document.getElementById('hotspot-chips');
    const hotspotDescDisp = document.getElementById('hotspot-desc');

    if (hotspotNodes.length > 0) {
        hotspotNodes.forEach(node => {
            node.addEventListener('click', () => {
                const targetKey = node.getAttribute('data-node');
                const info = hotspotData[targetKey];
                if (!info) return;

                hotspotNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');

                if (hotspotTitleDisp) hotspotTitleDisp.textContent = info.title;
                if (hotspotTagDisp) hotspotTagDisp.textContent = info.tag;
                if (hotspotDescDisp) hotspotDescDisp.textContent = info.desc;
                
                if (hotspotChipsDisp) {
                    hotspotChipsDisp.innerHTML = info.chips.map(c => `<span class="hotspot-chip">${c}</span>`).join('');
                }
            });
        });
    }


    /* ==========================================================================
       TECHNICAL LIGHTBOX MODAL
       ========================================================================== */
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const zoomableImages = document.querySelectorAll('.zoomable-img');

    if (lightboxModal && lightboxImg) {
        zoomableImages.forEach(imgEl => {
            imgEl.style.cursor = 'zoom-in';
            imgEl.addEventListener('click', () => {
                const fullSrc = imgEl.getAttribute('data-full') || imgEl.src;
                const altText = imgEl.getAttribute('alt') || 'Registro de Engenharia CEA-UFMG';
                lightboxImg.src = fullSrc;
                if (lightboxCaption) lightboxCaption.textContent = altText;
                lightboxModal.classList.add('active');
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightboxModal.classList.remove('active');
            });
        }

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('active');
            }
        });
    }

});
