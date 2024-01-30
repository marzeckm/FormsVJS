/**
 * @interface ValidatorFn
 * @param {function} fn 
 * @author {Maximilian Marzeck}
 */
const ValidatorFn = function(fn){
    const validatorFn = {
        _constructName: 'ValidatorFn',

        /**
         * @private @var {function} fn
         */
        _fn,

        /**
         * @public @function execute
         * @return {string | null}
         */
        execute: function(){
            return this._fn();
        }
    };

    if(typeof fn === 'function'){
        validatorFn ._fn = fn;
    }else if(fn?._construct === ValidatorFn){
        return fn;
    }else{
        throw new Error('Validators have to contain a function that returns either null (no Error) or an Object (Error)!');
    }
};