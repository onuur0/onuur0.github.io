// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // Initial state setups to prevent flash of unstyled content (FOUC)
    gsap.set("#bg-text-layer", {
        opacity: 0.08,
        y: 0,
        filter: "blur(6px)"
    });

    gsap.set("#hand-left", {
        x: "-1vw", // Shift slightly left initially (brought closer)
        y: 0,
        scale: 1.15, // Make 15% larger
        opacity: 1,
        filter: "blur(0px)"
    });

    gsap.set("#hand-right", {
        x: "1vw", // Shift slightly right initially (brought closer)
        y: 0,
        scale: 1.15, // Make 15% larger
        opacity: 1,
        filter: "blur(0px)"
    });


    // Scroll-linked timeline
    const mainTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero-scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2, // Gives a slight weightless delay / inertia to mouse movement
            invalidateOnRefresh: true
        }
    });

    // 1. Hands split and background text becomes prominent (0% to 40% scroll)
    mainTimeline.to("#hand-left", {
        x: "-48vw", // Separate slightly further off-screen to account for larger scale
        y: "-20vh",
        opacity: 0,
        filter: "blur(24px)",
        duration: 1.5,
        ease: "power2.inOut"
    }, 0);

    mainTimeline.to("#hand-right", {
        x: "48vw", // Separate slightly further off-screen to account for larger scale
        y: "20vh",
        opacity: 0,
        filter: "blur(24px)",
        duration: 1.5,
        ease: "power2.inOut"
    }, 0);





    // Background title gets clear and moves up slightly
    mainTimeline.to("#bg-text-layer", {
        opacity: 0.9,
        filter: "blur(0px)",
        y: -80,
        duration: 1.2,
        ease: "power2.out"
    }, 0);

    // Hide scroll indicator mouse as user scrolls down
    mainTimeline.to(".scroll-indicator", {
        opacity: 0,
        y: 30,
        duration: 0.4,
        ease: "power1.out"
    }, 0);

    // 2. Parallax effect for the background text as scroll continues (40% to 75% scroll)
    // Slower movement relative to the incoming content layer to create deep Z-depth
    mainTimeline.to("#bg-text-layer", {
        y: -180,
        opacity: 0.4,
        scale: 0.95,
        duration: 1.5,
        ease: "none"
    }, 1.2);

    // 3. Services Section Entrance Animation
    const servicesTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#services",
            start: "top 90%", // Trigger when the top of services is near the bottom of the viewport
            toggleActions: "play none none reverse",
            onLeaveBack: () => {
                document.querySelectorAll(".service-card").forEach(card => card.classList.remove("animation-done"));
            }
        }
    });

    servicesTL.from("#services .section-meta, #services .section-title", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });

    servicesTL.from(".service-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        onComplete: () => {
            document.querySelectorAll(".service-card").forEach(card => card.classList.add("animation-done"));
        }
    }, "-=0.4");

    // 4. Portfolio Section Entrance Animation
    const portfolioTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#portfolio",
            start: "top 90%", // Trigger when the top of portfolio is near the bottom of the viewport
            toggleActions: "play none none reverse"
        }
    });

    portfolioTL.from("#portfolio .section-meta, #portfolio .section-title", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });

    // Animate each project box (app-box) individually as it enters the viewport
    const appBoxes = gsap.utils.toArray(".app-box");
    appBoxes.forEach((box) => {
        gsap.from(box, {
            scrollTrigger: {
                trigger: box,
                start: "top 92%", // Trigger when the top of the box enters the bottom of the viewport
                toggleActions: "play none none reverse",
                onLeaveBack: () => {
                    box.classList.remove("animation-done");
                }
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
                box.classList.add("animation-done");
            }
        });
    });
});
