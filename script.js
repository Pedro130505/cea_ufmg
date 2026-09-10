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
    const errorBanner = document.getElementById('form-error-banner');
    const mailtoFallback = document.getElementById('form-mailto-fallback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (errorBanner) errorBanner.style.display = 'none';

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

            const nameInput = contactForm.querySelector('#name');
            const emailInput = contactForm.querySelector('#email');
            const subjectSelect = contactForm.querySelector('#subject');
            const messageInput = contactForm.querySelector('#message');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const subjectVal = subjectSelect && subjectSelect.value ? subjectSelect.value : 'General Enquiry';
            const messageVal = messageInput ? messageInput.value.trim() : '';

            try {
                const formData = new FormData(contactForm);
                formData.set('_subject', `[CEA-UFMG Website] ${subjectVal}`);

                // Clean and sanitize _cc list: strip any spaces between commas to prevent FormSubmit 500 errors
                if (formData.has('_cc')) {
                    const rawCc = formData.get('_cc');
                    const cleanCc = rawCc.split(',').map(s => s.trim()).filter(Boolean).join(',');
                    if (cleanCc) {
                        formData.set('_cc', cleanCc);
                    } else {
                        formData.delete('_cc');
                    }
                }

                // Remove _honey from payload if empty
                if (formData.has('_honey') && !formData.get('_honey')) {
                    formData.delete('_honey');
                }

                const response = await fetch('https://formsubmit.co/ajax/Lhmachado.ufmg@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                let result = {};
                try {
                    result = await response.json();
                } catch (jsonErr) {
                    result = {};
                }

                if (response.ok && (result.success === "true" || result.success === true || result.message === "The form was submitted successfully.")) {
                    contactForm.reset();
                    if (errorBanner) errorBanner.style.display = 'none';
                    if (successPane) successPane.classList.add('active');
                } else {
                    throw new Error(result.message || 'Form submission failed');
                }
            } catch (err) {
                console.error('Contact form submission error:', err);

                // Build mailto link so user doesn't lose their message
                const mailtoSubject = encodeURIComponent(`[CEA-UFMG] ${subjectVal} - ${nameVal}`);
                const mailtoBody = encodeURIComponent(`Nome: ${nameVal}\nE-mail: ${emailVal}\nAssunto: ${subjectVal}\n\nMensagem:\n${messageVal}`);
                const mailtoUrl = `mailto:Lhmachado.ufmg@gmail.com?cc=laguardia@demec.ufmg.br,lhmachado@ufmg.br&subject=${mailtoSubject}&body=${mailtoBody}`;

                if (mailtoFallback) {
                    mailtoFallback.href = mailtoUrl;
                }

                if (errorBanner) {
                    errorBanner.style.display = 'flex';
                } else {
                    const errorMsg = currentLang === 'pt'
                        ? 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente ou entre em contato diretamente pelo e-mail do laboratório.'
                        : 'An error occurred while sending your message. Please try again or contact the laboratory directly via email.';
                    alert(errorMsg);
                }
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
            if (errorBanner) errorBanner.style.display = 'none';
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
       HISTORICAL PHOTOGRAPHIC ARCHIVE SLIDER & FILTERING
       ========================================================================== */
    const acervoFilterBtns = document.querySelectorAll('.acervo-filter-btn');
    const acervoCards = document.querySelectorAll('.acervo-card');
    const acervoTrack = document.getElementById('acervo-track');
    const acervoPrev = document.getElementById('acervo-prev-btn');
    const acervoNext = document.getElementById('acervo-next-btn');

    if (acervoTrack && acervoPrev && acervoNext) {
        acervoPrev.addEventListener('click', () => {
            const scrollDist = acervoTrack.clientWidth * 0.75;
            acervoTrack.scrollBy({ left: -scrollDist, behavior: 'smooth' });
        });
        acervoNext.addEventListener('click', () => {
            const scrollDist = acervoTrack.clientWidth * 0.75;
            acervoTrack.scrollBy({ left: scrollDist, behavior: 'smooth' });
        });
    }

    if (acervoFilterBtns.length > 0 && acervoCards.length > 0) {
        acervoFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                acervoFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterVal = btn.getAttribute('data-filter');
                acervoCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (filterVal === 'all' || cardCat === filterVal) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });

                if (acervoTrack) {
                    acervoTrack.scrollTo({ left: 0, behavior: 'smooth' });
                }
            });
        });
    }

    /* ==========================================================================
       TECHNICAL LIGHTBOX MODAL (Dynamic & Zoomable)
       ========================================================================== */
    let lightboxModal = document.getElementById('lightbox-modal');
    if (!lightboxModal) {
        lightboxModal = document.createElement('div');
        lightboxModal.id = 'lightbox-modal';
        lightboxModal.className = 'lightbox-modal';
        lightboxModal.setAttribute('role', 'dialog');
        lightboxModal.setAttribute('aria-hidden', 'true');
        lightboxModal.innerHTML = `
            <div class="lightbox-content-box">
                <button id="lightbox-close" class="lightbox-close-btn" aria-label="Close lightbox">&times;</button>
                <img id="lightbox-img" src="" alt="" style="width: 100%; max-height: 80vh; object-fit: contain; display: block; background: #000;">
                <div id="lightbox-caption" style="padding: 1rem 1.5rem; background: var(--bg-panel); color: var(--text-muted); font-size: 0.88rem; border-top: 1px solid var(--border-light); font-family: var(--font-mono); line-height: 1.5;"></div>
            </div>
        `;
        document.body.appendChild(lightboxModal);
    }

    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src, captionText) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        if (lightboxCaption) {
            lightboxCaption.textContent = captionText || 'Registro de Engenharia CEA-UFMG';
        }
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.zoomable-img, .acervo-zoomable').forEach(imgEl => {
        imgEl.style.cursor = 'zoom-in';
        imgEl.addEventListener('click', () => {
            const fullSrc = imgEl.getAttribute('data-full') || imgEl.src;
            const caption = imgEl.getAttribute('data-caption') || imgEl.getAttribute('alt') || '';
            openLightbox(fullSrc, caption);
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    /* ==========================================================================
       READ MORE / READ LESS FOR AIRCRAFT EXTENDED HISTORIES
       ========================================================================== */
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cardInner = btn.closest('.aircraft-block-inner');
            if (!cardInner) return;
            const extendedBox = cardInner.querySelector('.aircraft-extended-history');
            if (!extendedBox) return;

            const isExpanded = extendedBox.classList.contains('active');
            if (isExpanded) {
                extendedBox.classList.remove('active');
                btn.classList.remove('active');
                const lang = localStorage.getItem('cea_lang') || 'en';
                btn.querySelector('.read-more-text').textContent = lang === 'pt' ? 'Leia mais' : 'Read more';
            } else {
                extendedBox.classList.add('active');
                btn.classList.add('active');
                const lang = localStorage.getItem('cea_lang') || 'en';
                btn.querySelector('.read-more-text').textContent = lang === 'pt' ? 'Recolher' : 'Read less';
            }
        });
    });

    /* ==========================================================================
       HISTORICAL PROJECT REGISTER ACCORDION / TOGGLE
       ========================================================================== */
    const registerToggleBtn = document.getElementById('register-accordion-toggle');
    const registerCollapseContent = document.getElementById('register-accordion-content');

    if (registerToggleBtn && registerCollapseContent) {
        registerToggleBtn.addEventListener('click', () => {
            const isOpen = registerCollapseContent.classList.contains('active');
            if (isOpen) {
                registerCollapseContent.classList.remove('active');
                registerToggleBtn.classList.remove('active');
            } else {
                registerCollapseContent.classList.add('active');
                registerToggleBtn.classList.add('active');
            }
        });
    }

});


