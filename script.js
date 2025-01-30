document.addEventListener('DOMContentLoaded', () => {
    const spotlights = document.querySelectorAll('.spotlight');

    function setLightCue(spotlightId, color, intensity) {
        const spotlight = document.getElementById(spotlightId);
        if (spotlight) {
            spotlight.style.backgroundColor = color;
            spotlight.style.opacity = intensity;
        }
    }

    // Example light cues
    setLightCue('spotlight1', 'rgba(255, 0, 0, 0.5)', 0.5);
    setLightCue('spotlight2', 'rgba(0, 255, 0, 0.5)', 0.7);
    setLightCue('spotlight3', 'rgba(0, 0, 255, 0.5)', 0.9);
    setLightCue('spotlight4', 'rgba(255, 255, 0, 0.5)', 0.6);
    setLightCue('spotlight5', 'rgba(255, 255, 0, 0.5)', 0.6); // Overlapping with spotlight4
    setLightCue('spotlight6', 'rgba(255, 0, 255, 0.5)', 0.8);
    setLightCue('spotlight7', 'rgba(0, 255, 255, 0.5)', 0.4);
    setLightCue('spotlight8', 'rgba(255, 165, 0, 0.5)', 0.5);
});
