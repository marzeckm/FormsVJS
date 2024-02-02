/**
 * Simple Observable implementation for AbstractControl 
 * @class {SimpleObservable}
 * @author {Maximilian Marzeck}
 */
const SimpleObservable = function(){
    return  {
        /**
         * Constructor-Name for pre ES6
         * @private @var {string} constructName
         */
        _constructName: 'SimpleObservable',

        /**
         * Value on that should be subscribed
         * @private @var {any} value
         */
        value: undefined,
        
        /**
         * The function that is transmitted via subscribe()
         * @private @var {function} fn
         */
        _fn: undefined,

        /**
         * Calls the subscribe-function with the new value
         * @param {any} value 
         */
        next: function(value){
            this.value = value;
            if(this._fn){
                this._fn(value);
            }
        },

        /**
         * To subscribe on the SimpleObservable
         * @param {function} fn 
         */
        subscribe: function(fn){
            this._fn = fn;
            this.next.bind(this);
            this.next(this.value);
        }
    };
};
