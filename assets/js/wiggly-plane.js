AFRAME.registerComponent('wiggly-plane', {
    schema: {
        width: {type: 'number', default: 1000},
        length: {type: 'number', default: 1000},
        polycount: {type: 'number', default: 100}
    },

    init: function () {
        var data = this.data;
        var el = this.el;

        this.geometry = new THREE.PlaneGeometry(data.width, data.length, data.polycount, data.polycount);
        this.material = new THREE.MeshStandardMaterial({color: 0x00ff00});
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.rotation.set(-Math.PI / 2, 0, 0);

        el.setObject3D('mesh', this.mesh);
    }
    ,

    tick: function(time, timeDelta){

        var geometry = this.el.getObject3D('mesh').geometry;
        
        geometry.verticesNeedUpdate = true;
        geometry.colorsNeedUpdate = true;

        var planeLength = geometry.vertices.length;

        for (var i = 0; i < planeLength; i+= 1) {
            var vert = geometry.vertices[i],
                noiseVal = noise.simplex3(vert.x * 0.002, vert.y * 0.002, time * 0.00005);
            vert.z = noiseVal * 80;
        }
    }
});

