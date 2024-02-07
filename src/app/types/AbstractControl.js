/**
 * @interface AbstractControl
 * @author {Maximilian Marzeck}
 */
const AbstractControl = function () {
    /**
     * Acts as constructor
     */
    const formsService = inject(FormsService);
    const uid = formsService.generateUID(16);

    const valueChanges = SimpleObservable();
    const statusChanges = SimpleObservable();

    const abstractControl = {
        /**
         * @private @var construct
         */
        _constructName: 'AbstractControl',

        /**
         * @public @var {AbstractControl<T>} parent
         */
        parent: undefined,

        /**
         * Attention! Shold only be read!
         * @public @var {any} value
         */
        value: undefined,

        /**
         * Can be subscribed to, to get valueChanges
         * @public @var {SimpleObservable} valueChanges;
         */
        valueChanges: valueChanges,

        /**
         * @public @var {boolean} valid;
         */
        valid: true,

        /**
         * @public @var {boolean} invalid;
         */
        invalid: false,

        /**
        * Attention! Shold only be read!
        * 
        * @public @var {AbstractControlState} state
        */
        state: AbstractControlState.VALID,

        /**
         * Can be subscribed to, to get status changes
         * 
         * @public @var {SimpleObservable} statusChanges;
         */
        statusChanges: statusChanges,

        /**
         * Attention! Shold only be read!
         * 
         * @readonly @public @var {boolean} touched;
         */
        touched: false,

        /**
         * Attention! Shold only be read!
         * 
         * @readonly @public @var {ValidationErrors[] | null}
         */
        errors: [],

        /**
         * @private @var {string} _uid
         */
        _uid: uid,

        /**
         * @private @var {ValidatorFn[]} validators
         */
        _validators: [],

        /**
         * @public @function setValue
         * @param {any} value 
         * @return {void}
         */
        setValue: function (value) {
            this.value = value;
            this.markAsTouched();
            this.valueChanges.next(value);

            if (this.parent) {
                this.parent._refreshValue();
            }
        },


        /**
         * @public @function setState
         * @param {string | AbstractControlState} state 
         * @return {void}
         */
        setState: function (state) {
            this.touched = true;
            if (AbstractControlState.VALUES.indexOf(state) > -1) {
                this.state = state;
                this.statusChanges.next(state);
                this.valid = (state === AbstractControlState.VALID);
                this.invalid = (state === AbstractControlState.INVALID);
            } else {
                throw Error(ERROR_CONTROL_STATE);
            }

            if (this.parent) {
                this.parent._setFormGroupStatus(state);
            }
        },

        /**
         * @param {ValidatorFn | ValidatorFn[] | function | function[]} validatorsFn 
         * @return {void}
         */
        setValidators: function(validatorsFn) {
            if (validatorsFn.length) {
                this._validators = validatorsFn.map(function(validatorFn){ValidatorFn(validatorFn)});
            }else{
                validatorsFn = [validatorsFn];
            }
            this._validators = validatorsFn;
        },

        /**
         * @param {ValidatorFn | ValidatorFn[] | function | function[]} validatorsFn 
         * @return {void}
         */
        addValidators: function(validatorsFn) {
            if (validatorsFn.length) {
                validatorsFn.forEach(function(validatorFn){this._validators.push(ValidatorFn(validatorFn))});
            }else{
                validatorsFn = [validatorsFn];
            }
            this._validators.concat(validatorsFn);
        },

        /**
         * Marks an AbstractControl as touched
         * 
         * @public @function markAsTouched
         * @returns {void}
         */
        markAsTouched: function () {
            this.touched = true;
            this._checkValidity();
        },

        /**
         * Marks an AbstractControl as untouched
         * 
         * @public @function markAsUntouched
         * @returns {void}
         */
        markAsUntouched: function () {
            this.touched = false;
            this._checkValidity();
        },

        /**
         * @public @function hasErrors
         * @returns {boolean}
         */
        hasErrors: function () {
            return (this.errors && this.errors.length > 0);
        },

        /**
         * @public @function setParent
         * @param {AbstractControl} abstractControl 
         * @return {void}
         */
        setParent: function (abstractControl) {
            this.parent = abstractControl;
        },

        /**
         * Executes the validators and resets the value 
         * when no errors occure
         * 
         * @public @function updateValueAndValidity
         * @returns {void}
         */
        updateValueAndValidity: function () {
            this._checkValidity();

            if (!this.hasErrors()) {
                this.setValue(this.value);
            }
        },

        /**
         * @private @function checkValidity
         * @returns {void}
         */
        _checkValidity: function () {
            this.errors = [];
            const _this = this;

            this._validators.forEach(function(validator){
                const result = validator(_this);

                if (result && typeof result === TYPE_OBJECT) {
                    _this.errors.push(result);
                } else if (result) {
                    throw Error(ERROR_VALIDATORS_PATTERN);
                }
            });

            this._setErrosOnHtmlElements();
            this.setState((this._isInvalid() ? AbstractControlState.INVALID : AbstractControlState.VALID));
        },

        _setErrosOnHtmlElements: function(){
            const htmlElements = document.querySelectorAll([
                '[', (this._constructName === TYPE_FORMGROUP) ? FORMGROUP : FORMCONTROL ,'="', this._uid, '"]'
            ].join(''));
            const _this = this;

            Object.keys(htmlElements).forEach(function(key){
                if(_this.hasErrors()){
                    htmlElements[key].classList.add('error');
                    htmlElements[key].setAttribute('data-errors', JSON.stringify(_this.errors));
                }else{
                    htmlElements[key].classList.remove('error');
                    htmlElements[key].removeAttribute('data-errors');
                }
            });
        },

        /**
         * 
         * @abstract @private @function isInvalid
         * @returns {boolean} 
         */
        _isInvalid: function(){
            return this.hasErrors();
        }
    };

    abstractControl.setValue.bind(abstractControl);
    abstractControl.setState.bind(abstractControl);

    return abstractControl;
};
