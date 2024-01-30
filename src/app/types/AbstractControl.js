/*import { AbstractControlState } from '../enums/AbstractControlState';
import { FormsService } from '../services/forms/forms.service';
import { ValidatorFn } from './ValidatorFn';*/

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

    /**
     * TODO
     */
    /*this._valueObs = new rxjs.Subject();
    this.valueChanges = this._valueObs.asObservable();

    this._stateObs = new rxjs.Subject();
    this.statusChanges = this._stateObs.asObservable();*/
    const abstractControl = {
        /**
         * @private @var construct
         */
        _constructName: 'AbstractControl',

        /**
         * @public @var {AbstractControl<T>} parent
         */
        parent,

        /**
         * Achtung! Sollte nur gelesen werden!
         * @public @var {any} value
         */
        value: undefined,

        /**
         * // TODO
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
        * Achtung! Sollte nur gelesen werden!
        * 
        * @public @var {AbstractControlState} state
        */
        state: AbstractControlState.VALID,

        /**
         * TODO
         * @public @var {SimpleObservable} statusChanges;
         */
        statusChanges: statusChanges,

        /**
         * Achtung! Sollte nur gelesen werden!
         * 
         * @public @var {boolean} touched;
         */
        touched: false,

        /**
         * Achtung! Sollte nur gelesen werden!
         * 
         * @public @var {ValidationErrors[] | null}
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
         * @private @var {function} errorCallback
         */
        _errorCallBack: undefined,

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
                console.error("The requested Control-State is not available.");
            }

            if (this.parent) {
                this.parent?._setFormGroupStatus(state);
            }
        },

        /**
         * @param {ValidatorFn | ValidatorFn[] | function | function[]} validatorsFn 
         * @return {void}
         */
        setValidators(validatorsFn) {
            if (validatorsFn.constructor === Array) {
                this._validators = validatorsFn.map(validatorFn => new ValidatorFn(validatorFn));
            }
            this._validators = validatorsFn;
        },

        /**
         * @param {ValidatorFn | ValidatorFn[] | function | function[]} validatorsFn 
         * @return {void}
         */
        addValidators: function(validatorsFn) {
            if (validatorsFn.constructor === Array) {
                validatorsFn.forEach(validatorFn => this._validators.push(new ValidatorFn(validatorFn)));
            }
            this._validators.push(validatorsFn);
        },

        /**
         * Markiert das betreffende Element als berührt
         * @public @function markAsTouched
         * @returns {void}
         */
        markAsTouched: function () {
            this.touched = true;
            this._checkValidity();
        },

        /**
         * Markiert das betreffende Element als unberührt
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
         * Führt die Validatoren aus und setzt den 
         * Wert neu, wenn es keinen Fehler gibt
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

            this._validators.forEach((validator) => {
                const result = validator(this);

                if (result && typeof result === 'object') {
                    this.errors.push(result);
                    if (this._errorCallBack) {
                        this._errorCallBack(this.errors);
                    }
                } else if (result) {
                    throw Error('ValidatorFn müssen folgendermaßen aufgebaut sein: (abstractControl:AbstractControl) => {key:string : value:string} | null.');
                }
            });

            this.setState((this.hasErrors()) ? AbstractControlState.INVALID : AbstractControlState.VALID);
        },

        _init: function(){

            
        }

    };

    abstractControl.setValue.bind(abstractControl);
    abstractControl.setState.bind(abstractControl);
    abstractControl.parent = undefined;

    return abstractControl;
};