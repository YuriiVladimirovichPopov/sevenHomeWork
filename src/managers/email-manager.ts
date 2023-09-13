import { emailAdapter } from '../adapters/email-adapter';
import { EmailConfirmationType } from '../models/users/userViewModel';

export const emailManager = {
    async sendEmail(newUser: any) {
        await emailAdapter.sendEmail(newUser.email, 'code', newUser.EmailConfirmation.confirmationCode )
    }
}