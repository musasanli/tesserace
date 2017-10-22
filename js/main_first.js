    var emailField = document.getElementById( 'email' );
    var emailAddress = 'jonathan.olson' + ( true ? '' : 'junk' ) + '@' + 'colorado.edu';
    emailField.href = 'mailto:' + emailAddress;
    emailField.innerHTML = emailAddress;

    function updateCanvasSize( size ) {
      if ( typeof size === 'string' ) {
        size = Number.parseInt( size );
      }
      document.getElementById( 'canvas' ).width = size;
      document.getElementById( 'canvas' ).height = size;
      document.getElementById( 'statusContainer' ).style.width = size + 'px';
      document.getElementById( 'statusContainer' ).style.height = size + 'px';
      document.getElementById( 'statusContainer' ).style.lineHeight = size + 'px';
      document.getElementById( 'container' ).style.width = ( size + 620 ) + 'px';
    }

    var sizeResults = /size=([^&#]+)/.exec( location.search );
    if ( sizeResults ) {
      updateCanvasSize( sizeResults[1] );
    }