'use server';

import { FormState, LoginFormSchema } from '../definition';

export async function SignIn(formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    address: formData.get('address'),
  });

  if (!validatedFields.success) {
    const formatted = validatedFields.error.format();

    return {
      errors: {
        name: formatted.address?._errors,
      },
    };
  }

  return { success: true };
}
