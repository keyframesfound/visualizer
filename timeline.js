class Timeline {
    constructor() {
        this.timelineTrack = document.querySelector('.timeline-track');
        this.scenes = [];
        this.isDragging = false;
        this.currentScene = null;
        this.dragOffset = 0;
        
        this.initializeEvents();
    }

    initializeEvents() {
        this.timelineTrack.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.timelineTrack.addEventListener('drop', (e) => {
            e.preventDefault();
            const sceneName = e.dataTransfer.getData('text/plain');
            const sceneData = e.dataTransfer.getData('application/json');
            const rect = this.timelineTrack.getBoundingClientRect();
            const dropPosition = e.clientX - rect.left;
            this.addSceneAtPosition(sceneName, dropPosition, JSON.parse(sceneData));
        });

        this.timelineTrack.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }

    addSceneAtPosition(sceneName, position, sceneData) {
        const scene = document.createElement('div');
        scene.className = 'scene-marker';
        scene.textContent = sceneName;
        scene.style.left = `${position}px`;
        scene.setAttribute('data-start', position);
        scene.setAttribute('data-scene', JSON.stringify(sceneData));
        
        this.timelineTrack.appendChild(scene);
        this.scenes.push(scene);

        scene.addEventListener('click', () => {
            if (!this.isDragging) {
                loadScene(sceneName, sceneData);
            }
        });

        return scene;
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
        this.currentScene.setAttribute('data-start', Math.round(newLeft));
    }

    handleMouseUp() {
        if (this.currentScene) {
            this.currentScene.classList.remove('dragging');
        }
        this.isDragging = false;
        this.currentScene = null;
    }

    getScenes() {
        return Array.from(this.scenes).map(scene => ({
            id: scene.textContent,
            startTime: parseInt(scene.getAttribute('data-start'))
        }));
    }
}
