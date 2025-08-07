import { z } from 'zod';

const isValidCardanoBech32Prefix = (address: string) => {
    return (
        address.startsWith('addr') ||
        address.startsWith('addr_test') ||
        address.startsWith('stake')
    );
};

export const SubmitIntentSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters long.' })
        .trim(),
    userName: z
        .string()
        .min(2, { message: 'Username must be at least 2 characters long.' })
        .trim(),
    bio: z
        .string()
        .min(69, { message: 'Bio must be at least 69 characters long.' })
        .trim(),
    email: z.email({ message: 'Please enter a valid email.' }).trim(),
    // address: z
    //     .string()
    //     .min(1, { message: 'Address is required.' })
    //     .refine(isValidCardanoBech32Prefix, {
    //         message: 'Invalid Cardano address. Must be a valid mainnet or testnet address.',
    //     }),
});

export const LoginFormSchema = z.object({
    address: z
        .string()
        .min(1, { message: 'Address is required.' })
        .refine(isValidCardanoBech32Prefix, {
            message: 'Invalid Cardano address. Must be a valid mainnet or testnet address.',
        }),
});

export type FormState =
    | {
        errors?: {
            name?: string[];
            email?: string[];
            bio?: string[];
            userName?: string[];
        };
        message?: string;
    }
    | undefined;

export type SessionPayload = {
    address: string ;
    expiresAt: Date;
};