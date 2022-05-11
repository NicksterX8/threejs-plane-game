import { Vector3 } from './lib/three.module.js';

class EnemyPlane {

    constructor(game, plane){

        this.plane = plane;
        this.plane.material.color.setHex("0x884444");

        this.assetsPath = game.assetsPath;

        this.loadingBar = game.loadingBar;

        this.scene = game.scene;

        this.scene.add(plane);

        this.velocity = new Vector3(0,0,0);
        this.propeller = this.plane.getObjectByName("propeller");

        this.tmpPos = new Vector3();

        this.lives = 1;

    } //end constructor



    get position(){

        if (this.plane !== undefined) this.plane.getWorldPosition(this.tmpPos);

        return this.tmpPos;

    }

    set visible(mode){

        this.plane.visible = mode;

    }

    update(time, player, active){

        if (this.propeller !== undefined) this.propeller.rotateZ(1); 
        this.plane.rotation.z = Math.sin(time*3)*0.2;

        if (active){

        let planeVelocity = {forward: 0.065, sideways: 0, up: 0}; 

        let playerDelta = {
            x: player.position.x - this.plane.position.x,
            z: player.position.z - this.plane.position.z
        };

        let playerAngle = Math.atan2(playerDelta.x, playerDelta.z);

        let angleDiff = playerAngle - this.plane.rotation.y;
        if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
        }
        if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
        } 

        if (angleDiff > 0) {
            planeVelocity.sideways += 0.025;
        } else {
            planeVelocity.sideways -= 0.025;
        }

        this.plane.rotation.y = (this.plane.rotation.y + planeVelocity.sideways) % (Math.PI * 2);
    
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
        }

        this.plane.position.y = 0;
    }

} //end class

export { EnemyPlane };
