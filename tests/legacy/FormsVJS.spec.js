describe('Tests for FormsVJS', function(){
    var formsService; 

    beforeEach(function(){
        formsService = inject(FormsService);
    });

    it('should create FormsService', function(){
        // then
        expect(formsService).toBeDefined();
        expect(formsService._constructName).toEqual('FormsService');
    });

    it('should create FormControl', function(){
        // when
        const formControl = FormControl();

        // then
        expect(formControl).toBeDefined();
        expect(formControl._uid).toBeDefined();
        expect(formControl._constructName).toEqual('FormControl');
    });

    it('should create FormGroup', function(){
        // when
        const formGroup = FormGroup({});

        // then
        expect(formGroup).toBeDefined();
        expect(formGroup._uid).toBeDefined();
        expect(formGroup._constructName).toEqual('FormGroup');
    });

    it('should create SimpleObservable', function(){
        // when
        const simpleObservable = SimpleObservable({});

        // then
        expect(simpleObservable).toBeDefined();
        expect(simpleObservable._constructName).toEqual('SimpleObservable');
    });

    it('should create ValidatorFn', function(){
        // when
        const validatorFn = ValidatorFn(function(){ return null});

        // then
        expect(validatorFn).toBeDefined();
        expect(validatorFn._constructName).toEqual('ValidatorFn');
    });

    it('should throw error when create empty FormGroup', function(){
        // then
        expect(FormGroup).toThrowError();
    });

    it('should contain FormControl in FormGroup', function(){
        // when
        const formControl = FormControl();
        const formGroup = FormGroup({
            id: formControl
        });

        // then
        expect(formGroup).toBeDefined();
        expect(formGroup.controls['id']).toBe(formControl);
    });

    it('should set error on FormControl', function(){
        // given
        const formControl = FormControl();
        formControl.setValidators([
            function(control){ return (!control.value) ? {error: 'error'} : null}
        ]);

        // when
        formControl.setValue(null);

        // then
        formControl.statusChanges.subscribe(function(status){
            expect(status).toBe(AbstractControlState.INVALID);
        });
        expect(formControl.hasErrors()).toBeTrue();
        expect(formControl.valid).toBeFalse();
        expect(formControl.invalid).toBeTrue();
        expect(formControl.state).toEqual(AbstractControlState.INVALID);
    });

    it('should get value from FormControl via observable', function(){
        // given
        const formControl = FormControl();

        // when
        formControl.setValue(12);

        // then
        formControl.valueChanges.subscribe(function(value){
            expect(value).toBe(12);
        });
    });

    it('should set error on FormGroup by child', function(){
        // given
        const formControl = FormControl();
        const formGroup = FormGroup({
            id: formControl
        });
        formControl.setValidators([
            function(control){ return (control.value < 10) ? {error: 'error'} : null}
        ]);

        // when
        formControl.setValue(9);

        // then
        formGroup.statusChanges.subscribe(function(status){
            expect(status).toBe(AbstractControlState.INVALID);
        });
        expect(formControl.hasErrors()).toBeTrue();
        expect(formGroup.valid).toBeFalse();
        expect(formGroup.invalid).toBeTrue();
        expect(formGroup.state).toEqual(AbstractControlState.INVALID);
    });

    it('should get value from FormGroup from setting child via observable', function(){
        // given
        const formControl = FormControl();
        const formGroup = FormGroup({
            id: formControl
        });

        // when
        formControl.setValue(9);

        // then
        formGroup.valueChanges.subscribe(function(value){
            expect(value).toEqual({id:9});
        });
    });

    it('should inject the same service all the time', function(){
        // given
        const service1 = inject(FormsService);
        const service2 = inject(FormsService);

        // then
        expect(service1).toBe(service2);
    });

    it('should extrend the interface by new class', function(){
        // given
        const ifRef = function(){
            return {
                id: 1
            }
        };

        const classRef = {
            name: 'Max'
        };

        // when
        const extendedClass = ifExtends(ifRef, classRef);

        // then
        expect(extendedClass.id).toBe(1);
        expect(extendedClass.name).toEqual('Max');
    });
});
