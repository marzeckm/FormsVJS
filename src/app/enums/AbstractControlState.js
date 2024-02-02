/**
 * @enum {AbstractControlState}
 */
const AbstractControlState = {
    /**
     * Option: VALID
     * @public @var VALID
     */
    VALID: 'VALID',

    /**
     * Option: INVALID
     * @public @var INVALID
     */
    INVALID: 'INVALID',

    /**
     * Contains the Name of the enum
     * @public @function getName
     */
    getName: function(){
        return 'AbstractControlState';
    },

    /**
     * Contains all Values of the enum
     * @public @var {AbstractControlState[]} VALUES
     */
    VALUES: ['VALID', 'INVALID']
};
