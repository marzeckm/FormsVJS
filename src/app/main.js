/**
 * The main function
 */
(function(){
    const formsService = inject(FormsService);

    const formGroup = createFormGroup(formsService);
    formsService.init(document.querySelector('#formGroup'), formGroup);

    formGroup.valueChanges.subscribe(function(value){
        console.log(value);
    });
})();

/**
 * Is called by clicking the button
 * @param {HtmlNode} button 
 */
function submit(button){
    const formsService = inject(FormsService);
    const result = formsService.getFormGroupResult(button);

    console.log(result);
}

/**
 * @param {FormGroup} formsService 
 * @returns {FormGroup}
 */
function createFormGroup(formsService){
    const validatorNumber = function(control){ 
        return (!/^\d+$/.test(control.value) ? {onlyNumbers: 'This field only allowed numbers.'} : null)
    };

    const validatorRequired = function(control){
        return (!control.value ? {required: 'This field is not optional. Enter a value.'} : null)
    };

    const houseNumberFormControl = FormControl();
    houseNumberFormControl.setValidators([validatorNumber, validatorRequired]);

    const streetFormControl = FormControl();
    streetFormControl.setValidators([validatorRequired]);

    const nameFormControl = FormControl();
    nameFormControl.setValidators([validatorRequired]);

    const formGroupAddress = FormGroup({
        street: streetFormControl,
        housenumber: houseNumberFormControl
    });

    return formsService.createFormGroup({
        id: FormControl(), 
        name: nameFormControl,
        address: formGroupAddress
    });
}