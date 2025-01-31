class Timeline {
    constructor() {
        this.timelineTrack = document.querySelector('.timeline-track');
        this.scenes = [];
        this.isDragging = false;
        this.currentScene = null;
        this.dragOffset = 0;
        this.duration = 60; // 1 minutes in seconds
        this.pixelsPerSecond = this.timelineTrack.clientWidth / this.duration;
        
        this.initializeEvents();
        this.addTimeMarkers();
    }

    initializeEvents() {
        // Drag and drop from scene list
        this.timelineTrack.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.timelineTrack.classList.add('drag-over');
        });

        this.timelineTrack.addEventListener('dragleave', () => {
            this.timelineTrack.classList.remove('drag-over');
        });

        this.timelineTrack.addEventListener('drop', (e) => {
            e.preventDefault();
            this.timelineTrack.classList.remove('drag-over');
            const sceneName = e.dataTransfer.getData('text/plain');
            const sceneData = e.dataTransfer.getData('application/json');
            const rect = this.timelineTrack.getBoundingClientRect();
            const dropPosition = e.clientX - rect.left;
            const timePosition = this.pixelToTime(dropPosition);
            this.addSceneAtTime(sceneName, timePosition, JSON.parse(sceneData));
        });

        // Scene dragging on timeline
        this.timelineTrack.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Handle resize
        window.addEventListener('resize', () => {
            this.pixelsPerSecond = this.timelineTrack.clientWidth / this.duration;
            this.updateAllScenePositions();
        });
    }

    addTimeMarkers() {
        const grid = document.createElement('div');
        grid.className = 'timeline-grid';
        
        for (let i = 0; i <= this.duration; i += 5) {
            const marker = document.createElement('div');
            marker.className = 'timeline-mark';
            marker.textContent = this.formatTime(i);
            marker.style.left = `${(i / this.duration) * 100}%`;
            grid.appendChild(marker);
        }
        
        this.timelineTrack.appendChild(grid);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    pixelToTime(pixels) {
        return (pixels / this.timelineTrack.clientWidth) * this.duration;
    }

    timeToPixel(time) {
        return (time / this.duration) * this.timelineTrack.clientWidth;
    }

    addSceneAtTime(sceneName, time, sceneData) {
        const scene = document.createElement('div');
        scene.className = 'scene-marker';
        scene.textContent = sceneName;
        scene.style.left = `${this.timeToPixel(time)}px`;
        scene.setAttribute('data-time', time);
        scene.setAttribute('data-scene', JSON.stringify(sceneData));
        scene.setAttribute('draggable', true);
        
        this.timelineTrack.appendChild(scene);
        this.scenes.push({
            element: scene,
            name: sceneName,
            time: time,
            data: sceneData
        });

        this.sortScenes();
        return scene;
    }

    sortScenes() {
        this.scenes.sort((a, b) => a.time - b.time);
    }

    updateAllScenePositions() {
        this.scenes.forEach(scene => {
            scene.element.style.left = `${this.timeToPixel(scene.time)}px`;
        });
    }

    handleMouseDown(e) {
        if (e.target.classList.contains('scene-marker')) {
            this.isDragging = true;
            this.currentScene = e.target;
            this.currentScene.classList.add('dragging');
            const rect = this.currentScene.getBoundingClientRect();
            this.dragOffset = e.clientX - rect.left;
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const timelineRect = this.timelineTrack.getBoundingClientRect();
        let newLeft = e.clientX - timelineRect.left - this.dragOffset;
        newLeft = Math.max(0, Math.min(newLeft, timelineRect.width - this.currentScene.offsetWidth));
        
        this.currentScene.style.left = `${newLeft}px`;
        const newTime = this.pixelToTime(newLeft);
        this.currentScene.setAttribute('data-time', newTime);
        
        const sceneIndex = this.scenes.findIndex(s => s.element === this.currentScene);
        if (sceneIndex !== -1) {
            this.scenes[sceneIndex].time = newTime;
        }
    }

    handleMouseUp() {
        if (this.currentScene) {
            this.currentScene.classList.remove('dragging');
            this.sortScenes();
        }
        this.isDragging = false;
        this.currentScene = null;
    }

    getScenes() {
        return this.scenes.map(scene => ({
            name: scene.name,
            time: scene.time,
            data: scene.data
        }));
    }
}
