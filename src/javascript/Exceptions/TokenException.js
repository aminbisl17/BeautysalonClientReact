export class TokenException extends Error{
    constructor(){
           super("Invalid JWT Token!")
           this.name = "TokenException";
    }
 }