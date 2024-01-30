(function(){
    const formsService = inject(FormsService);
    const formGroup = formsService.createFormGroup({
        id: FormControl(), 
        name: FormControl()
    });
    formsService.init(document.querySelector('#formGroup'), formGroup);

    formGroup.get('id').valueChanges.subscribe(function(value){
        console.log(value);
    });
})()