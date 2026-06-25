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

    // 3. Content Layer Float-in ScrollTrigger
    // Animates the opacity, slide, and 3D rotation of the content layer as it enters the viewport
    gsap.from("#content-layer", {
        scrollTrigger: {
            trigger: "#content-layer",
            start: "top 98%", // Start animation when the top of the layer enters the screen
            end: "top 70%",   // Complete animation by the time the top is at 70% height
            scrub: 1 // Link to scroll progress smoothly
        },
        y: 100, // Slide up
        opacity: 0,
        rotationX: 8,
        transformPerspective: 1200,
        transformOrigin: "top center"
    });

    // Subtle fade in and float for individual cards as they scroll into view
    const cards = gsap.utils.toArray(".service-card, .app-box");
    cards.forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // Starts animation when card top reaches 85% of viewport height
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });
});
