var vizpeopleEnvironments = {
      '01': { brightness: 3, sunCutoff: 11 },
      '02': { brightness: 5, sunCutoff: 5 },
      '03': { brightness: 2, sunCutoff: 75 },
      '04': { brightness: 3, sunCutoff: 13 },
      '05': { brightness: 3, sunCutoff: 9 },
      '06': { brightness: 20, sunCutoff: 0.2 },
      '07': { brightness: 10, sunCutoff: 1.5 },
      '08': { brightness: 3, sunCutoff: 11 },
      '09': { brightness: 3, sunCutoff: 11 },
      '10': { brightness: 3, sunCutoff: 11 }
    };

    function setStatus( message ) {
      var statusSpan = document.getElementById( 'status' );
      statusSpan.innerHTML = message;
      statusSpan.parentNode.style.display = message ? 'block' : 'none';
    }

    function initialize() {
      var gl = tess.gl;

      function loadWrapTex( htmlId ) {
        var img = document.getElementById( htmlId );

        var texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
        gl.bindTexture( gl.TEXTURE_2D, null );
        document.body.removeChild( img );

        return texture;
      }

      var wallHeight = 60;
      var wallInner = 350;
      var wallOuter = 370;

      var oak1DiffuseTexture = loadWrapTex( 'oak1-diffuse-2048' );
      var oak1DirtTexture = loadWrapTex( 'oak1-dirt-2048' );
      var oak1NormalTexture = loadWrapTex( 'oak1-dot3-4096' );

      var oakFloorMaterial = new tess.OakFloor( oak1DiffuseTexture, oak1DirtTexture, oak1NormalTexture, wallInner );
      var diffuseFloorMaterial = new tess.Diffuse();

      var floor = new tess.Plane( dot( 0, 1, 0 ), 0, false, oakFloorMaterial );
      floor.preventShadows = true;

      var sceneObs;
      var coffeeSceneObs;
      var testSceneObs;
      var colorSceneObs;
      var indoorSceneObs;

      var lightSphere = new tess.Sphere( dot( 0, -100, 10 ), 7, true, new tess.Emit( new tess.Absorb(), dot( 25, 25, 25 ), false ) );

      function setupCoffeeScene() {
        var ceiling = new tess.Box3( dot( -wallOuter, wallHeight, -wallOuter ), dot( wallOuter, wallHeight + 2, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 1, 1, 1 ), false ) );

        // TODO: add actual window/windows? (dielectric)
        var wall1 = new tess.Box3( dot( -wallOuter, 0, wallInner ), dot( wallOuter, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( wallOuter, wallHeight, -wallInner ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2x = new tess.Box3( dot( -2, wallHeight - 15, -wallOuter ), dot( 2, wallHeight, -wallInner ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall3 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( -wallInner, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall4 = new tess.Box3( dot( wallInner, 0, -wallOuter ), dot( wallOuter, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );

        var coffeeTableHeight = 43;
        var coffeeTableGap = 0.001;
        var coffeeTableThickness = 0.5;
        var coffeeTableX = 0;
        var coffeeTableZ = 0;
        var coffeeTableHalfX = 25;
        var coffeeTableHalfZ = 45;
        var coffeeLeg = 5;
        var coffeeFront = coffeeTableZ + coffeeTableHalfZ;
        var coffeeBack = coffeeTableZ - coffeeTableHalfZ;
        var coffeeRight = coffeeTableX + coffeeTableHalfX;
        var coffeeLeft = coffeeTableX - coffeeTableHalfX;
        var glassTop = new tess.Box3( dot( coffeeLeft, coffeeTableHeight - coffeeTableThickness, coffeeBack ),
                                      dot( coffeeRight, coffeeTableHeight, coffeeFront ),
                                      false, new tess.SmoothDielectric( 1.6 ), true );
        var leg1 = new tess.Box3( dot( coffeeLeft, 0, coffeeBack ),
                                  dot( coffeeLeft + coffeeLeg, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeBack + coffeeLeg ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg2 = new tess.Box3( dot( coffeeRight - coffeeLeg, 0, coffeeBack ),
                                  dot( coffeeRight, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeBack + coffeeLeg ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg3 = new tess.Box3( dot( coffeeLeft, 0, coffeeFront - coffeeLeg ),
                                  dot( coffeeLeft + coffeeLeg, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeFront ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg4 = new tess.Box3( dot( coffeeRight - coffeeLeg, 0, coffeeFront - coffeeLeg ),
                                  dot( coffeeRight, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeFront ), false, new tess.ShinyBlack( 1.5167 )  );

        var glassSphere = new tess.Sphere( dot( 0, coffeeTableHeight + 8, 25 ), 8, false, new tess.SmoothDielectric( 1.5 ), true );
        var blackSphere = new tess.Sphere( dot( 0, coffeeTableHeight + 8, 0 ), 8, false, new tess.ShinyBlack( 1.5167 ) );
        var greenSphere = new tess.Sphere( dot( 0, coffeeTableHeight + 8, -25 ), 8, false, new tess.FresnelCompositeMaterial( new tess.Reflect(), new tess.Attenuate( new tess.Diffuse(), dot( 0.1, 1, 0.1 ), false ), tess.airIOR, 1.33 ) );
        var soccer = new tess.Sphere( dot( -20, 11, -10 ), 11, false, new tess.SoccerMaterial() );

        coffeeSceneObs = [
          floor,
          wall1,
          wall2,
          wall3,
          wall4,
          glassTop,
          leg1,
          leg2,
          leg3,
          leg4,
          lightSphere,
          glassSphere,
          blackSphere,
          greenSphere,
          soccer
        ];
      }
      function useCoffeeScene() {
        floor.material = oakFloorMaterial;
        sceneObs = coffeeSceneObs;
        updateSampleProgram();
      }

      function setupTestScene() {
        var ceiling = new tess.Box3( dot( -wallOuter, wallHeight, -wallOuter ), dot( wallOuter, wallHeight + 2, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 1, 1, 1 ), false ) );

        // TODO: add actual window/windows? (dielectric)
        var wall1 = new tess.Box3( dot( -wallOuter, 0, wallInner ), dot( wallOuter, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( wallOuter, wallHeight, -wallInner ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2x = new tess.Box3( dot( -2, wallHeight - 15, -wallOuter ), dot( 2, wallHeight, -wallInner ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall3 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( -wallInner, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall4 = new tess.Box3( dot( wallInner, 0, -wallOuter ), dot( wallOuter, wallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );

        var coffeeTableHeight = 43;
        var coffeeTableGap = 0.001;
        var coffeeTableThickness = 0.5;
        var coffeeTableX = 0;
        var coffeeTableZ = 0;
        var coffeeTableHalfX = 25;
        var coffeeTableHalfZ = 45;
        var coffeeLeg = 5;
        var coffeeFront = coffeeTableZ + coffeeTableHalfZ;
        var coffeeBack = coffeeTableZ - coffeeTableHalfZ;
        var coffeeRight = coffeeTableX + coffeeTableHalfX;
        var coffeeLeft = coffeeTableX - coffeeTableHalfX;
        var glassTop = new tess.Box3( dot( coffeeLeft, coffeeTableHeight - coffeeTableThickness, coffeeBack ),
                                      dot( coffeeRight, coffeeTableHeight, coffeeFront ),
                                      false, new tess.SmoothDielectric( 1.6 ), true );
        // var leg1 = new tess.Box3( dot( -4, 0, -4 ), dot( -3.5, 2.99, -3.5 ), false, new tess.Metal( dot( 1.26232, 7.1855 ) ) ); // like aluminum
        var leg1 = new tess.Box3( dot( coffeeLeft, 0, coffeeBack ),
                                  dot( coffeeLeft + coffeeLeg, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeBack + coffeeLeg ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg2 = new tess.Box3( dot( coffeeRight - coffeeLeg, 0, coffeeBack ),
                                  dot( coffeeRight, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeBack + coffeeLeg ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg3 = new tess.Box3( dot( coffeeLeft, 0, coffeeFront - coffeeLeg ),
                                  dot( coffeeLeft + coffeeLeg, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeFront ), false, new tess.ShinyBlack( 1.5167 )  );
        var leg4 = new tess.Box3( dot( coffeeRight - coffeeLeg, 0, coffeeFront - coffeeLeg ),
                                  dot( coffeeRight, coffeeTableHeight - coffeeTableGap - coffeeTableThickness, coffeeFront ), false, new tess.ShinyBlack( 1.5167 )  );

        var testOb = new tess.TestObject( new tess.SmoothDielectric( 1.5 ) );


        testSceneObs = [
          floor,
          wall1,
          wall2,
          wall3,
          wall4,
          glassTop,
          lightSphere,
          leg1,
          leg2,
          leg3,
          leg4,
          testOb
        ];
      }
      function useTestScene() {
        floor.material = oakFloorMaterial;
        sceneObs = testSceneObs;
        updateSampleProgram();
      }

      function setupColorScene() {
        function diffuseBox( center, color ) {
          return new tess.Box3( center.plus( dot( -10, -10, -10 ) ), center.plus( dot( 10, 10, 10 ) ), false, new tess.Attenuate( new tess.Diffuse(), color, false ) );
        }
        function glassBox( center ) {
          return new tess.Box3( center.plus( dot( -10, -10, -10 ) ), center.plus( dot( 10, 10, 10 ) ), false, new tess.SmoothDielectric( 1.5 ), true );
        }

        colorSceneObs = [
          floor,
          diffuseBox( dot( 0, 35, 0 ), dot( 0.1, 0.1, 0.1 ) ),
          diffuseBox( dot( 0, 35, 25 ), dot( 1, 0.1, 0.1 ) ),
          diffuseBox( dot( 25, 35, 0 ), dot( 0.1, 0.1, 1 ) ),
          diffuseBox( dot( 25, 35, 25 ), dot( 1, 0.1, 1 ) ),
          diffuseBox( dot( 0, 10, 0 ), dot( 0.1, 1, 0.1 ) ),
          diffuseBox( dot( 0, 10, 25 ), dot( 1, 1, 0.1 ) ),
          diffuseBox( dot( 25, 10, 0 ), dot( 0.1, 1, 1 ) ),
          diffuseBox( dot( 25, 10, 25 ), dot( 1, 1, 1 ) ),
          new tess.Sphere( dot( -25, 12, -25 ), 12, false, new tess.SmoothDielectric( 1.5 ), true ),
          glassBox( dot( -50, 10, -50 ) ),
          diffuseBox( dot( -50, 10, -75 ), dot( 1, 0.1, 0.1 ) ),
          lightSphere
        ];
      }
      function useColorScene() {
        floor.material = diffuseFloorMaterial;
        sceneObs = colorSceneObs;
        updateSampleProgram();
      }

      function setupIndoorScene() {
        var indoorWallHeight = 150;

        var ceiling = new tess.Box3( dot( -wallOuter, indoorWallHeight, -wallOuter ), dot( wallOuter, indoorWallHeight + 2, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 1, 1, 1 ), false ) );

        // TODO: add actual window/windows? (dielectric)
        var wall1 = new tess.Box3( dot( -wallOuter, 0, wallInner ), dot( wallOuter, indoorWallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( wallOuter, wallHeight * 2 / 3, -wallInner ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall2x = new tess.Box3( dot( -2, wallHeight, -wallOuter + 5 ), dot( 2, indoorWallHeight, -wallInner - 5 ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall3 = new tess.Box3( dot( -wallOuter, 0, -wallOuter ), dot( -wallInner, indoorWallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );
        var wall4 = new tess.Box3( dot( wallInner, 0, -wallOuter ), dot( wallOuter, indoorWallHeight, wallOuter ), false, new tess.Attenuate( new tess.Diffuse(), dot( 0.9, 0.9, 0.9 ), false ) );

        var glassWindow = new tess.Box3( dot( -wallInner, wallHeight, -wallOuter + 8 ), dot( wallInner, indoorWallHeight, -wallInner - 8 ), false, new tess.SmoothDielectric( 1.5 ), true );

        var glassSphere = new tess.Sphere( dot( 90, 25, 0 ), 25, false, new tess.SmoothDielectric( 1.5 ), true );
        var blackSphere = new tess.Sphere( dot( 30, 25, 0 ), 25, false, new tess.ShinyBlack( 1.5167 ) );
        var metalSphere = new tess.Sphere( dot( -30, 25, 0 ), 25, false, new tess.Metal( dot( 2.1928, 3.9379 ) ) ); // like platinum
        var greenSphere = new tess.Sphere( dot( -90, 25, 0 ), 25, false, new tess.FresnelCompositeMaterial( new tess.Reflect(), new tess.Attenuate( new tess.Diffuse(), dot( 0.1, 1, 0.1 ), false ), tess.airIOR, 1.33 ) );


        indoorSceneObs = [
          floor,
          ceiling,
          wall1,
          wall2,
          wall3,
          wall4,
          lightSphere,
          glassSphere,
          blackSphere,
          metalSphere,
          greenSphere
        ];
      }
      function useIndoorScene() {
        floor.material = oakFloorMaterial;
        sceneObs = indoorSceneObs;
        updateSampleProgram();
      }

      setupCoffeeScene();
      setupTestScene();
      setupColorScene();
      setupIndoorScene();
      sceneObs = coffeeSceneObs;

      var environmentRotation = document.getElementById( 'environmentRotationSlider' ).value / 360;
      var environmentSunStrength = 0;

      var compiledOk = false;
      var needsCompilation = true;
      var needsTexture = false;

      var environment = new tess.TextureEnvironment( envTexture, 'rectilinear', vizpeopleEnvironments['04'].brightness, vizpeopleEnvironments['04'].sunCutoff, environmentRotation, environmentSunStrength, true );
      var projection = new tess.PerspectiveDepthRays( 150, 0 );

      var samplingProgram;
      var integrator = null;

      var camera = new tess.Camera3(
        dot( -138.4543984451003, 89.1664219061534, 93.61742672324178 ),
        new dot.Matrix3(
          -0.6250572204589844, 0.23142336308956146,  0.7454872727394104,
          0,                   0.9550415873527527,   -0.29647570848464966,
          -0.7805812358856201, -0.18531423807144165, -0.5969557166099548 ),
        function() {
          integrator && integrator.clear();
        }
      );

      function getRayFromCanvasCoordinates( canvasPoint ) {
        var p = canvasPoint.plusScalar( 0.5 ).dividedScalar( canvas.width ).minusScalar( 0.5 );
        p.y = -p.y;
        var dir = projection.getRayDir( camera.rotationMatrix, p ).normalized();
        return new dot.Ray3( camera.position, dir );
      }

      function initializeIntegrator() {
        console.log( 'new integrator' );
        integrator = new tess.TextureIntegrator( samplingProgram, function( program ) {
          gl.uniformMatrix3fv( program.uniformLocations.rotationMatrix, false, camera.rotationMatrix.entries );
          gl.uniform3f( program.uniformLocations.cameraPosition, camera.position.x, camera.position.y, camera.position.z );
          for ( var i = 0; i < sceneObs.length; i++ ) {
            sceneObs[i].update( program );
            sceneObs[i].material.update( program );
          }
          projection.update( program );
          environment.update( program );
        }, canvas.width )
      }

      function updateSampleProgram() {
        setStatus( 'Compiling shader...' );

        needsCompilation = true;

        setTimeout( function() {
          needsCompilation = false;

          if ( samplingProgram ) {
            samplingProgram.dispose();
          }

          compiledOk = false;
          try {
            samplingProgram = tess.create2SceneProgram( sceneObs, projection, environment, ( sceneObs === testSceneObs || sceneObs === colorSceneObs ) ? 9 : 5 );
            compiledOk = true; // no exception
          } catch ( e ) {
            var str = e.toString();
            var idx = str.indexOf( 'attribute vec3 vertex' );
            if ( idx >= 0 ) {
              str = str.slice( 0, idx ) + '&lt;fragment source&gt;';
            }
            setStatus( str );
          }

          if ( !integrator ) {
            initializeIntegrator();
          }

          integrator.sampleProgram = samplingProgram;
          integrator.clear();

          window.console && console.log && samplingProgram && samplingProgram.fragmentSource && console.log( samplingProgram.fragmentSource );
        }, 50 );
      }

      var mouseRotateBox = document.getElementById( 'mouseRotateBox' );
      var mouseFocusBox = document.getElementById( 'mouseFocusBox' );
      var mouseLightBox = document.getElementById( 'mouseLightBox' );
      var mouseMakeDynamicBox = document.getElementById( 'mouseMakeDynamicBox' );

      function rayCast( ray, excludeObs ) {
        var bestDist = Number.POSITIVE_INFINITY;
        var bestOb = null;
        for ( var i = 0; i < sceneObs.length; i++ ) {
          if ( _.indexOf( excludeObs, sceneObs[i] ) === -1 ) {
            var t = sceneObs[i].hitTest( ray );
            if ( t < bestDist ) {
              bestDist = t;
              bestOb = sceneObs[i];
            }
          }
        }
        return {
          ob: bestOb,
          t: bestDist
        };
      }

      var draggedOb = null;
      var draggedOffset = null;
      var draggedRayOffset = null;

      function canvasPointFromEvent( evt ) {
        var canvasRect = canvas.getBoundingClientRect()
        return dot( evt.clientX - canvasRect.left, evt.clientY - canvasRect.top );
      }

      function rayFromEvent( evt ) {
        return getRayFromCanvasCoordinates( canvasPointFromEvent( evt ) );
      }

      function getCenterRay() {
        return new dot.Ray3( camera.position, projection.getRayDir( camera.rotationMatrix, dot( 0, 0 ) ).normalized() );
      }

      function sceneAction( evt ) {
        var ray = rayFromEvent( evt );

        var t;

        if ( mouseFocusBox.checked ) {
          t = rayCast( ray, [lightSphere] ).t;

          if ( !isFinite( t ) ) {
            t = 200000;
          }

          projection.focalLength = t;
          focalLengthSlider.value = t;
          integrator.clear();
        } else if ( mouseLightBox.checked ) {
          t = rayCast( ray, [lightSphere] ).t;

          if ( isFinite( t ) ) {
            lightSphere.center = ray.pointAtDistance( t );
            integrator.clear();
          }
        } else if ( mouseMakeDynamicBox.checked && !draggedOb && !mouseIsDown ) {
          var hit = rayCast( ray, [lightSphere] );
          if ( hit.ob instanceof tess.Sphere ) {
            // hit.ob.center = ray.pointAtDistance( floor.hitTest( ray ) ).plus( dot( 0, hit.ob.radius, 0 ) );
            if ( !hit.ob.isDynamic ) {
              hit.ob.isDynamic = true;
              hit.ob.refresh();
              updateSampleProgram();
            }
            integrator.clear();
            draggedOb = hit.ob;
            var hitPoint = ray.pointAtDistance( hit.t );
            draggedOffset = hit.ob.center.minus( hitPoint );
            draggedRayOffset = hitPoint.y;
          }
        }
      }
      var mousePos;

      var mouseIsDown = false;
      canvas.addEventListener( 'mousedown', function( evt ) {
        canvas.style.cursor = 'default';
        draggedOb = null;
        sceneAction( evt );
        mouseIsDown = true;
        mousePos = canvasPointFromEvent( evt );
      } );
      canvas.addEventListener( 'mouseup', function( evt ) {
        canvas.style.cursor = 'inherit';
        draggedOb = null;
        mouseIsDown = false;
      } );

      window.addEventListener( 'mousemove', function( evt ) {
        if ( mouseIsDown ) {
          sceneAction( evt );
          var newMousePos = canvasPointFromEvent( evt );
          if ( mouseRotateBox.checked ) {
            var delta = newMousePos.minus( mousePos );
            var dragScale = 0.005;
            var quat = dot.Quaternion.fromEulerAngles(
              delta.y * dragScale, // yaw
              delta.x * dragScale, // roll
              0                    // pitch
            );
            var focalPoint = getCenterRay().pointAtDistance( focalLengthSlider.value );
            camera.rotationMatrix.multiplyMatrix( quat.toRotationMatrix() );
            var newFocalPoint = getCenterRay().pointAtDistance( focalLengthSlider.value );
            camera.position = camera.position.minus( newFocalPoint.minus( focalPoint ) );
            integrator.clear();
          }
          mousePos = newMousePos;
        }
        if ( mouseMakeDynamicBox.checked && draggedOb && draggedOb.isDynamic ) {
          var ray = rayFromEvent( evt );
          var offsetRay = new dot.Ray3( ray.pos.copy(), ray.dir );
          offsetRay.pos.y -= draggedRayOffset;
          draggedOb.center = ray.pointAtDistance( floor.hitTest( offsetRay ) ).plus( draggedOffset );
          integrator.clear();
        }
      } );

      var brightnessSlider = document.getElementById( 'brightnessSlider' );
      brightnessSlider.addEventListener( 'input', function() {
        integrator.brightness = brightnessSlider.value / 100;
      } );

      var dofSpreadSlider = document.getElementById( 'dofSpreadSlider' );
      dofSpreadSlider.addEventListener( 'input', function() {
        projection.dofSpread = dofSpreadSlider.value / 25;
        integrator.clear();
      } );

      var focalLengthSlider = document.getElementById( 'focalLengthSlider' );
      focalLengthSlider.addEventListener( 'input', function() {
        projection.focalLength = focalLengthSlider.value;
        integrator.clear();
      } );

      var linearBox = document.getElementById( 'linearBox' );
      linearBox.addEventListener( 'click', function() {
        integrator.quadProgram = tess.textureQuadGammaProgram;
      } );

      var reinhardBox = document.getElementById( 'reinhardBox' );
      reinhardBox.addEventListener( 'click', function() {
        integrator.quadProgram = tess.textureQuadReinhardProgram;
      } );

      var filmicBox = document.getElementById( 'filmicBox' );
      filmicBox.addEventListener( 'click', function() {
        integrator.quadProgram = tess.textureQuadFilmicProgram;
      } );

      var isStereographic = false;

      var perspectiveBox = document.getElementById( 'perspectiveBox' );
      perspectiveBox.addEventListener( 'click', function() {
        if ( isStereographic ) {
          isStereographic = false;
          projection = new tess.PerspectiveDepthRays( focalLengthSlider.value, 0 );
          projection.dofSpread = dofSpreadSlider.value / 100;
          projection.focalLength = focalLengthSlider.value;
          updateSampleProgram();
        }
      } );

      var stereographicBox = document.getElementById( 'stereographicBox' );
      stereographicBox.addEventListener( 'click', function() {
        if ( !isStereographic ) {
          isStereographic = true;
          projection = new tess.StereographicRays();
          updateSampleProgram();
        }
      } );

      var envConstantBox = document.getElementById( 'envConstantBox' );
      envConstantBox.addEventListener( 'click', function() {
        environment = new tess.ProceduralEnvironment( 'accumulation = accumulation + attenuation * 1.5;\n', [] );
        updateSampleProgram();
      } );

      var customGLSLText = document.getElementById( 'customGLSLText' );
      var envWeirdBox = document.getElementById( 'envWeirdBox' );
      function updateGLSL() {
        var expr = customGLSLText.value;
        environment = new tess.ProceduralEnvironment( 'accumulation = accumulation + attenuation * ( ' + expr + ' );\n', [] );
        updateSampleProgram();
      }
      envWeirdBox.addEventListener( 'click', updateGLSL );
      var updateCustomGLSLButton = document.getElementById( 'updateCustomGLSLButton' );
      updateCustomGLSLButton.addEventListener( 'click', updateGLSL );

      function lazyLoadEnvironmentTexture( url, width, height, type, multiplier, sunCutoff, isHalf ) {
        if ( needsTexture ) {
          return; // bleh, better way to just use the latest?
        }
        gl.deleteTexture( envTexture );

        setStatus( 'Loading Texture...' );
        needsTexture = true;
        tess.asyncLoadHDRTexture( tess.gl, url, width, height, false, tess.gl.RGB, function( texture ) {
          window.envTexture = texture;
          needsTexture = false;
          setStatus();

          environment = new tess.TextureEnvironment( window.envTexture, type, multiplier, sunCutoff, environmentRotation, environmentSunStrength, isHalf );
          updateSampleProgram();
        } );
      }

      // vizpeople skies
      _.each( ['01','02','03','04','05','06','07','08','09','10'], function( id ) {
        document.getElementById( 'envTest' + id ).addEventListener( 'click', function() {
          lazyLoadEnvironmentTexture( '../images/hdrTest' + id + '_2half.hdr', 2048, 512, 'rectilinear', vizpeopleEnvironments[id].brightness, vizpeopleEnvironments[id].sunCutoff, true );
        } );
        document.getElementById( 'envTest' + id + 'x' ).addEventListener( 'click', function() {
          lazyLoadEnvironmentTexture( '../images/hdrTest' + id + '_1half.hdr', 4096, 1024, 'rectilinear', vizpeopleEnvironments[id].brightness, vizpeopleEnvironments[id].sunCutoff, true );
        } );
      } );

      document.getElementById( 'envDusk2048Box' ).addEventListener( 'click', function() {
        lazyLoadEnvironmentTexture( '../images/colorsf2half.hdr', 2048, 512, 'rectilinear', 3, 50, true );
      } );

      var environmentRotationSlider = document.getElementById( 'environmentRotationSlider' );
      environmentRotationSlider.addEventListener( 'input', function() {
        environment.rotation = environmentRotation = environmentRotationSlider.value / 360;
        integrator.clear();
      } );

      var environmentSunStrengthSlider = document.getElementById( 'environmentSunStrengthSlider' );
      environmentSunStrengthSlider.addEventListener( 'input', function() {
        environment.sunStrength = environmentSunStrength = environmentSunStrengthSlider.value / 50;
        integrator.clear();
      } );

      var sceneCoffeeBox = document.getElementById( 'sceneCoffeeBox' );
      sceneCoffeeBox.addEventListener( 'click', function() {
        useCoffeeScene();
      } );

      var sceneTestBox = document.getElementById( 'sceneTestBox' );
      sceneTestBox.addEventListener( 'click', function() {
        useTestScene();
      } );

      var sceneIndoorBox = document.getElementById( 'sceneIndoorBox' );
      sceneIndoorBox.addEventListener( 'click', function() {
        useIndoorScene();
      } );

      var sceneColorBox = document.getElementById( 'sceneColorBox' );
      sceneColorBox.addEventListener( 'click', function() {
        useColorScene();
      } );

      var size256Box = document.getElementById( 'size256Box' );
      size256Box.addEventListener( 'click', function() {
        if ( canvas.width !== 256 ) {
          var idx = window.location.href.indexOf( '?' );
          window.location = window.location.href.slice( 0, idx > 0 ? idx : window.location.href.length ) + '?size=256';
        }
      } );

      var size512Box = document.getElementById( 'size512Box' );
      size512Box.addEventListener( 'click', function() {
        if ( canvas.width !== 512 ) {
          var idx = window.location.href.indexOf( '?' );
          window.location = window.location.href.slice( 0, idx > 0 ? idx : window.location.href.length ) + '?size=512';
        }
      } );

      var size1024Box = document.getElementById( 'size1024Box' );
      size1024Box.addEventListener( 'click', function() {
        if ( canvas.width !== 1024 ) {
          var idx = window.location.href.indexOf( '?' );
          window.location = window.location.href.slice( 0, idx > 0 ? idx : window.location.href.length ) + '?size=1024';
        }
      } );

      updateSampleProgram();

      camera.initializeKeyboardControl();

      var lastTime = Date.now();

      var samplerSteps = 1;
      var actualSamplerSteps = 1;

      (function step() {
        window.requestAnimationFrame( step );

        if ( needsCompilation || needsTexture ) {
          return;
        }

        var currentTime = Date.now();
        var timeElapsed = currentTime - lastTime;
        lastTime = currentTime;

        camera.step( timeElapsed );

        if ( compiledOk ) {
          setStatus();

          if ( timeElapsed > 18 ) {
            var factor = ( 18 / timeElapsed );
            samplerSteps = Math.max( 1, samplerSteps * factor );
          } else {
            samplerSteps += 0.2;
          }
          actualSamplerSteps = 0.8 * actualSamplerSteps + 0.2 * samplerSteps;

          var steps = Math.max( 1, Math.floor( actualSamplerSteps ) );
          for ( var i = 0; i < steps; i++ ) {
            integrator.step();
          }
          integrator.render();
          customGLSLText.style.background = '';
        } else {
          customGLSLText.style.background = 'rgba(255,0,0,0.2)';
        }
      })();
    }
    window.addEventListener( 'load', function() {
      if ( !tess.gl ) {
        setStatus( 'Error: ' + window.failureMessage );
      } else {
        setStatus( 'Loading Texture...' );
        tess.asyncLoadHDRTexture( tess.gl, '../images/hdrTest04_2half.hdr', 2048, 512, false, tess.gl.RGB, function( texture ) {
          window.envTexture = texture;

          initialize();
        } );
      }
    } );