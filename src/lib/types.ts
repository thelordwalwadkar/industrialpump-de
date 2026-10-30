/** Shared content types. Story shape follows the Storyblok CDN API so local seeds and live data are interchangeable. */

export type SbLink = {
  linktype?: 'story' | 'url' | 'email' | 'asset';
  cached_url?: string;
  url?: string;
  id?: string;
  anchor?: string;
};
export type SbAsset = { filename?: string; alt?: string; title?: string; name?: string; width?: number; height?: number } | null | undefined;
export type RichTextDoc = { type: 'doc'; content?: unknown[] };

export interface Blok { _uid?: string; component: string }

/* ---------- nestable bloks ---------- */
export interface Hero extends Blok { component: 'hero'; headline: string; subline?: string; primary_label?: string; primary_link?: SbLink; secondary_label?: string; secondary_link?: SbLink; image?: SbAsset }
export interface RichTextBlok extends Blok { component: 'rich_text'; content?: RichTextDoc }
export interface Card extends Blok { component: 'card'; title: string; text?: string; link?: SbLink; meta?: string; image?: SbAsset }
export interface CardGrid extends Blok { component: 'card_grid'; heading?: string; intro?: string; cards?: Card[] }
export interface CtaBand extends Blok { component: 'cta_band'; heading: string; text?: string; button_label: string; button_link: SbLink; variant?: 'primary' | 'overhaul' }
export interface FaqItem extends Blok { component: 'faq_item'; question: string; answer: string }
export interface Faq extends Blok { component: 'faq'; heading?: string; items?: FaqItem[] }
export interface SpecRow extends Blok { component: 'spec_row'; group?: string; label: string; value: string; unit?: string; value_num?: number | string }
export interface SpecTable extends Blok { component: 'spec_table'; heading?: string; rows?: SpecRow[] }
export interface KeyFact extends Blok { component: 'key_fact'; label: string; value: string; unit?: string }
export interface DownloadItem extends Blok { component: 'download_item'; label: string; file?: SbAsset; kind?: 'datenblatt' | 'kennlinie' | 'handbuch' | 'sonstiges' }
export interface DownloadList extends Blok { component: 'download_list'; heading?: string; items?: DownloadItem[] }
export interface Step extends Blok { component: 'step'; title: string; text?: string }
export interface Steps extends Blok { component: 'steps'; heading?: string; items?: Step[] }
export interface LogoStrip extends Blok { component: 'logo_strip'; heading?: string }
export interface LinkItem extends Blok { component: 'link_item'; label: string; link: SbLink; description?: string }
export interface RelatedLinks extends Blok { component: 'related_links'; heading?: string; links?: LinkItem[] }
export interface ImageText extends Blok { component: 'image_text'; image?: SbAsset; text?: RichTextDoc; side?: 'left' | 'right' }
export interface ImageBlock extends Blok { component: 'image_block'; image?: SbAsset; caption?: string }
export interface DataTable extends Blok { component: 'data_table'; heading?: string; table?: { thead?: { value?: string }[]; tbody?: { body?: { value?: string }[] }[] } }
export interface ButtonRow extends Blok { component: 'button_row'; buttons?: LinkItem[] }
export interface NavItem extends Blok { component: 'nav_item'; label: string; link: SbLink }
export interface NavGroup extends Blok { component: 'nav_group'; label: string; items?: NavItem[] }

/** Optional, editor-added bloks allowed in the `body` slot of every page type. */
export type BodyBlok = RichTextBlok | CardGrid | CtaBand | Faq | SpecTable | DownloadList | Steps | RelatedLinks | ImageText | ImageBlock | DataTable | ButtonRow;

/* ---------- content types ---------- */
export interface PageBase extends Blok {
  seo_title?: string;
  seo_description?: string;
  h1?: string;
  intro?: string;
  nav_title?: string;
  noindex?: boolean;
  body?: BodyBlok[];
  cta?: CtaBand[];
}
export interface PageHome extends PageBase { component: 'page_home'; service_type?: string; hero?: Hero[]; tiles?: CardGrid[]; revision?: CtaBand[]; brands?: LogoStrip[]; references?: CtaBand[]; school?: CtaBand[]; contact?: CtaBand[] }
export interface PageHub extends PageBase { component: 'page_hub'; service_type?: string; body_text?: RichTextDoc; child_heading?: string }
export interface PageTopic extends PageBase { component: 'page_topic'; service_type?: string; topic_kind?: 'branche' | 'anwendung' | 'pumpentyp'; tag?: string; challenges?: RichTextDoc; related?: RelatedLinks[]; technical_notes?: RichTextDoc; faq?: Faq[] }
export interface PageBrand extends PageBase { component: 'page_brand'; brand_name: string; manufacturer_url?: string; same_as?: string; parent_company?: string; parent_company_url?: string; logo?: SbAsset; body_text?: RichTextDoc; revision_text?: string; faq?: Faq[] }
export interface PageSeries extends PageBase {
  component: 'page_series'; series_name: string; pump_type?: string; segments?: string[]; applications?: string[]; use_case_line?: string; body_text?: RichTextDoc;
  highlights?: string; image?: SbAsset; image_source?: string; flow_max_m3h?: number | string; head_max_m?: number | string; power_min_kw?: number | string; power_max_kw?: number | string; temp_max_c?: number | string;
  materials?: string; catalogue_count?: number | string; downloads?: DownloadList[]; faq?: Faq[];
}
export interface PageProduct extends PageBase {
  component: 'page_product'; article_number: string; name: string; short_description?: string; image?: SbAsset; image_source?: string; gallery?: SbAsset[];
  key_facts?: KeyFact[]; specs?: SpecRow[]; flow_max_m3h?: number | string; head_max_m?: number | string; power_kw?: number | string; voltage?: string; material?: string;
  downloads?: DownloadList[]; gtin?: string; price?: number | string; availability?: string; internal_item_number?: string; highlights?: string;
}
export interface PageService extends PageBase { component: 'page_service'; service_kind?: 'revision' | 'revision-typ' | 'wartung' | 'inspektion' | 'leistung'; service_type?: string; steps?: Steps[]; included?: RichTextDoc; covered?: RelatedLinks[]; faq?: Faq[] }
export interface PageCourse extends PageBase { component: 'page_course'; goals?: RichTextDoc; audience?: string; duration?: string; mode?: 'onsite' | 'online' | 'blended'; level?: string; dates?: string }
export interface PageKnowledge extends PageBase { component: 'page_knowledge'; publication_date?: string; article?: RichTextDoc; author?: string; downloads?: DownloadList[]; related?: RelatedLinks[]; tech?: boolean }
export interface PageBlogPost extends PageBase { component: 'page_blog_post'; publication_date?: string; article?: RichTextDoc; author?: string; image?: SbAsset; related?: RelatedLinks[] }
export interface PageCaseStudy extends PageBase { component: 'page_case_study'; publication_date?: string; customer?: string; situation?: RichTextDoc; solution?: RichTextDoc; result?: RichTextDoc; products?: RelatedLinks[] }
export interface PageListing extends PageBase { component: 'page_listing'; listing_kind?: 'blog' | 'referenzen'; per_page?: number | string }
export interface PageContact extends PageBase { component: 'page_contact'; form_kind: 'kontakt' | 'angebot' | 'rueckruf'; default_anliegen?: string; form_intro?: string }
export interface PageJob extends PageBase { component: 'page_job'; job_title?: string; employment_type?: string; date_posted?: string; valid_through?: string; location_note?: string }
export interface PageAbout extends PageBase { component: 'page_about' }
export interface PageFaq extends PageBase { component: 'page_faq' }
export interface PageLegal extends PageBase { component: 'page_legal'; legal_kind?: 'impressum' | 'datenschutz' | 'agb'; text?: RichTextDoc; review_note?: string }
export interface ConfigContent extends Blok {
  component: 'config'; site_name: string; legal_name?: string; legal_form?: string; street?: string; postal_code?: string; city?: string; country_code?: string;
  phone?: string; email?: string; opening_hours?: string; vat_id?: string; register_number?: string; postal_address?: string; footer_about?: string; footer_usps?: string; logo?: SbAsset; social?: string; map_embed_url?: string;
  authorised_dealer_brands?: string; header_nav?: NavItem[]; footer_groups?: NavGroup[]; default_description?: string;
}

export type PageContent =
  | PageHome | PageHub | PageTopic | PageBrand | PageSeries | PageProduct | PageService | PageCourse
  | PageKnowledge | PageBlogPost | PageCaseStudy | PageListing | PageContact | PageLegal | PageJob | PageAbout | PageFaq;
export type PageComponent = PageContent['component'];

export interface Story<C extends Blok = PageContent | ConfigContent> {
  id: number | string;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  parent_id?: number | null;
  is_startpage?: boolean;
  position?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  first_published_at?: string | null;
  content: C;
}
export type PageStory<C extends PageContent = PageContent> = Story<C>;

export interface CrumbItem { name: string; path: string }
export interface SeoMeta { title: string; description: string; canonical: string; noindex: boolean; ogType: string }
