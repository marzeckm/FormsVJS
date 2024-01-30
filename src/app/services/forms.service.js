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
            formGroupEl.setAttribute('formGroup', formGroup._uid);
            const formControls = formGroupEl.querySelectorAll('[formControlName]');
            
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
                throw Error('You can only either set formGroupName or formGroup or formControlName or formControl');
            }

            while (element && element.nodeType === 1) {
                if (element.hasAttribute('formGroup')) {
                    const result = this._controls[element.getAttribute('formGroup')];
                    this._setFormControls(element, result);
                    return result;
                }else if(element.hasAttribute('formGroupName')){
                    return result;
                }
                // Gehe eins höher zur Parent-Komponente
                element = element.parentNode;
            }
            return null;
        },

        /**
         * Achtung! Untestbar, da DOM benötigt wird
         * 
         * @public @function getChildControl
         * @param {AbstractControl} abstractControl 
         * @param {string} name 
         * @returns 
         */
        getChildControl: function(abstractControl, name){
            let control = document.querySelector(`[formGroup="${abstractControl._uid}"]`);
            
            if(abstractControl.constructor === FormGroup){
                if(abstractControl.controls[name]){
                    const result = abstractControl.controls[name];
                    result.setParent(abstractControl);
                    return result;
                }

                for(subform of (control.querySelector('[data-form-group-name]') || [])){
                    const currControl = abstractControl.controls[subform.getAttribute('data-form-group-name')];
                    currControl.setParent(abstractControl);
                    return this.getChildControl(currControl, name);
                }
            };

            throw Error('Das ausgewählte FormControl wurde nicht in der übergeordneten Formgruppe gefunden!');
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
            let uid;
            for (let i = 0; i < 100 && (!uid || this.controlAvailable(uid)); i++) {
                uid = ['@', this._generateRadomString('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length)].join('');
            }
            return uid;
        },
        
        /**
         * @private @function generateRadomString
         * @param {string} pool 
         * @param {number} length 
         * @returns {string}
         */
        _generateRadomString(pool, length){
            let randomString = '';
    
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                randomString += pool.charAt(randomIndex);
            }
    
            return randomString;
        },

        _checkFormGroupIdentifierOnce: function(abstractControlEl){
            return ([
                abstractControlEl.getAttribute('formGroup'),
                abstractControlEl.getAttribute('formGroupName'),
                abstractControlEl.getAttribute('formControl'),
                abstractControlEl.getAttribute('formControlName')
            ].map(function(el){
                return (el ? true : undefined);
            }).length <= 1);
        },

        _setFormControls: function(formGroupEl, formGroup){
            const _this = this;

            Object.keys(formGroup.controls).forEach(function(key){
                const tempConstruct = formGroup.controls[key]._construct;

                const tempType = (tempConstruct === 'FormGroup' ? AbstractControlType.FORMGORUP : AbstractControlType.FORMCONTROL);
                const tempName = ['[', (tempConstruct === 'FormGroup' ? 'formGroupName' : 'formControlName'), '=', key, ']'].join('');
                _this._prepareAbstractControl(formGroupEl.querySelector(tempName), tempType, formGroup.controls[key]._uid); 
            });
        },

        _prepareAbstractControl: function(abstractControlEl, controlType, uid){
            if(abstractControlEl){
                abstractControlEl.setAttribute(
                    (controlType === AbstractControlType.FORMCONTROL) ? 'formControl' : 'formGroup', uid);
                abstractControlEl.removeAttribute(
                    (controlType === AbstractControlType.FORMCONTROL) ? 'formControlName' : 'formGroupName');
                
                if(controlType === AbstractControlType.FORMCONTROL){
                    abstractControlEl.oninput = function(event){
                        const formsService = inject(FormsService);
                        formsService._controls[event.target.getAttribute('formControl')].setValue(event.target.value)
                    }
                }
            }
        }
    }
}