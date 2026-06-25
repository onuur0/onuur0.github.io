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

    // 3. Content Layer & Cards Entrance Animation
    // Creates a single, unified timeline that animates the parent container and staggers the children
    // to avoid multiple ScrollTrigger calculation conflicts on moving elements.
    const contentTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#content-layer",
            start: "top 92%", // Trigger when the top of the layer is near the bottom of the viewport
            toggleActions: "play none none reverse" // Play on scroll down, reverse on scroll up
        }
    });

    // Parent float-in & fade-in
    contentTL.from("#content-layer", {
        y: 80,
        opacity: 0,
        rotationX: 6,
        transformPerspective: 1200,
        transformOrigin: "top center",
        duration: 1.0,
        ease: "power3.out"
    });

    // Child cards stagger-in (offsetting to overlap with parent animation)
    contentTL.from(".service-card, .app-box", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    }, "-=0.7");
});
