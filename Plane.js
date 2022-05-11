import { Vector3 } from './lib/three.module.js';

import { GLTFLoader } from './lib/GLTFLoader.js';

class Plane{

    constructor(game){

        this.assetsPath = game.assetsPath;

        this.loadingBar = game.loadingBar;

        this.scene = game.scene;

        this.load();

        this.tmpPos = new Vector3();

        this.rotation = new Vector3();

        this.lives = 3;

    } //end constructor



    get position(){

        if (this.plane !== undefined) this.plane.getWorldPosition(this.tmpPos);

        return this.tmpPos;

    }

    set visible(mode){

        this.plane.visible = mode;

    }

    shootMissle() {

    }

    update(time, pressedKeys, gameActive){

        if (this.propeller !== undefined) this.propeller.rotateZ(1); 
        this.plane.rotation.z = Math.sin(time*3)*0.2;

        if (gameActive) {

            let planeVelocity = {forward: 0.00, sideways: 0, up: 0}; 

            if (pressedKeys[87]) {// W
                planeVelocity.forward += 0.2;
            }
            if (pressedKeys[83]) {// S
                planeVelocity.forward -= 0.2;
            }
            if (pressedKeys[65]) {// A
                planeVelocity.sideways += 0.05;
            }
            if (pressedKeys[68]) {// D
                planeVelocity.sideways -= 0.05;
            }
        
            this.plane.rotation.y += planeVelocity.sideways;
        
            let planeDist = Math.sqrt(this.plane.position.x ** 2, this.plane.position.z ** 2);
            let planeDirection = {z: Math.cos(this.plane.rotation.y), x: Math.sin(this.plane.rotation.y)};
        
            this.plane.position.x += planeDirection.x * planeVelocity.forward;
            this.plane.position.z += planeDirection.z * planeVelocity.forward;


            let maxDist = 80;
            if (this.plane.position.x > maxDist) {
                this.plane.position.x = maxDist;
            }
            if (this.plane.position.z > maxDist) {
                this.plane.position.z = maxDist;
            }
            if (this.plane.position.z < -maxDist) {
                this.plane.position.x = -maxDist;
            }
            if (this.plane.position.x < -maxDist) {
                this.plane.position.x = -maxDist;
            }

            //this.plane.position.y -= 0.05;
            if (pressedKeys[32]) { // Space
                this.shootMissle();
            }
            if (pressedKeys[82]) { // R
                //this.plane.position.y -= 0.15;
            }
            this.plane.position.y = 0;
        } else {
            //this.plane.position.y = Math.cos(time) * 1.5 - 2;
        }
    }

    load(){

        const loader = new GLTFLoader( ).setPath(this.assetsPath);

        this.ready = false;



        // Load a glTF resource

        loader.load(

            // resource URL

            'microplane.glb',

            // called when the resource is loaded

            gltf => {

                this.scene.add( gltf.scene );

                this.plane = gltf.scene;

                this.velocity = new Vector3(0,0,0.1);

                this.propeller = this.plane.getObjectByName("propeller");

                this.ready = true;

            },

            // called while loading is progressing

            xhr => {

                this.loadingBar.update('plane', xhr.loaded, xhr.total );

            },

            // called when loading has errors

            err => {

                console.error( err );

            }

        );

    } 

} //end class

export { Plane };
