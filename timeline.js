document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const audioUpload = document.getElementById('audioUpload');
    const timelineClips = document.querySelector('.timeline-clips');

    // Remove timeline-related elements
    const timelineViewBtn = document.getElementById('timelineViewBtn');
    if (timelineViewBtn) {
        timelineViewBtn.remove();
    }

    const timelinePage = document.querySelector('.timeline-page');
    if (timelinePage) {
        timelinePage.remove();
    }

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
        
        // Clear existing waveforms
        clearWaveforms();
        // Create new waveform visualization
        createWaveformVisualization(audioBuffer);
        
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

    // Create timeline page if it doesn't exist
    let timelinePage = document.querySelector('.timeline-page');
    if (!timelinePage) {
        timelinePage = document.createElement('div');
        timelinePage.className = 'timeline-page';
        timelinePage.innerHTML = `
            <div class="timeline-header">
                <button class="close-timeline">Close</button>
            </div>
            <div class="timeline-content">
                <div class="waveform-container"></div>
                <div class="timeline-tracks"></div>
            </div>
        `;
        document.body.appendChild(timelinePage);
    }

    // Add click handlers for timeline view
    timelineViewBtn.addEventListener('click', () => {
        timelinePage.classList.add('active');
    });

    document.querySelector('.close-timeline').addEventListener('click', () => {
        timelinePage.classList.remove('active');
    });
});

// Remove these functions
// - clearWaveforms
// - createWaveformVisualization
// - drawWaveform
// - toggleTimelineView
// - startPlayback
// - pausePlayback
// - stopPlayback
// - updatePlayhead
// - formatTime

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
