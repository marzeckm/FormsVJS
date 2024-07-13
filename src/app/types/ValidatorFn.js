/**
 * Returns an Instance of a Validator-Function for {@link AbstractControl}
 * 
 * @class {ValidatorFn}
 * @param {function} fn 
 * @author {Maximilian Marzeck}
 */
const ValidatorFn = function(fn){

    /**
     * Acts as constructor
     */
    if(typeof fn === TYPE_FUNCTION){
        fn;
    }else if(fn._constructName === 'ValidatorFn'){
        return fn;
    }else{
        throw new Error(ERROR_VALIDATOR_CONTAIN_FN);
    }

    /**
     * Returns the ValidatorFn
     */
    return {
        /**
         * @private @var constructName
         */
        _constructName: 'ValidatorFn',

        /**
         * @private @var {function} fn
         */
        _fn: fn,

        /**
         * @public @function execute
         * @return {string | null}
         */
        execute: function(){
            return this._fn();
        }
    };
};
