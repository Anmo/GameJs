(function( ) {
    "use strict";

    describe( "Testing GameJs" , function( ) {
        var game = new GameJs( );
        var obj;

        it( "no args" , function( ) {
            expect( game instanceof GameJs ).toBe(true);
        });

        it( "create a object" , function( ) {
            expect( ( obj = game.createObject( ) ) instanceof GameJs.prototype._Object ).toBe(true);

            expect( game._objects.length ).toBe( 1 );
        });

        it( "create an action" , function( ) {
            obj.action( 'test' , function( ) { });

            expect( typeof obj._actions[ 'test' ].cb ).toBe( 'function' );
        });

        it( "create a trigger" , function( ) {
            obj.trigger({ trigger : 16 });

            expect( game._triggers[ 16 ].length ).toBe( 1 );
        });
    });
})( );
