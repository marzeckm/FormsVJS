/**
 * @service FormsService
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

            Object.entries(controls).forEach(([key, control]) => {
                res[key] = control;
            });

            return new FormGroup(res);
        },

        /**
         * @public @function createFormControl
         * @return {FormControl}
         */
        createFormControl: function(){
            return new FormControl({});
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
            for (let i = 0; i < 1000 && (!uid || this.controlAvailable(uid)); i++) {
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
        getFormGroupResult(buttonEl, classRef){
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
        _generateRadomString(pool, length, startString){
            startString = startString || '';
    
            for (var i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                startString += pool.charAt(randomIndex);
            }
    
            return startString;
        },

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

        _setFormControls: function(formGroupEl, formGroup){
            const _this = this;

            Object.keys(formGroup.controls).forEach(function(key){
                const tempConstruct = formGroup.controls[key]._constructName;

                const tempType = (tempConstruct === TYPE_FORMGROUP ? AbstractControlType.FORMGORUP : AbstractControlType.FORMCONTROL);
                const tempName = ['[', (tempConstruct === TYPE_FORMGROUP ? FORMGROUP_NAME : FORMCONTROL_NAME), '=', key, ']'].join('');
                _this._prepareAbstractControl(formGroupEl.querySelector(tempName), tempType, formGroup.controls[key]._uid); 
            });
        },

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
        }
    }
}