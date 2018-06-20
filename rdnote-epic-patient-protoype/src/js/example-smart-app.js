(function(window){
  window.extractData = function() {
    var ret = $.Deferred();
console.log("extractData output local vars2");
    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      // var mPatient, mObservations;
      var mAllergyIntolerances, mBinaries, mCarePlans, mConditions, mDiagnosticReports,
      mEncounters, mObservations, mPatient, mPersons, mPractitioners; 
      if (smart.hasOwnProperty('patient')) {
        mPatient = smart.patient.read();
        mObservations = smart.patient.api.fetchAll({
                    type: 'Observation',
                    // query: {
                    //   code: {
                    //     $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                    //           'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                    //           'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                    //   }
                    // }
                  });
        mAllergyIntolerances = smart.patient.api.fetchAll({ type: 'AllergyIntolerance' });
        // mBinaries = smart.patient.api.fetchAll({ type: 'Binary' });
        mCarePlans = smart.patient.api.fetchAll({ type: 'CarePlan' });
        mConditions = smart.patient.api.fetchAll({ type: 'Condition' });
        mDiagnosticReports = smart.patient.api.fetchAll({ type: 'DiagnosticReport' });
        mEncounters = smart.patient.api.fetchAll({ type: 'Encounter' });
        mPersons = smart.patient.api.fetchAll({ type: 'Person' });
        mPractitioners = smart.patient.api.fetchAll({ type: 'Practitioner' });
        // patient/Binary.read  patient/Person.read patient/Practitioner.read

        $.when(mPatient, mObservations, mAllergyIntolerances, mBinaries, mCarePlans, 
          mConditions, mDiagnosticReports, mEncounters, mPersons, mPractitioners).fail(onError);

        $.when(mPatient, mObservations, mAllergyIntolerances, mBinaries, mCarePlans, 
          mConditions, mDiagnosticReports, mEncounters, mPersons, mPractitioners).done(
          function(patient, obv, allIntol, lBinaries, lCarePlans, lConditions, lDiagnosticReports, lEncounters, lPersons, lPractitioners) {



          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

console.log(patient);
console.log(obv);
console.log(allIntol);
console.log(lBinaries);
console.log(lCarePlans);
console.log(lConditions);
console.log(lDiagnosticReports);
console.log(lEncounters);
console.log(lPersons);
console.log(lPractitioners);

console.log(byCodes);
console.log(gender);


          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
