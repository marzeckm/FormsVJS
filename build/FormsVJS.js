/**
 * Errors
 */
const ERROR_VALIDATORS_PATTERN = 'ValidatorFn have to be build in the following pattern: (abstractControl:AbstractControl) => {key:string : value:string} | null.';
const ERROR_VALIDATOR_CONTAIN_FN = 'Validators have to contain a function that returns either null (no Error) or an Object (Error)!';
const ERROR_CONTROL_STATE = 'The requested Control-State is not available.';
const ERROR_ONLY_ONE_ATTRIBUTE = 'You can only set one of these attributes per DOM-Element: formGroupName, formGroup, formControlName or formControl!';

/**
 * Data types
 */
const TYPE_OBJECT = 'object';
const TYPE_STRING = 'string';
const TYPE_ARRAY = 'Array';
const TYPE_FUNCTION = 'function';
const TYPE_FORMGROUP = 'FormGroup';
const TYPE_FORMCONTROL = 'FormControl';

/**
 * other
 */
const EMIT_EVENT = 'emitEvent';
const FORMCONTROL_NAME = 'formControlName';
const FORMGROUP_NAME = 'formGroupName';
const FORMCONTROL = 'formControl';
const FORMGROUP = 'formGroup';

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


/**
 * @class FormControl
 * @author {Maximilian Marzeck}
 */
const FormControl = function(){
    const formControl = ifExtends(AbstractControl, {
        // Nothing to do
    });

    /**
     * Acts as Constructor
     */
    formControl._constructName = TYPE_FORMCONTROL;

    const formsService = inject(FormsService);
    formsService.addFormControl(formControl);

    return formControl;
}

/**
 * Implementation of a {@link FormGroup} which contains multiple {@link AbstractControl}
 * 
 * @class {FormGroup}
 * @author {Maximilian Marzeck}
 */
const FormGroup = function (controls) {
    const formGroup = ifExtends(AbstractControl, {
        _constructName: TYPE_FORMGROUP,

        /**
         * @public @var {{string: AbstractControl}} controls
         */
        controls: {},

        /**
         * @private @var _dataType;
         */
        _dataType: undefined,

        /**
         * Returns depending on a key or list of keys the wanted Sub-Control
         * 
         * @public @function get
         * @param {string | string[]} key 
         * @return {AbstractControl}
         */
        get: function (key) {
            if (typeof key === TYPE_STRING) {
                return this.controls[key];
            } else if (key.constructor === TYPE_ARRAY) {
                const tempKey = key.shift();
                return ((key.length > 0) ? this.get(key) : this.controls[tempKey]);
            }

            return undefined;
        },

        /**
         * Adds an {@link AbstractControl} to the children
         * 
         * @public @function addControl
         * @param {string} name 
         * @param {AbstractControl} control 
         * @param {{emitEvent?:boolean}} options 
         * @returns {void}
         */
        addControl: function (name, control, options) {
            options = (options ? options : {emitEvent: true});

            this.controls[name] = control;
            control.parent = this;

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = control;
            }
        },

        /**
         * Removes an {@link AbstractControl} from the children
         * 
         * @public @function removeControl
         * @param {string} name 
         * @param {{emitEvent:boolean}} options 
         * @returns {void}
         */
        removeControl: function (name, options) {
            options = options ? options : {emitEvent: true};
            delete this.controls[name];

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = undefined;
            }
        },

        /**
         * Marks all Sub-Controls as touched
         * @public @function markAllAsTouched
         * @returns {void}
         */
        markAllAsTouched: function () {
            this.markAsTouched();
            Object.keys(this.controls).forEach(function(key){
                if (controls[key]._constructName === TYPE_FORMGROUP) {
                    controls[key].markAllAsTouched();
                }
                controls[key].markAsTouched();
            });
        },

        /**
         * Marks all Sub-Controls as untouched
         * @public @function markAllAsUntouched
         * @returns {void}
         */
        markAllAsUntouched: function () {
            this.markAsUntouched();
            Object.keys(this.controls).forEach(function(key){
                if (controls[key].constructName === TYPE_FORMGROUP) {
                    controls[key].markAllAsUntouched();
                }
                controls[key].markAsUntouched();
            });
        },

        /**
         * @private @function refreshValue
         * @returns {void}
         */
        _refreshValue: function () {
            const tempValue = {};
            const _this = this; 

            Object.keys(this.controls).forEach(function(key){
                tempValue[key] = _this.controls[key].value;
            })
            this.setValue((this._dataType) ? this._dataType.deserialize(tempValue) : tempValue);
        },

        /**
         * @private @var setFormGroupStatus
         * @param {AbstractControlState} status 
         * @returns {void}
         */
        _setFormGroupStatus: function (status) {
            this.setState(this._getStatusFromChildren() ? AbstractControlState.INVALID : status);
        },

        /**
         * 
         * @override @private @function isInvalid
         * @returns {boolean} 
         */
        _isInvalid: function(){
            return this.hasErrors() || this._getStatusFromChildren();
        },

        /**
         * @private @function getStatusFromChildren 
         */
        _getStatusFromChildren: function(){
            const _this = this;
            return (Object.keys(this.controls).map(function(key){
                return !_this.controls[key].valid
            }).filter(Boolean).length > 0);
        }
    });

    /**
     * Acts as constructor
     */
    formGroup.value = {};

    Object.keys(controls).forEach(function (key) {
        if ([TYPE_FORMCONTROL, TYPE_FORMGROUP].indexOf(controls[key]._constructName) > -1) {
            formGroup.controls[key] = controls[key];
            controls[key].parent = formGroup;
        }
    });

    const formsService = inject(FormsService);
    formsService.addFormGroup(formGroup);

    return formGroup;
};

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

/**
 * Extends a given interface
 * 
 * @param {Class} interface 
 * @param {Class} classRef 
 */
const ifExtends = function(interface, classRef){
    const result = interface();

    Object.keys(classRef).forEach(function(key){
        result[key] = classRef[key];
    });

    return result;
}

/**
 * Injects an Singleton into the class where the function is called
 * 
 * @global @function inject
 * @param {Class} classRef
 * @returns {Object} instanceOfClass
 */
const inject = function(classRef){
    // Checks if the requested Object was already 
    if(window._singletons === undefined){
        window._singletons = {};
    }

    // Checks if an Instance of this class was already injected
    if(window._singletons[classRef()._constructName] === undefined){
        window._singletons[classRef()._constructName] = classRef();
    }

    return window._singletons[classRef()._constructName];
}

/**
 * Service for the form creation and handeling.
 * Attention! Should always be included by Dependency Injection
 * 
 * @service {FormsService}
 * @author {Maximilian Marzeck}
 */
const FormsService = function(){
    /**
     * Return Object of "Type" FormsService
     */
    return {
        /**
         * @private @var {string} constructName
         */
        _constructName: 'FormsService',

        /**
         * @private @var {{key:string : control:AbstractControl}}
         */
        _controls: {},

        /**
         * 
         * @param {HtmlNode} formGroupEl 
         * @param {FormGroup} formGroup 
         */
        init: function(formGroupEl, formGroup){
            formGroupEl.setAttribute(FORMGROUP, formGroup._uid);
            const formControls = formGroupEl.querySelectorAll(['[', FORMCONTROL_NAME, ']'].join(''));
            
            const _this = this;
            Object.keys(formControls).forEach(function(key){
                _this.getParentForm(formControls[key]);
            });
        },

        /**
         * @public @function createFormGroup
         * @param {{key:string : control:FormControl}, undefined} controls 
         * @return {FormGroup}
         */
        createFormGroup: function(controls){
            const res = {};

            Object.keys(controls).forEach(function(key){
                res[key] = controls[key];
            });

            return new FormGroup(res);
        },

        /**
         * @public @function createFormControl
         * @return {FormControl}
         */
        createFormControl: function(){
            return new FormControl();
        },

        /**
         * @public @function addFormControl
         * @param {FormControl} formControl 
         */
        addFormControl: function(formControl){
            this._controls[formControl._uid] = formControl;
        },

        /**
         * @public @function addFormControl
         * @param {FormGroup} formGroup 
         */
        addFormGroup: function(formGroup){
            this._controls[formGroup._uid] = formGroup;
        },

        /**
         * @public @function controlAvailable
         * @param {string} uid 
         * @returns {boolean}
         */
        controlAvailable: function(uid){
            return !!this._controls[uid];
        },

        /**
         * Achtung! Untestbar, da DOM benötigt wird
         * 
         * @public @function getParentForm
         * @param {HtmlNode} element 
         * @returns {FormGroup | null}
         */
        getParentForm: function(element){
            if(this._checkFormGroupIdentifierOnce(element)){
                throw Error(ERROR_ONLY_ONE_ATTRIBUTE);
            }

            while (element && element.nodeType === 1) {
                element = element.parentNode;

                if (element.hasAttribute(FORMGROUP)) {
                    const result = this._controls[element.getAttribute(FORMGROUP)];
                    this._setFormControls(element, result);
                    return result;
                }else if(element.hasAttribute(FORMGROUP_NAME)){
                    const result = this.getParentForm(element);
                    this._setFormControls(element, result);
                    return result;
                }
            }
            return null;
        },

        /**
         * Achtung! Untestbar, da DOM benötigt wird
         * Wird ausgeführt wenn eine Speicher-Aktion auf ein Formular angewendet wird
         * 
         * @public @function saveAction
         * @param {*} element 
         * @returns {FormGroup} 
         */
        saveAction: function(element){
            const formGroup = this.getParentForm(element);
            formGroup.markAllAsTouched();
            return formGroup;
        },

        /**
         * Gibt eine unique ID zurück
         * 
         * @private @function generateUID
         * @param {number} length 
         * @returns {string}
         */
        generateUID: function(length) {
            var uid;
            while ((!uid || this.controlAvailable(uid))) {
                uid = ['@', this._generateRadomString('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length)].join('');
            }
            return uid;
        },

        /**
         * Gets the result of the formGroup and marks all as touched
         * @param {HtmlNode} buttonEl 
         * @param {Class} classRef 
         * @returns {FormGroup}
         */
        getFormGroupResult: function(buttonEl, classRef){
            const result = this.getParentForm(buttonEl);
            result.markAllAsTouched();

            if(classRef){
                if(classRef.deserialize){
                    result.setValue(classRef.deserialize(result.value));
                }else if(classRef().deserialize){
                    result.setValue(classRef().deserialize(result.value))
                }
            }

            return result;
        },
        
        /**
         * @private @function generateRadomString
         * @param {string} pool 
         * @param {number} length 
         * @returns {string}
         */
        _generateRadomString: function(pool, length, startString){
            startString = startString || '';
    
            for (var i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                startString += pool.charAt(randomIndex);
            }
    
            return startString;
        },

        /**
         * @private @function checkFormGroupIdentifierOnce
         * @param {HtmlNode} abstractControlEl 
         * @returns {boolean}
         */
        _checkFormGroupIdentifierOnce: function(abstractControlEl){
            return ([
                abstractControlEl.getAttribute(FORMGROUP),
                abstractControlEl.getAttribute(FORMGROUP_NAME),
                abstractControlEl.getAttribute(FORMCONTROL),
                abstractControlEl.getAttribute(FORMCONTROL_NAME)
            ].map(function(el){
                return (el ? true : undefined);
            }).length <= 1);
        },

        /**
         * 
         * @private @function setFormControls
         * @param {HtmlNode} formGroupEl 
         * @param {FormGroup} formGroup 
         * @returns {void}
         */
        _setFormControls: function(formGroupEl, formGroup){
            const _this = this;

            Object.keys(formGroup.controls).forEach(function(key){
                const tempConstruct = formGroup.controls[key]._constructName;

                const tempType = (tempConstruct === TYPE_FORMGROUP ? 
                    AbstractControlType.FORMGORUP : AbstractControlType.FORMCONTROL);
                const tempName = ['[', _this._getControlName(tempConstruct), '=', key, ']'].join('');
                _this._prepareAbstractControl(formGroupEl.querySelector(tempName), tempType, formGroup.controls[key]._uid); 
            });
        },

        /**
         * 
         * @private @function prepareAbstractControl
         * @param {HtmlNode} abstractControlEl 
         * @param {AbstractControlType} controlType 
         * @param {string} uid 
         * @returns {void}
         */
        _prepareAbstractControl: function(abstractControlEl, controlType, uid){
            if(abstractControlEl){
                abstractControlEl.setAttribute(
                    (controlType === AbstractControlType.FORMCONTROL) ? FORMCONTROL : FORMGROUP, uid);
                abstractControlEl.removeAttribute(
                    (controlType === AbstractControlType.FORMCONTROL) ? FORMCONTROL_NAME : FORMGROUP_NAME);
                
                if(controlType === AbstractControlType.FORMCONTROL){
                    abstractControlEl.oninput = function(event){
                        const formsService = inject(FormsService);
                        formsService._controls[event.target.getAttribute(FORMCONTROL)].setValue(event.target.value)
                    }
                }
            }
        },

        /**
         * 
         * @private @function getControlName
         * @param {string} constructName 
         * @returns {string}
         */
        _getControlName: function(constructName){
            return (constructName === TYPE_FORMGROUP ? FORMGROUP_NAME : FORMCONTROL_NAME);
        }
    }
}
