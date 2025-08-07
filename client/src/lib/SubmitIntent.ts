'use server';

import { FormState, SubmitIntentSchema } from './definition';
import { createSession } from './auth/session';
import { eq } from 'drizzle-orm';
import { applyMembership } from '@/services';


export async function SubmitIntentAction(
    state: FormState,
    formData: FormData
): Promise<FormState> {
    // 1. Validate form fields
    const validatedFields = SubmitIntentSchema.safeParse({
        name: formData.get('name'),
        userName: formData.get('userName'),
        email: formData.get('email'),
        bio: formData.get('bio'),
        t_c: formData.get('t_c'),
        asset: formData.get('asset')
    });

    // 2. If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, userName, bio } = validatedFields.data;

    const payload = {
        tokenUtxoHash: asset.txHash,
        tokenUtxoIndex: asset.outputIndex,
        userMetadata: {
            fullname: name,
            bio: bio,
            email: email,
            displayName: userName,
        },
        wallet,
        address,
        tokenPolicyId: asset.policyId,
        tokenAssetName: asset.assetName,
    };

    try {
        const result = await applyMembership(payload);
        console.log('Membership applied:', result);
    } catch (error) {
        console.error('Failed to apply membership:', error);
    }
}