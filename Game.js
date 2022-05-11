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

        this.plane = new Plane(this);
        this.plane.position.y = 0;

        this.enemyPlanes = [];
        

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
        
        this.active = false;
    } //end constructor

    load(){

        const loader = new GLTFLoader( ).setPath(this.assetsPath);

        // Load a glTF resource

        loader.load(

            // resource URL

            'microplane.glb',

            // called when the resource is loaded

            gltf => {

                this.enemyPlaneGLTF = gltf.scene.children[0];
               
                for (let i = 0; i < 5; i++) {
                    let gltf = this.enemyPlaneGLTF.clone();
                    let enemyPlane = new EnemyPlane(this, gltf);
                    enemyPlane.position.x = i * 5;
                    this.enemyPlanes.push(enemyPlane);
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

            'microplane.glb',

            // called when the resource is loaded

            gltf => {

                this.enemyPlaneGLTF = gltf.scene.children[0];
               
                for (let i = 0; i < 5; i++) {
                    let gltf = this.enemyPlaneGLTF.clone();
                    let enemyPlane = new EnemyPlane(this, gltf);
                    enemyPlane.position.x = i * 5;
                    this.enemyPlanes.push(enemyPlane);
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
        this.camera.position.y = this.plane.position.y + 18; 

        this.camera.lookAt( this.cameraTarget );

    }

    render() {

        this.updateCamera();

        if (this.loading || !this.plane.ready) {
            return;   
        }
        this.loadingBar.visible = false;

        const time = this.clock.getElapsedTime();

        this.plane.update(time, this.pressedKeys, this.active);
        for (let i = 0; i < this.enemyPlanes.length; i++) {
            this.enemyPlanes[i].update(time, this.plane, this.active);
        }

        this.renderer.render( this.scene, this.camera );

    }

} //end class

export { Game };
