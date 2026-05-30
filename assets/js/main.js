(function ($) {
    "use strict";

    // ============================================================
    // Preloader — must be registered BEFORE $(document).ready
    // to guarantee the window load event is not missed
    // ============================================================
    (function () {
        var preloaderDone = false;

        function hidePreloader() {
            if (preloaderDone) return;
            preloaderDone = true;

            if (typeof gsap !== 'undefined') {
                gsap.to(".preloader__content", {
                    duration: 0.7,
                    opacity: 0,
                    y: -20,
                    ease: "power3.in"
                });
                gsap.to(".preloader", {
                    duration: 0.9,
                    delay: 0.5,
                    yPercent: -100,
                    ease: "expo.inOut",
                    onComplete: function () {
                        var el = document.querySelector(".preloader");
                        if (el) el.style.display = "none";
                    }
                });
            } else {
                // Fallback: plain CSS hide if GSAP not ready
                var el = document.querySelector(".preloader");
                if (el) el.style.display = "none";
            }
        }

        // Primary: fires when ALL resources (images, fonts, scripts) are loaded
        window.addEventListener("load", hidePreloader);

        // Safety net: hide after 4 s even if a resource never loads
        setTimeout(hidePreloader, 4000);
    })();


    $(document).ready(function () {

        // ============================================================
        // GSAP Plugin Registration
        // ============================================================
        try {
            gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        } catch (e) {
            console.warn("GSAP plugin registration failed:", e);
        }


        // ============================================================
        // WOW.js Init (for legacy wow-marked elements)
        // ============================================================
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }


        // ============================================================
        // Sticky Header (Eduflow pattern)
        // ============================================================
        function pinned_header() {
            var lastScrollTop = 500;

            // Create a placeholder for each sticky header to prevent layout jumping and flickering
            $('.header-sticky').each(function () {
                var $this = $(this);
                // Only wrap if not already wrapped
                if (!$this.parent().hasClass('sticky-placeholder')) {
                    $this.wrap('<div class="sticky-placeholder"></div>');
                }
                // Set the placeholder height to match the header's height
                $this.parent('.sticky-placeholder').css('height', $this.outerHeight() + 'px');
            });

            $(window).on('resize', function () {
                $('.header-sticky').each(function () {
                    var $this = $(this);
                    // Update placeholder height on resize if not currently sticky
                    if (!$this.hasClass('sticky')) {
                        $this.parent('.sticky-placeholder').css('height', $this.outerHeight() + 'px');
                    }
                });
            });

            $(window).on('scroll', function () {
                var currentScrollTop = $(this).scrollTop();

                if (currentScrollTop > lastScrollTop) {
                    $('.header-sticky').removeClass('sticky').addClass('transformed');
                } else if (currentScrollTop <= 300) {
                    $('.header-sticky').removeClass('sticky').removeClass('transformed');
                } else {
                    $('.header-sticky').addClass('sticky').removeClass('transformed');
                }
                lastScrollTop = currentScrollTop;
            });
        }
        pinned_header();


        // ============================================================
        // Offcanvas Side Info Toggle
        // ============================================================
        $(".side-toggle").on("click", function () {
            $(".side-info").addClass("info-open");
            $(".offcanvas-overlay").addClass("overlay-open");
            $("body").addClass("overflow-hidden");

            // Always start fresh so re-opens animate correctly
            gsap.set(".side-info__item", { opacity: 0, y: 30 });
            gsap.to(".side-info__item", {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.3,
                clearProps: "transform,opacity" // ← clears inline styles after done
            });
        });

        $("#side-info-close, .offcanvas-overlay").on("click", function () {
            $(".side-info").removeClass("info-open");
            $(".offcanvas-overlay").removeClass("overlay-open");
            $("body").removeClass("overflow-hidden");

            // Reset items immediately so next open starts clean
            gsap.set(".side-info__item", { clearProps: "all" });
        });


        // ============================================================
        // Mobile Nav — accordion toggle inside offcanvas sidebar
        // ============================================================
        $(".mobile-nav__item--has-children > .mobile-nav__link").on("click", function (e) {
            e.preventDefault();
            var $parent = $(this).closest(".mobile-nav__item--has-children");
            var $sub = $parent.find("> .mobile-nav__sub");

            // Close any other open items at same level
            $parent.siblings(".mobile-nav__item--has-children.open")
                .removeClass("open")
                .find("> .mobile-nav__sub").slideUp(280);

            // Toggle this one
            $parent.toggleClass("open");
            $sub.slideToggle(280);
        });


        // ============================================================
        // Initialize Lenis Smooth Scroll
        // ============================================================
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Sync GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);


        // ============================================================
        // GSAP — Data Speed Parallax
        // ============================================================
        gsap.utils.toArray('[data-speed]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0;
            if (speed === 0) return;

            gsap.to(el, {
                y: (speed * 100),
                ease: "none",
                scrollTrigger: {
                    trigger: el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });


        // ============================================================
        // WORD SPLIT ANIMATION ENGINE
        // ============================================================
        function splitWords(el) {
            if (!el || el.getAttribute('data-split-done')) {
                return el ? el.querySelectorAll('.split-word__inner') : null;
            }
            el.setAttribute('data-split-done', '1');

            var childNodes = Array.from(el.childNodes);
            el.innerHTML = '';

            childNodes.forEach(function (node) {
                if (node.nodeType === 3) {
                    var words = node.textContent.split(/\s+/).filter(Boolean);
                    words.forEach(function (word) {
                        var wrapper = document.createElement('span');
                        wrapper.className = 'split-word';
                        var inner = document.createElement('span');
                        inner.className = 'split-word__inner';
                        inner.textContent = word;
                        wrapper.appendChild(inner);
                        el.appendChild(wrapper);
                        el.appendChild(document.createTextNode(' '));
                    });
                } else {
                    el.appendChild(node.cloneNode(true));
                }
            });
            return el.querySelectorAll('.split-word__inner');
        }

        function animateWords(el, delay, onLoad) {
            if (!el) return;
            var words = splitWords(el);
            if (!words || !words.length) return;

            var config = {
                y: '105%',
                opacity: 0,
                duration: 0.7,
                stagger: 0.05,
                ease: 'power3.out',
                delay: delay || 0,
            };

            if (!onLoad) {
                config.scrollTrigger = {
                    trigger: el,
                    start: 'top 88%',
                };
            }
            gsap.from(words, config);
        }

        var wordSelectors = [
            '[class$="__subtitle"]:not(.hero1__subtitle):not(.hero2__subtitle):not(.hero3__subtitle)',
            '[class$="__title"]:not(.hero1__title):not(.hero2__title):not(.hero3__title)'
        ];

        wordSelectors.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                animateWords(el, 0, false);
            });
        });

        // ============================================================
        // GRID REVEAL ANIMATION (tw-anim-img)
        // ============================================================
        const initialClipPaths = [
            "polygon(0% 0%, 34.33% 0%, 34.33% 34.33%, 0% 34.33%)",
            "polygon(32.33% 0%, 66.66% 0%, 66.66% 33.33%, 33.33% 34.33%)",
            "polygon(65.66% 0%, 100% 0%, 100% 33.33%, 65.66% 34.33%)",
            "polygon(0% 33.33%, 33.33% 33.33%, 33.33% 66.66%, 0% 66.66%)",
            "polygon(30.33% 33.33%, 66.66% 33.33%, 66.66% 66.66%, 33.33% 66.66%)",
            "polygon(65.66% 33.33%, 100% 32.33%, 100% 66.66%, 65.66% 66.66%)",
            "polygon(0% 65.66%, 33.33% 66.66%, 33.33% 100%, 0% 100%)",
            "polygon(30.33% 66.66%, 66.66% 65.66%, 66.66% 100%, 33.33% 100%)",
            "polygon(65.66% 66.66%, 100% 65.66%, 100% 100%, 65.66% 100%)"
        ];

        function initGridReveal() {
            document.querySelectorAll(".tw-clip-anim").forEach(wrapper => {
                const img = wrapper.querySelector(".tw-anim-img[data-animate='true']");
                if (!img) return;
                const url = img.src;

                // Clear existing masks
                wrapper.querySelectorAll(".mask").forEach(m => m.remove());

                // Create 9 mask divs
                for (let i = 0; i < 9; i++) {
                    const mask = document.createElement("div");
                    mask.className = `mask mask-${i + 1}`;
                    Object.assign(mask.style, {
                        backgroundImage: `url(${url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "absolute",
                        inset: "0"
                    });
                    wrapper.appendChild(mask);
                }

                // Animate masks
                const masks = wrapper.querySelectorAll(".mask");
                gsap.set(masks, { clipPath: (i) => initialClipPaths[i] });

                const order = [
                    [".mask-1"],
                    [".mask-2", ".mask-4"],
                    [".mask-3", ".mask-5", ".mask-7"],
                    [".mask-6", ".mask-8"],
                    [".mask-9"]
                ];

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrapper,
                        start: "top 75%",
                    }
                });

                order.forEach((targets, i) => {
                    const validTargets = targets
                        .map(c => wrapper.querySelector(c))
                        .filter(el => el);

                    if (validTargets.length) {
                        tl.to(validTargets, {
                            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                            duration: 1.2,
                            ease: "power2.inOut"
                        }, i * 0.15);
                    }
                });
            });
        }

        initGridReveal();


        // ============================================================
        // GSAP fade-anim — ScrollTrigger fade-in animation system
        // ============================================================
        var fadeItems = document.querySelectorAll(".fade-anim");
        if (fadeItems.length > 0) {
            fadeItems.forEach(function (item) {
                var direction = item.getAttribute("data-direction") || "bottom";
                var offset = parseFloat(item.getAttribute("data-offset") || 50);
                var duration = parseFloat(item.getAttribute("data-duration") || 1.15);
                var delay = parseFloat(item.getAttribute("data-delay") || 0.15);
                var ease = item.getAttribute("data-ease") || "power2.out";
                var onScroll = item.getAttribute("data-on-scroll") !== "0";

                var fromVars = { opacity: 0, ease: ease, duration: duration, delay: delay };

                if (direction === "top") fromVars.y = -offset;
                if (direction === "bottom") fromVars.y = offset;
                if (direction === "left") fromVars.x = -offset;
                if (direction === "right") fromVars.x = offset;

                if (onScroll) {
                    fromVars.scrollTrigger = {
                        trigger: item,
                        start: "top 88%",
                    };
                }

                gsap.from(item, fromVars);
            });
        }



        // ============================================================
        // GSAP — Hero Section entrance animations on load
        // ============================================================
        if (document.querySelector(".hero1__content")) {
            // Use word animation for hero headings
            animateWords(document.querySelector(".hero1__subtitle"), 1.1, true);
            animateWords(document.querySelector(".hero1__title"), 1.4, true);

            gsap.from(".hero1__description", { y: 24, opacity: 0, duration: 0.7, ease: "power2.out", delay: 1.9 });
            gsap.from(".hero1__image-box", { x: 60, opacity: 0, duration: 1, ease: "power3.out", delay: 1.3 });
        }

        if (document.querySelector(".hero2__content")) {
            animateWords(document.querySelector(".hero2__subtitle"), 1.0, true);
            animateWords(document.querySelector(".hero2__title"), 1.3, true);

            gsap.from(".hero2__desc", { y: 24, opacity: 0, duration: 0.7, ease: "power2.out", delay: 1.7 });
        }

        if (document.querySelector(".hero3__content")) {
            animateWords(document.querySelector(".hero3__title"), 1.2, true);

            gsap.from(".hero3__desc", { y: 24, opacity: 0, duration: 0.7, ease: "power2.out", delay: 1.6 });
            gsap.from(".hero3__thumb", { x: -50, opacity: 0, duration: 1, ease: "power3.out", delay: 1.0 });
        }






        // ============================================================
        // Smooth Scroll for anchor links (GSAP ScrollToPlugin)
        // ============================================================
        $('a[href^="#"]').on('click', function (event) {
            var href = $(this).attr('href');
            if (href === "#") return;
            var target = $(href);
            if (target.length) {
                event.preventDefault();

                // Close sidebar if open
                if ($(".side-info").hasClass("info-open")) {
                    $(".side-info").removeClass("info-open");
                    $(".offcanvas-overlay").removeClass("overlay-open");
                }

                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: target.offset().top - 90,
                        autoKill: true
                    },
                    ease: "power2.inOut"
                });
            }
        });


        // ============================================================
        // Initialize Swiper — Service Slider
        // ============================================================
        if (document.querySelector('.service-slider')) {
            new Swiper('.service-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                centeredSlides: false,
                observer: true,
                observeParents: true,
                pagination: {
                    el: '.service-slider__pagination',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + ' swiper-pagination-bullet-custom">' +
                            (index + 1).toString().padStart(2, '0') + ' . </span>';
                    },
                },
                navigation: {
                    nextEl: '.service-slider__next',
                    prevEl: '.service-slider__prev',
                },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                },
            });
        }


        // ============================================================
        // Initialize Swiper — Courses2 Slider
        // ============================================================
        if (document.querySelector('.courses2-slider')) {
            new Swiper('.courses2-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                navigation: {
                    nextEl: '.courses2-slider__next',
                    prevEl: '.courses2-slider__prev',
                },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                },
            });
        }


        // ============================================================
        // Initialize Swiper — Testimonial Slider
        // ============================================================
        if (document.querySelector('.testimonial1__slider')) {
            new Swiper('.testimonial1__slider', {
                direction: 'vertical',
                slidesPerView: 2,
                spaceBetween: 24,
                loop: true,
                speed: 800,
                navigation: {
                    nextEl: '.testimonial1__nav-btn--next',
                    prevEl: '.testimonial1__nav-btn--prev',
                },
                breakpoints: {
                    0: {
                        direction: 'horizontal',
                        slidesPerView: 1,
                        spaceBetween: 24,
                        centeredSlides: true,
                        loop: false,
                    },
                    1200: {
                        direction: 'vertical',
                        slidesPerView: 2,
                        spaceBetween: 24,
                        loop: true,
                    }
                }
            });
        }

        // ============================================================
        // Initialize Swiper — Testimonial2 Slider
        // ============================================================
        if (document.querySelector('.testimonial2__slider')) {
            new Swiper('.testimonial2__slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                speed: 800,
                autoplay: false,
                mousewheel: true,
                navigation: {
                    nextEl: '.testimonial2 .swiper-nav-next',
                    prevEl: '.testimonial2 .swiper-nav-prev',
                },
                breakpoints: {
                    992: { slidesPerView: 2 },
                    1200: { slidesPerView: 2 }
                }
            });
        }

        // ============================================================
        // Initialize Swiper — Testimonial3 Slider
        // ============================================================
        if (document.querySelector('.testimonial3__slider')) {
            new Swiper('.testimonial3__slider', {
                direction: 'vertical',
                slidesPerView: 3,
                spaceBetween: 24,
                loop: true,
                autoplay: true,
                speed: 800,
                navigation: {
                    nextEl: '.nav-btn--next',
                    prevEl: '.nav-btn--prev',
                },
                // Responsive adjustments for height and view if needed
                breakpoints: {
                    768: {
                        slidesPerView: 3,
                    },
                    0: {
                        direction: 'horizontal', // Fallback to horizontal on mobile for better UX
                        slidesPerView: 1,
                    }
                }
            });
        }

        // ============================================================
        // Magnific Popup — Video Popup
        // ============================================================
        if ($.fn.magnificPopup) {
            $('.popup-video').magnificPopup({
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        }

    });

})(jQuery); // End jQuery