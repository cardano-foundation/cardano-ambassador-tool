'use server';

import { createSession, deleteSession } from './session';
import {
    FormState,
    LoginFormSchema,
} from '../definition';

export async function SignIn(
    formData: FormData,
): Promise<FormState> {
    const validatedFields = LoginFormSchema.safeParse({
        address: formData.get('address'),
    });
    const errorMessage = { message: 'Invalid login credentials.' };

    if (!validatedFields.success) {
        const formatted = validatedFields.error.format();

        return {
            errors: {
                name: formatted.address?._errors,
            },
        };
    }
    await createSession(validatedFields.data.address);
}

export async function logout() {
    deleteSession();
}