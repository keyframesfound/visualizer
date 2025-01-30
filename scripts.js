// ...existing code...

function setLightBrightness(lightElement, brightness) {
    if (brightness < 1 || brightness > 10) {
        console.error('Brightness must be between 1 and 10');
        return;
    }
    const brightnessPercentage = (brightness / 10) * 100;
    lightElement.style.opacity = brightnessPercentage / 100;
}

function makeLightGlow(lightElement) {
    lightElement.style.animation = 'glow 1s infinite alternate';
}

// Add keyframes for glow animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes glow {
        from {
            box-shadow: 0 0 5px white;
        }
        to {
            box-shadow: 0 0 20px white;
        }
    }
`, styleSheet.cssRules.length);

// Example usage
document.querySelectorAll('.light').forEach(light => {
    setLightBrightness(light, 5); // Set brightness to 5
    makeLightGlow(light); // Make the light glow
});
