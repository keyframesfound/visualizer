class Timeline {
    constructor() {
        this.timelineTrack = document.querySelector('.timeline-track');
        this.scenes = [];
        this.isDragging = false;
        this.currentScene = null;
        this.dragOffset = 0;
        this.sceneCounter = 0;
        
        this.initializeEvents();
    }

    initializeEvents() {
        // Timeline drop event
        this.timelineTrack.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.timelineTrack.addEventListener('drop', (e) => {
            e.preventDefault();
            const sceneName = e.dataTransfer.getData('text/plain');
            const rect = this.timelineTrack.getBoundingClientRect();
            const dropPosition = e.clientX - rect.left;
            this.addSceneAtPosition(sceneName, dropPosition);
        });

        // Existing mouse events for dragging scenes on timeline
        this.timelineTrack.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }

    addScene() {
        const timelineRect = this.timelineTrack.getBoundingClientRect();
        const sceneWidth = 100; // Width of scene marker in pixels
        
        // Calculate position for new scene
        let position = 0;
        if (this.scenes.length > 0) {
            const lastScene = this.scenes[this.scenes.length - 1];
            const lastSceneLeft = parseInt(lastScene.style.left);
            position = Math.min(lastSceneLeft + sceneWidth, timelineRect.width - sceneWidth);
        }

        const scene = document.createElement('div');
        scene.className = 'scene-marker';
        this.sceneCounter++;
        scene.textContent = `Scene ${this.sceneCounter}`;
        scene.style.left = `${position}px`;
        scene.setAttribute('data-start', position);
        
        this.timelineTrack.appendChild(scene);
        this.scenes.push(scene);

        return scene;
    }

    addSceneAtPosition(sceneName, position) {
        const scene = document.createElement('div');
        scene.className = 'scene-marker';
        scene.setAttribute('draggable', true);
        scene.textContent = sceneName;
        scene.style.left = `${position}px`;
        scene.setAttribute('data-start', position);
        
        this.timelineTrack.appendChild(scene);
        this.scenes.push(scene);

        // Load scene data when clicked
        scene.addEventListener('click', () => {
            if (!this.isDragging) {
                loadScene(sceneName);
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
        
        // Constrain to timeline bounds
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
