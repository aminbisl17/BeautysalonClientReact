
export class ExceptionHandler{


   static redirect(){
         window.location.replace("/");
    }

    static handle(ex){
        if(ex instanceof TokenException){
             setTimeout(() => {
            alert(`Session expired: ${ex.message}`);
            ExceptionHandler.redirect();
        }, 0); 
        return;
        }
        setTimeout(() => {
        alert(`Error: ${ex.message || ex}`);
    }, 0);
    }

}

class TokenException extends Error{
    constructor(){
           super("Invalid JWT Token!")
           this.name = "TokenException";
    }
}