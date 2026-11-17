export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row extends Record<string, unknown>> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };
type ProviderCard = { id:string; full_name:string|null; avatar_url:string|null; headline:string|null; skill_title:string|null; bio:string|null; experience_years:number; is_available:boolean; is_verified:boolean; rating_avg:number; rating_count:number; jobs_completed:number; response_minutes:number; visit_fee:number };
export type Database = {
  public: {
    Tables: {
      profiles:Table<{id:string;role:'user'|'provider'|'admin';full_name:string|null;phone:string|null;avatar_url:string|null;language:string;is_blocked:boolean;is_demo:boolean;created_at:string}>;
      services:Table<{id:number;slug:string;name_en:string;name_ur:string;icon:string|null;image_url:string|null;min_price:number|null;max_price:number|null;sort_order:number;is_active:boolean}>;
      sub_services:Table<{id:number;service_id:number|null;name_en:string;name_ur:string|null}>;
      areas:Table<{id:number;slug:string;name_en:string;name_ur:string|null;city:'Hyderabad'|'Jamshoro'|'Kotri';lat:number|null;lng:number|null;is_active:boolean}>;
      providers:Table<{id:string;headline:string|null;skill_title:string|null;bio:string|null;experience_years:number;status:string;rejection_reason:string|null;is_available:boolean;is_verified:boolean;rating_avg:number;rating_count:number;jobs_completed:number;response_minutes:number;visit_fee:number;hourly_rate:number|null;review_summary:string|null;review_summary_count:number;created_at:string}>;
      provider_services:Table<{provider_id:string;service_id:number;starting_price:number|null;price_note:string|null}>;
      provider_areas:Table<{provider_id:string;area_id:number}>;
      provider_gallery:Table<{id:string;provider_id:string|null;image_url:string;created_at:string}>;
      provider_documents:Table<{id:string;provider_id:string;document_type:string;storage_path:string;cnic_last4:string|null;review_status:string;created_at:string}>;
      addresses:Table<{id:string;user_id:string|null;label:string|null;area_id:number|null;full_address:string;lat:number|null;lng:number|null;is_default:boolean}>;
      bookings:Table<{id:string;code:string;user_id:string|null;provider_id:string|null;service_id:number|null;sub_service_id:number|null;address_id:string|null;description:string|null;photos:string[];urgency:string;distance_km:number|null;scheduled_at:string|null;status:string;estimated_price:number|null;final_price:number|null;commission:number;payment_method:string;payment_status:string;cancel_reason:string|null;created_at:string;accepted_at:string|null;completed_at:string|null}>;
      booking_events:Table<{id:string;booking_id:string|null;status:string;note:string|null;created_at:string}>;
      booking_extras:Table<{id:string;booking_id:string|null;title:string;amount:number;approved:boolean}>;
      reviews:Table<{id:string;booking_id:string|null;user_id:string|null;provider_id:string|null;rating:number;comment:string|null;is_hidden:boolean;created_at:string}>;
      messages:Table<{id:string;booking_id:string|null;sender_id:string|null;body:string|null;image_url:string|null;read_at:string|null;created_at:string}>;
      notifications:Table<{id:string;user_id:string;title:string;body:string|null;type:string;is_read:boolean;created_at:string}>;
      complaints:Table<{id:string;booking_id:string|null;raised_by:string|null;reason:string;status:string;admin_notes:string|null;created_at:string}>;
      search_logs:Table<{id:number;user_id:string|null;query:string|null;parsed:Json|null;results_count:number|null;used_ai:boolean;created_at:string}>;
      audit_logs:Table<{id:number;admin_id:string|null;action:string|null;target:string|null;created_at:string}>;
      settings:Table<{key:string;value:Json|null}>;
      provider_locations:Table<{booking_id:string;provider_id:string;lat:number;lng:number;heading:number|null;updated_at:string}>;
      push_subscriptions:Table<{id:string;user_id:string;endpoint:string;p256dh:string;auth:string;created_at:string}>;
    };
    Views: { public_provider_cards:{Row:ProviderCard;Relationships:[]}; public_provider_search:{Row:ProviderCard&{city:string|null;area_slugs:string[];area_names:string[];service_slugs:string[];minimum_price:number|null};Relationships:[]} };
    Functions: {}; Enums: {}; CompositeTypes: {};
  };
};
