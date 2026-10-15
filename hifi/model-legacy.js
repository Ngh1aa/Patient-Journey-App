/* CareFlow low-fidelity DEMO model — simulated states only, NO medical decision engine. */
const CareFlowModel = (function createModel(){
  const SCREENS=["A1","A2","B1","C1","C2","C3","C4","C5","C6","D1","D2","D3","E1","E2","E3","E4","F1","F2","F3","F4","G1","G2","G3","H1"];
  function initial(){return {actorId:"actor-demo",person:"self",reason:"",screening:"",risk:false,mode:"onsite",slot:"09:00",appointment:null,bookingPending:false,requestKey:null,bookingError:"",slotUnavailable:false,payment:"unpaid",result:"awaiting_doctor_review",communication:"pending",callback:"none",canBookRelative:true,canViewRelativeResults:false,video:"waiting",queue:"not_checked_in",lastAppointmentCancelled:false};}
  function choosePerson(s,person){
    if(!["self","relative"].includes(person)) return {ok:false,code:"INVALID_PERSON"};
    if(s.person!==person){s.person=person;s.reason="";s.screening="";s.risk=false;s.slot="";s.requestKey=null;s.bookingPending=false;s.bookingError="";s.slotUnavailable=false;}
    return {ok:true,person:s.person};
  }
  function screening(s,answer){
    if(!["normal","warning"].includes(answer))return {ok:false,code:"SCREENING_REQUIRED"};
    s.screening=answer;s.risk=s.risk||answer==="warning";return {ok:true,next:s.risk?"C3":"C4"};
  }
  function canBook(s){return s.person==="self"||s.canBookRelative;}
  function mayEnter(s,id){
    if(!SCREENS.includes(id))return false;
    if(["C4","C5","C6"].includes(id)&&s.risk)return false;
    if(id==="C6"&&(!s.appointment||s.appointment.patientId!==(s.person==="self"?"patient-self":"patient-relative")))return false;
    return true;
  }
  function attemptBooking(s,outcome="success"){
    if(s.risk||s.screening==="warning") return {ok:false,code:"CLINICAL_REVIEW_REQUIRED"};
    if(s.screening!=="normal")return {ok:false,code:"SCREENING_INCOMPLETE"};
    if(!canBook(s))return {ok:false,code:"NO_BOOK_PERMISSION"};
    if(!s.slot)return {ok:false,code:"NO_SLOT"};
    if(s.appointment && s.requestKey==="REQ-DEMO-1")return {ok:true,code:"EXISTING_BOOKING",appointment:s.appointment};
    if(s.bookingPending)return {ok:false,code:"UNCONFIRMED_REQUEST"};
    s.requestKey="REQ-DEMO-1";
    s.bookingError="";
    if(outcome==="slot_unavailable"){s.bookingError="SLOT_UNAVAILABLE";s.slot="";s.slotUnavailable=true;s.requestKey=null;return {ok:false,code:"SLOT_UNAVAILABLE"};}
    if(outcome==="network_unknown"){s.bookingPending=true;s.bookingError="UNCONFIRMED_REQUEST";return {ok:false,code:"UNCONFIRMED_REQUEST"};}
    if(outcome!=="success")return {ok:false,code:"UNSUPPORTED_OUTCOME"};
    s.appointment={id:"DEMO-001",patientId:s.person==="self"?"patient-self":"patient-relative",createdBy:s.actorId,slot:s.slot,mode:s.mode,status:"confirmed"};
    return {ok:true,code:"BOOKED",appointment:s.appointment};
  }
  function resolveUnknown(s,serverHasBooking=false){
    if(!s.bookingPending)return {ok:false,code:"NO_PENDING_REQUEST"};
    s.bookingPending=false;s.bookingError="";
    if(serverHasBooking){s.appointment={id:"DEMO-001",patientId:s.person==="self"?"patient-self":"patient-relative",createdBy:s.actorId,slot:s.slot,mode:s.mode,status:"confirmed"};return {ok:true,code:"FOUND_CONFIRMED"};}
    s.requestKey=null;return {ok:true,code:"NOT_FOUND_RETRY_ALLOWED"};
  }
  function canViewResults(s){return s.person==="self"||s.canViewRelativeResults;}
  function mayOpenResultLink(s,subject){return (subject==="patient-self"&&s.person==="self")||(subject==="patient-relative"&&s.person==="relative"&&s.canViewRelativeResults);}
  function requestCallback(s){s.callback="pending";return {ok:true,code:"CALLBACK_RECEIVED_DEMO"};}
  function startPayment(s){if(s.payment==="unpaid"){s.payment="pending_reconciliation"}return s.payment;}
  function settlePayment(s){if(s.payment!=="pending_reconciliation")return {ok:false,code:"NOT_PENDING"};s.payment="paid";return {ok:true};}
  function doctorReviewed(s){s.result="reviewed";return {result:s.result,communication:s.communication};}
  function notifyPatient(s){if(s.result!=="reviewed")return {ok:false,code:"RESULT_NOT_REVIEWED"};s.communication="notified";return {ok:true};}
  return {SCREENS,initial,choosePerson,screening,canBook,mayEnter,attemptBooking,resolveUnknown,canViewResults,mayOpenResultLink,requestCallback,startPayment,settlePayment,doctorReviewed,notifyPatient};
})();
if(typeof window!=="undefined") window.CareFlowModel=CareFlowModel;
if(typeof module!=="undefined"&&module.exports) module.exports=CareFlowModel;
