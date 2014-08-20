/*
 * Game-j-s
 * https://github.com/Anmo/Game-j-s
 *
 * Copyright (c) 2014 Anmo
 * Licensed under the MIT license.
 */

(function( ) {
    'use strict';

    var lastTime = 0;
    var currTime;

    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.msRequestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.oRequestAnimationFrame ||
                                function( callback ) {
                                    var timeToCall = Math.max( 0 , 16 - ( ( currTime = new Date( ).getTime( ) ) - lastTime ) );

                                    var id = setTimeout( function( ) { callback( currTime + timeToCall ); } , timeToCall );

                                    lastTime = currTime + timeToCall;

                                    return id;
                                };

    var cancelAnimationFrame =  window.cancelAnimationFrame ||
                                window.msCancelAnimationFrame ||
                                window.msCancelRequestAnimationFrame ||
                                window.mozCancelAnimationFrame ||
                                window.mozCancelRequestAnimationFrame ||
                                window.webkitCancelAnimationFrame ||
                                window.webkitCancelRequestAnimationFrame ||
                                window.oCancelAnimationFrame ||
                                window.oCancelRequestAnimationFrame ||
                                function( id ) {
                                    clearTimeout( id );
                                };

    var GameJs = function( ) {
        return this.init( );
    };
    GameJs.prototype = {
        init : function( ) {
            this._objects  = [ ];
            this._triggers = { };

            var self = this;

            if ( 'ontouchstart' in window ) {
                this._start = 'touchstart';
                this._end   = 'touchend';
            } else {
                this._start = 'mousedown';
                this._end   = 'mouseup';
            }

            window.addEventListener( 'keydown' , function( e ) {
                var triggers = self._triggers[ e.keyCode ] || [ ];

                for ( var i = 0, l = triggers.length; i < l; i++ ) {
                    var trigger = triggers[ i ];

                    var obj  = trigger[ 0 ];
                    var act  = trigger[ 1 ];
                    var ms   = act.ms;

                    if ( !( act = obj._actions[ act.start ] ).status ) { self._raf( obj , act , ms ); }
                }
            });

            window.addEventListener( 'keyup' , function( e ) {
                var triggers = self._triggers[ e.keyCode ] || [ ];

                for ( var i = 0, l = triggers.length; i < l; i++ ) {
                    var trigger = triggers[ i ];

                    var obj  = trigger[ 0 ];
                    var act  = trigger[ 1 ];
                    var ms   = act.ms;

                    var start = obj._actions[ act.start ];

                    cancelAnimationFrame( start.status );
                    delete start.status;

                    if ( !( act = obj._actions[ act.end ] ).status ) { self._raf( obj , act , ms ); }
                }
            });

            return this;
        } ,

        _raf : function( obj , act , ms ) {
            var self = this;
            var control;

            var raf = function( ts ) {
                if ( !control ) { control = ts; }

                var next = true;
                var delta = ts - control;

                if ( delta >= ms ) {
                    control = 0;

                    next = act.cb.call( obj , self );
                }

                if ( next ) { act.status = requestAnimationFrame( raf ); }
                else { delete act.status; }
            };

            act.status = requestAnimationFrame( raf );
        } ,

        trigger : function( obj , act ) {
            var self = this;

            var elem  = act.trigger;
            var start = obj._actions[ act.start ];
            var end   = obj._actions[ act.end ];
            var ms    = act.ms;

            if ( elem ) {
                elem.addEventListener( this._start , function( e ) {
                    if ( !start.status ) { self._raf( obj , start , ms ); }

                    e.preventDefault( );
                });

                elem.addEventListener( this._end , function( e ) {
                    cancelAnimationFrame( start.status );
                    delete start.status;

                    if ( !end.status ) { self._raf( obj , end , ms ); }

                    e.preventDefault( );
                });
            } else {
                //this._raf( obj , start , ms );//this is really needed?
            }
        } ,

        createObject : function( ) { return this._Object.apply( this , [ this ].concat( arguments ) ); }
    };

    var _Object = GameJs.prototype._Object = function( game ) {
        if ( !( this instanceof _Object ) ) { return new this._Object( game ); }

        ( this._game = game )._objects.push( this );

        return this.init( );
    };
    _Object.prototype = {
        init : function( ) {
            this._actions = { };

            return this;
        } ,

        action : function( name , cb ) {
            this._actions[ name ] = { cb : cb };

            return this;
        } ,

        trigger : function( obj ) {
            if ( 'start' in obj && !( obj.start in this._actions ) || 'end' in obj && !( obj.end in this._actions ) ) { return this; }

            if ( typeof obj.trigger !== 'number' || !( 'trigger' in obj ) ) {
                this._game.trigger( this , obj );

                return this;
            }

            ( this._game._triggers[ obj.trigger ] = this._game._triggers[ obj.trigger ] || [ ] ).push( [ this , obj ] );

            return this;
        }
    };

    if ( typeof module === 'object' && module.exports ) {
        module.exports = GameJs;
    } else if ( typeof define === 'function' && define.amd ) {
        define( 'GameJs' , GameJs );
    } else if ( typeof window !== 'undefined' ) {
        window.GameJs = GameJs;
    } else {
        return GameJs;
    }
})( );