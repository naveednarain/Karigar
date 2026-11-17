insert into services (slug,name_en,name_ur,icon,min_price,max_price,sort_order) values
('plumbing','Plumbing','پلمبر','wrench',700,5000,1),
('electrical','Electrical','الیکٹریشن','zap',600,6000,2),
('ac_service','AC Service','اے سی سروس','snowflake',1200,15000,3),
('painting','Painting','رنگ و روغن','paintbrush',1500,60000,4),
('carpentry','Carpentry','کارپینٹر','hammer',800,20000,5),
('cleaning','Cleaning','صفائی','sparkles',1500,12000,6),
('mason','Mason / Tiles','راج مستری','brick-wall',2000,50000,7),
('appliance_repair','Appliance Repair','ایپلائنس','washing-machine',1000,8000,8),
('solar','Solar','سولر','sun',2000,100000,9),
('cctv','CCTV & Internet','سی سی ٹی وی','camera',1500,40000,10),
('pest_control','Pest Control','کیڑے مار','bug',2500,10000,11)
on conflict (slug) do update set name_en=excluded.name_en,name_ur=excluded.name_ur,icon=excluded.icon,min_price=excluded.min_price,max_price=excluded.max_price,sort_order=excluded.sort_order,is_active=true;

insert into areas (slug,name_en,name_ur,city,lat,lng) values
('latifabad','Latifabad','لطیف آباد','Hyderabad',25.3792,68.3683),
('qasimabad','Qasimabad','قاسم آباد','Hyderabad',25.4194,68.3195),
('hirabad','Hirabad','حیرآباد','Hyderabad',25.3925,68.3578),
('saddar','Saddar','صدر','Hyderabad',25.3920,68.3730),
('autobhan','Autobhan','آٹوبھان','Hyderabad',25.3510,68.3400),
('gulistan_e_sajjad','Gulistan-e-Sajjad','گلستان سجاد','Hyderabad',25.4120,68.3500),
('heerabad','Heerabad','ہیرآباد','Hyderabad',25.3990,68.3640),
('cantt','Hyderabad Cantt','حیدرآباد کینٹ','Hyderabad',25.3680,68.3650),
('jamshoro','Jamshoro City','جامشورو','Jamshoro',25.4296,68.2800),
('sindh_university','Sindh University','سندھ یونیورسٹی','Jamshoro',25.4170,68.2620),
('muet','MUET Colony','مہران یونیورسٹی','Jamshoro',25.4100,68.2630),
('lumhs','LUMHS','لمحس','Jamshoro',25.4130,68.2700),
('kotri','Kotri','کوٹری','Kotri',25.3650,68.3080),
-- Extra hyperlocal zones (lat/lng left null: ranking falls back to same-area / same-city match;
-- fill them later using the map pin). Verify names with local residents before launch.
('qasimabad_phase2','Qasimabad Phase 2','قاسم آباد فیز 2','Hyderabad',null,null),
('naseem_nagar','Naseem Nagar','نسیم نگر','Hyderabad',null,null),
('citizen_colony','Citizen Colony','سٹیزن کالونی','Hyderabad',null,null),
('abdullah_sports_city','Abdullah Sports City','عبداللہ اسپورٹس سٹی','Hyderabad',null,null),
('dha_hyderabad','DHA Hyderabad','ڈی ایچ اے حیدرآباد','Hyderabad',null,null),
('tilak_incline','Tilak Incline','تلک انکلائن','Hyderabad',null,null),
('phuleli','Phuleli','پھلیلی','Hyderabad',null,null),
('kohsar','Kohsar','کوہسار','Hyderabad',null,null),
('gulshan_e_zia','Gulshan-e-Zia','گلشن ضیاء','Hyderabad',null,null),
('jamshoro_phase2','Jamshoro Phase 2','جامشورو فیز 2','Jamshoro',null,null),
('kotri_site','Kotri SITE','کوٹری سائٹ','Kotri',null,null),
('sikandarabad','Sikandarabad','سکندرآباد','Kotri',null,null)
on conflict (slug) do update set name_en=excluded.name_en,name_ur=excluded.name_ur,city=excluded.city,lat=excluded.lat,lng=excluded.lng,is_active=true;
