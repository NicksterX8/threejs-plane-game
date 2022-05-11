import * as THREE from './lib/three.module.js';
import { RGBELoader } from './lib/RGBELoader.js';
import { LoadingBar } from './lib/LoadingBar.js';
import { Plane } from './Plane.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { EnemyPlane } from './EnemyPlane.js'
import { Vector3 } from './lib/three.module.js';

class Game{

    constructor(){

        const container = document.createElement( 'div' );

        document.body.appendChild( container );

        this.loadingBar = new LoadingBar();

        this.loading = true;
    
        this.loadingBar.visible = true;

        this.clock = new THREE.Clock();

        this.assetsPath = 'assets/';

        var pressedKeys = {};
        window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
        window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
        this.pressedKeys = pressedKeys;

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );

        this.camera.position.set( -4, -3, -5 );

        this.camera.lookAt(0, 0, 6);

        this.cameraController = new THREE.Object3D();

        this.cameraController.add(this.camera);

        this.cameraTarget = new THREE.Vector3(0,0,6);

        //add the scene        

        this.scene = new THREE.Scene();

        this.scene.add(this.cameraController);

        //add light

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);

        ambient.position.set( 0.5, 1, 0.25 );

        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );

        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.outputEncoding = THREE.sRGBEncoding;

        container.appendChild( this.renderer.domElement );



        this.scene.background = new THREE.CubeTextureLoader()

            .setPath( `${this.assetsPath}paintedsky/` )

            .load( [

                'px.jpg',

                'nx.jpg',

                'py.jpg',

                'ny.jpg',

                'pz.jpg',

                'nz.jpg'

            ], () => {

                this.renderer.setAnimationLoop(this.render.bind(this));

            } );

        window.addEventListener('resize', this.resize.bind(this) );

        this.load();
        this.missles = [];
        this.plane = new Plane(this);
        this.plane.position.y = 0;

        this.enemyPlanes = [];
        
        
        this.active = false;
        this.enemyCooldownWait = 5;
        this.enemySpawnCooldown = this.enemyCooldownWait;
        this.score = 0;
    } //end constructor

    spawnEnemy() {
        let gltf = this.enemyPlaneGLTF.clone();
        let enemyPlane = new EnemyPlane(this, gltf);
        enemyPlane.plane.position.x = Math.random() * 30 - 15;
        enemyPlane.plane.position.z = Math.random() * 30 - 15;
        this.enemyPlanes.push(enemyPlane);
    }

    load(){

        const loader = new GLTFLoader( ).setPath(this.assetsPath);

        // Load a glTF resource

        loader.load(

            // resource URL

            'microplane.glb',

            // called when the resource is loaded

            gltf => {

                this.enemyPlaneGLTF = gltf.scene.children[0];
               
                for (let i = 0; i < 1; i++) {
                    this.spawnEnemy()
                }

                this.ready = true;
                this.loading = false;

            },

            // called while loading is progressing

            xhr => {

                this.loadingBar.update('enemy-plane', xhr.loaded, xhr.total );

            },

            // called when loading has errors

            err => {

                console.error( err );

            }

        );

        loader.load(
            // resource URL
            'bomb.glb',

            // called when the resource is loaded
            gltf => {
                this.missleGLTF = gltf.scene.children[0];
                this.missleGLTF.rotation.z = 0.5 * Math.PI;
                this.ready = true;
                this.loading = false;
            },

            // called while loading is progressing
            xhr => {
                this.loadingBar.update('missle', xhr.loaded, xhr.total );
            },

            // called when loading has errors
            err => {
                console.error( err );
            }

        );

    } 


    resize(){

        this.camera.aspect = window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    start() {
        this.active = true;
    }

    updateCamera(){

        this.cameraTarget.copy(this.plane.position);
        this.camera.position.y = this.plane.position.y + 30; 

        this.camera.lookAt( this.cameraTarget );

    }

    render() {
 
        this.updateCamera();

        if (this.loading || !this.plane.ready || !this.missleGLTF || !this.enemyPlaneGLTF) {
            return;   
        }
        this.loadingBar.visible = false;

        let deltaTime = this.clock.getElapsedTime() - this.time;
        this.time = this.clock.getElapsedTime();

        if (this.active) {
            
            
            if (deltaTime)
                this.enemySpawnCooldown -= deltaTime;
        
            let dynamicWait = 3 - (this.time / 10);
            if (dynamicWait < 0) {
                dynamicWait = 0;
            }
            this.enemyCooldownWait = dynamicWait + 3

            if (this.enemySpawnCooldown <= 0) {
                this.spawnEnemy();
                this.enemySpawnCooldown = this.enemyCooldownWait;
            }

            for (let i = this.missles.length - 1; i >= 0; i--) {
                this.missles[i].position.x += 0.5 * Math.cos(-this.missles[i].rotation.y + Math.PI);
                this.missles[i].position.z += 0.5 * Math.sin(-this.missles[i].rotation.y + Math.PI);

                let misslePos = this.missles[i].position;
                let radius = 1.5;
                if (this.missles[i].owner != "player") {
                    if (Math.abs(misslePos.x - this.plane.position.x) < radius && Math.abs(misslePos.z - this.plane.position.z) < radius) {
                        // hit i guess
                        this.plane.lives -= 1;
                        document.getElementById("lives").innerHTML = this.plane.lives;
                        this.missles[i].dead = true;
                        
                        continue;
                    }
                }

                if (this.missles[i].owner == "player") {
                for (let j = this.enemyPlanes.length - 1; j >= 0; j--) {
                    let ePlane = this.enemyPlanes[j];
                    if (Math.abs(misslePos.x - ePlane.position.x) < radius && Math.abs(misslePos.z - ePlane.position.z) < radius) {
                        // hit i guess
                        ePlane.lives -= 1;
                        if (ePlane.lives < 1) {
                            this.score += 1;
                            document.getElementById("score").innerHTML = this.score;    

                            this.missles[i].dead = true;
                            break;
                        }
                        
                    }
                }
                }
                
            }

            for (let i = this.missles.length - 1; i >= 0; i--) {
                if (this.missles[i].dead) {
                    this.scene.remove(this.missles[i]);
                    this.missles.splice(i, 1);
                }
            }
            for (let i = this.enemyPlanes.length - 1; i >= 0; i--) {
                if (this.enemyPlanes[i].lives < 1) {
                    this.scene.remove(this.enemyPlanes[i].plane);
                    this.enemyPlanes.splice(i, 1);
                }
            }
        }

        this.plane.update(this.time, this.pressedKeys, this.active, this.missleGLTF, deltaTime);
        for (let i = 0; i < this.enemyPlanes.length; i++) {
            this.enemyPlanes[i].update(this.time, this.plane, this.active, this.missleGLTF, deltaTime);
        }

        if (this.plane.lives < 1) {
            document.getElementById("gameover").style.display = "block";
        }

        this.renderer.render( this.scene, this.camera );

    }

} //end class

export { Game };
