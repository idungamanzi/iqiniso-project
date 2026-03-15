import { z } from 'zod';
export declare const contactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    subject: z.ZodEffects<z.ZodString, string, string>;
    message: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    message: string;
    subject: string;
    phone?: string | undefined;
}, {
    email: string;
    name: string;
    message: string;
    subject: string;
    phone?: string | undefined;
}>;
export type ContactInput = z.infer<typeof contactSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const serviceSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    shortDescription: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    shortDescription?: string | undefined;
    icon?: string | undefined;
    isActive?: boolean | undefined;
    order?: number | undefined;
}, {
    title: string;
    description: string;
    shortDescription?: string | undefined;
    icon?: string | undefined;
    isActive?: boolean | undefined;
    order?: number | undefined;
}>;
export declare const projectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    shortDescription: z.ZodOptional<z.ZodString>;
    client: z.ZodOptional<z.ZodString>;
    value: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    completionDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["COMPLETED", "ONGOING", "PLANNED"]>>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    shortDescription?: string | undefined;
    order?: number | undefined;
    client?: string | undefined;
    status?: "COMPLETED" | "ONGOING" | "PLANNED" | undefined;
    isFeatured?: boolean | undefined;
    value?: number | null | undefined;
    location?: string | undefined;
    startDate?: string | null | undefined;
    completionDate?: string | null | undefined;
}, {
    title: string;
    description: string;
    shortDescription?: string | undefined;
    order?: number | undefined;
    client?: string | undefined;
    status?: "COMPLETED" | "ONGOING" | "PLANNED" | undefined;
    isFeatured?: boolean | undefined;
    value?: number | null | undefined;
    location?: string | undefined;
    startDate?: string | null | undefined;
    completionDate?: string | null | undefined;
}>;
export declare const companyInfoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    aboutShort: z.ZodOptional<z.ZodString>;
    aboutFull: z.ZodOptional<z.ZodString>;
    vision: z.ZodOptional<z.ZodString>;
    mission: z.ZodOptional<z.ZodString>;
    policy: z.ZodOptional<z.ZodString>;
    yearEstablished: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    registrationNumber: z.ZodOptional<z.ZodString>;
    registrationCertificateUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    physicalAddress: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    facebookUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    instagramUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    linkedinUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    twitterUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    googleMapsEmbedUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    tagline?: string | undefined;
    aboutShort?: string | undefined;
    aboutFull?: string | undefined;
    vision?: string | undefined;
    mission?: string | undefined;
    policy?: string | undefined;
    yearEstablished?: number | null | undefined;
    registrationNumber?: string | undefined;
    registrationCertificateUrl?: string | undefined;
    physicalAddress?: string | undefined;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    facebookUrl?: string | undefined;
    instagramUrl?: string | undefined;
    linkedinUrl?: string | undefined;
    twitterUrl?: string | undefined;
    googleMapsEmbedUrl?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    tagline?: string | undefined;
    aboutShort?: string | undefined;
    aboutFull?: string | undefined;
    vision?: string | undefined;
    mission?: string | undefined;
    policy?: string | undefined;
    yearEstablished?: number | null | undefined;
    registrationNumber?: string | undefined;
    registrationCertificateUrl?: string | undefined;
    physicalAddress?: string | undefined;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    facebookUrl?: string | undefined;
    instagramUrl?: string | undefined;
    linkedinUrl?: string | undefined;
    twitterUrl?: string | undefined;
    googleMapsEmbedUrl?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map