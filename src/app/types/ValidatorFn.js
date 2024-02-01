/**
 * Returns an Instance of a Validator-Function for Abstract Controls
 * 
 * @class ValidatorFn
 * @param {function} fn 
 * @author {Maximilian Marzeck}
 */
const ValidatorFn = function(fn){
    const validatorFn = {
        _constructName: 'ValidatorFn',

        /**
         * @private @var {function} fn
         */
        _fn: function(){ return null },

        /**
         * @public @function execute
         * @return {string | null}
         */
        execute: function(){
            return this._fn();
        }
    };

    if(typeof fn === TYPE_FUNCTION){
        validatorFn ._fn = fn;
    }else if(fn?._construct === ValidatorFn){
        return fn;
    }else{
        throw new Error(ERROR_VALIDATOR_CONTAIN_FN);
    }

    return validatorFn;
};