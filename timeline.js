let audioContext;
let audioBuffer;
let audioSource;
let isPlaying = false;
let startTime;
let playhead;
let timeDisplay;
let animationFrame;
const pixelsPerSecond = 100; // 100px = 1 second

document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const audioUpload = document.getElementById('audioUpload');
    const timelineClips = document.querySelector('.timeline-clips');
    playhead = document.querySelector('.playhead');
    timeDisplay = document.querySelector('.time-display');

    // Initialize Web Audio API
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error('Web Audio API not supported:', e);
    }

    // Play/Pause button handler
    playPauseBtn.addEventListener('click', () => {
        if (!audioBuffer) return;
        
        if (isPlaying) {
            pausePlayback();
        } else {
            startPlayback();
        }
    });

    // Stop button handler
    stopBtn.addEventListener('click', stopPlayback);

    // Audio file upload handler
    audioUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Draw waveform
        drawWaveform(audioBuffer);
        
        // Update timeline width based on audio duration
        timelineClips.style.width = `${audioBuffer.duration * pixelsPerSecond}px`;
    });

    // Make clips draggable on timeline
    let isDragging = false;
    let dragStartX;
    let originalLeft;
    let currentClip;

    function onMouseDown(e) {
        if (!e.target.classList.contains('timeline-clip')) return;
        
        isDragging = true;
        currentClip = e.target;
        dragStartX = e.clientX;
        originalLeft = parseInt(currentClip.style.left) || 0;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const newLeft = Math.max(0, originalLeft + deltaX);
        currentClip.style.left = `${newLeft}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    timelineClips.addEventListener('mousedown', onMouseDown);

    // Allow dropping scenes onto timeline
    document.addEventListener('drop', (e) => {
        if (!e.target.classList.contains('timeline-track')) return;
        
        e.preventDefault();
        const sceneName = e.dataTransfer.getData('text/plain');
        const clip = createClip(sceneName, e.offsetX);
        timelineClips.appendChild(clip);
    });
});

function startPlayback() {
    if (!audioBuffer) return;
    
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    
    const playheadPosition = parseInt(playhead.style.left) || 0;
    const startOffset = playheadPosition / pixelsPerSecond;
    
    audioSource.start(0, startOffset);
    startTime = audioContext.currentTime - startOffset;
    isPlaying = true;
    
    document.getElementById('playPauseBtn').textContent = 'Pause';
    updatePlayhead();
}

function pausePlayback() {
    if (!audioSource) return;
    
    audioSource.stop();
    isPlaying = false;
    document.getElementById('playPauseBtn').textContent = 'Play';
    cancelAnimationFrame(animationFrame);
}

function stopPlayback() {
    pausePlayback();
    playhead.style.left = '0px';
    timeDisplay.textContent = '00:00.000';
}

function updatePlayhead() {
    if (!isPlaying) return;
    
    const currentTime = audioContext.currentTime - startTime;
    const position = currentTime * pixelsPerSecond;
    
    playhead.style.left = `${position}px`;
    timeDisplay.textContent = formatTime(currentTime);
    
    // Execute scenes based on playhead position
    executeSceneAtPosition(position);
    
    if (currentTime < audioBuffer.duration) {
        animationFrame = requestAnimationFrame(updatePlayhead);
    } else {
        stopPlayback();
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function drawWaveform(audioBuffer) {
    const canvas = document.querySelector('.waveform');
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
}

function createClip(sceneName, position) {
    const clip = document.createElement('div');
    clip.className = 'timeline-clip';
    clip.style.left = `${position}px`;
    clip.style.width = '200px';  // Default width, can be made adjustable
    
    const label = document.createElement('div');
    label.className = 'clip-label';
    label.textContent = sceneName;
    
    clip.appendChild(label);
    return clip;
}

function executeSceneAtPosition(position) {
    const clips = document.querySelectorAll('.timeline-clip');
    
    clips.forEach(clip => {
        const clipLeft = parseInt(clip.style.left);
        const clipRight = clipLeft + clip.offsetWidth;
        
        if (position >= clipLeft && position <= clipRight) {
            const sceneName = clip.querySelector('.clip-label').textContent;
            loadScene(sceneName);
        }
    });
}

// Make scenes draggable onto timeline
document.querySelectorAll('.scene-item').forEach(scene => {
    scene.setAttribute('draggable', true);
    
    scene.addEventListener('dragstart', (e) => {
        const sceneName = e.target.querySelector('.scene-name').textContent;
        e.dataTransfer.setData('text/plain', sceneName);
    });
});
