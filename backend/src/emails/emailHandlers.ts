import {resendClient} from "./resend";
import {createWelcomeEmailTemplate} from "./emailTemplates";
import AppError from "../error-handling/AppError";

const name = process.env.EMAIL_FROM_NAME as string;
const email = process.env.EMAIL_FROM as string;


export const sendWelcomeEmail = async (name: string, email: string, clientURL: string) => {
    const {data, error} = await resendClient.emails.send({
        from : `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to : email,
        subject : "Welcome to PingMe",
        html : createWelcomeEmailTemplate(name, clientURL)
    })

    if(error){
        console.error("Error sending welcome email:", error);
        throw new AppError("Failed to send welcome email", 500);
    }

    console.info("Welcome email sent successfully : ", data)
}