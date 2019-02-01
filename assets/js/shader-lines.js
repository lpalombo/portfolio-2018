/* global AFRAME, THREE */

// shader-lines.js

AFRAME.registerShader('lines', {
    schema: {
      color: {type: 'color', is: 'uniform'}
    },
  
    vertexShader: `
    varying vec2 vUv;
    void main()
    {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
  `,
    fragmentShader: `
    //  Function from Iñigo Quiles
    //  https://www.shadertoy.com/view/MsS3Wc
    vec3 hsb2rgb( in vec3 c ){
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                6.0)-3.0)-1.0,
                        0.0,
                        1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix( vec3(1.0), rgb, c.y);
    }

    uniform vec2 resolution;
    uniform float u_time;
    varying vec2 vUv;

    void main()
    {
        vec2 position = vUv;

        vec2 st = gl_FragCoord.xy/resolution;

        float steppy = floor(sin(position.x*100.0)+1.99)+ceil(sin(position.x*100.0));
        
        float y = step(steppy,position.x);

        vec3 color = hsb2rgb(vec3(position.x,y,y));

        if(color.r < 0.1 && color.g < 0.1 && color.b < 0.1){
            discard;
        }

        gl_FragColor = vec4(color,1.0);
        //gl_FragColor = vec4(0.5);
    }
  `
  });