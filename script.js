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
       CONTACT FORM SUBMISSION HANDLER (FormSubmit AJAX + Honeypot Anti-Spam)
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const successPane = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('btn-reset-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Anti-Spam Honeypot Verification
            const honeyField = contactForm.querySelector('input[name="_honey"]');
            if (honeyField && honeyField.value.trim() !== '') {
                // Silently reject spam bots that populate hidden fields
                return;
            }

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnHTML = submitBtn.innerHTML;
            const currentLang = localStorage.getItem('cea_lang') || 'en';
            const sendingText = currentLang === 'pt' ? 'Enviando...' : 'Sending...';

            submitBtn.innerHTML = `<span>${sendingText}</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const subjectSelect = contactForm.querySelector('#subject');
                const selectedSubject = subjectSelect && subjectSelect.value ? subjectSelect.value : 'General Enquiry';
                formData.set('_subject', `[CEA-UFMG Website] ${selectedSubject}`);

                const response = await fetch('https://formsubmit.co/ajax/laguardia@demec.ufmg.br', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok && (result.success === "true" || result.success === true || result.message)) {
                    contactForm.reset();
                    if (successPane) successPane.classList.add('active');
                } else {
                    throw new Error(result.message || 'Form submission failed');
                }
            } catch (err) {
                console.error('Contact form submission error:', err);
                const errorMsg = currentLang === 'pt'
                    ? 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente ou entre em contato diretamente pelo e-mail do laboratório.'
                    : 'An error occurred while sending your message. Please try again or contact the laboratory directly via email.';
                alert(errorMsg);
            } finally {
                submitBtn.innerHTML = originalBtnHTML;
                submitBtn.disabled = false;
            }
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
