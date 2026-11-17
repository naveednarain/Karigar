import { z } from 'zod';
export const parsedQuerySchema = z.object({
  service: z.enum(['plumbing','electrical','ac_service','painting','carpentry','cleaning','mason','appliance_repair','solar','cctv','pest_control','other']),
  sub_service: z.string().nullable(), area: z.string().nullable(),
  urgency: z.enum(['emergency','today','scheduled','flexible']), preferred_date: z.string().nullable(),
  budget_pkr: z.number().nonnegative().nullable(), language: z.enum(['en','ur','roman_ur']),
  estimated_price_range: z.string().nullable(), suggested_tags: z.array(z.string()).max(3), summary: z.string().max(240), clarifying_question: z.string().nullable(),
});
export type ParsedQuery = z.infer<typeof parsedQuerySchema>;
export const searchRequestSchema = z.object({ query: z.string().trim().min(2).max(500) });
