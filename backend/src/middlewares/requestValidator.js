import * as z from "zod"

export const loginAdminValidator = async(req,res,next) =>{
try {
    const loginAdminSchema =z.object({
        email: z.email(),
        password: z.string().nonempty("password is required")  
    }).strict();
    const data = loginAdminSchema.parse(req.body);
    next();
} catch (error) {
    console.log(error);
    return res.status(500).send({
        status:"error",
        message:error.message
    })
}
}