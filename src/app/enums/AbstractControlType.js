/**
 * @enum {AbstractControlType}
 */
const AbstractControlType = {
    /**
     * Option: VALID
     * @public @var VALID
     */
    FORMGORUP: 'FORMGROUP',

    /**
     * Option: INVALID
     * @public @var INVALID
     */
    FORMCONTROL: 'FORMCONTROL',

    /**
     * Contains the name of the enum
     * @public @function getName
     */
    getName: function(){
        return 'AbstractControlType';
    },

    /**
     * Contains all Values of the enum
     * @public @var {AbstractControlState[]} VALUES
     */
    VALUES: ['FORMGROUP', 'FORMCONTROL']
};
