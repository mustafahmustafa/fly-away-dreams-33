import { useEffect, useState } from "react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";
import { toast } from "sonner";
import { FormFieldInput } from "./FormField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Props {
  sectionKey: string;
  sectionLabel: string;
}

export default function SectionFormEditor({ sectionKey, sectionLabel }: Props) {
  const { data, isLoading } = useSiteConfig(sectionKey);
  const updateMutation = useUpdateSiteConfig();
  const [formData, setFormData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (data) setFormData(structuredClone(data) as Record<string, unknown>);
  }, [data]);

  if (isLoading || !formData) return <div className="text-foreground/50">Loading...</div>;

  const handleSave = () => {
    updateMutation.mutate(
      { sectionKey, configData: formData },
      {
        onSuccess: () => toast.success("Section updated!"),
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  const handleReset = () => {
    if (data) setFormData(structuredClone(data) as Record<string, unknown>);
  };

  const deepSet = (obj: Record<string, unknown>, keys: string[], value: unknown): Record<string, unknown> => {
    if (keys.length === 0) return obj;
    const [head, ...rest] = keys;
    const current = obj[head];
    if (rest.length === 0) {
      return { ...obj, [head]: value };
    }
    return { ...obj, [head]: deepSet((current as Record<string, unknown>) ?? {}, rest, value) };
  };

  const getNestedArray = (obj: Record<string, unknown>, path: string): unknown[] => {
    const keys = path.split(".");
    let result: unknown = obj;
    for (const k of keys) result = (result as Record<string, unknown>)?.[k];
    return Array.isArray(result) ? result : [];
  };

  const update = (path: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => deepSet(prev, path.split("."), value));
  };

  const updateArrayItem = (arrPath: string, index: number, field: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = [...getNestedArray(prev, arrPath)];
      const item = { ...(arr[index] as Record<string, unknown>), [field]: value };
      arr[index] = item;
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const addArrayItem = (arrPath: string, template: Record<string, unknown>) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = [...getNestedArray(prev, arrPath), template];
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const removeArrayItem = (arrPath: string, index: number) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = getNestedArray(prev, arrPath).filter((_, i) => i !== index);
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const updateStringArray = (arrPath: string, index: number, value: string) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = [...getNestedArray(prev, arrPath)];
      arr[index] = value;
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const addStringArrayItem = (arrPath: string) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = [...getNestedArray(prev, arrPath), ""];
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const removeStringArrayItem = (arrPath: string, index: number) => {
    setFormData((prev: Record<string, unknown>) => {
      const arr = getNestedArray(prev, arrPath).filter((_, i) => i !== index);
      return deepSet(prev, arrPath.split("."), arr);
    });
  };

  const renderForm = () => {
    switch (sectionKey) {
      case "hero":
        return <HeroForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "deals":
        return <DealsForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "features":
        return <FeaturesForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "how_it_works":
        return <HowItWorksForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "cta":
        return <CTAForm data={formData} update={update} />;
      case "trust_bar":
        return <TrustBarForm data={formData} updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />;
      case "navbar":
        return <NavbarForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "footer":
        return <FooterForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />;
      case "about":
        return <AboutForm data={formData} update={update} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case "hotels_page":
        return <HotelsPageForm data={formData} update={update} />;
      default:
        return <GenericJsonEditor data={formData} onChange={setFormData} />;
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-1">{sectionLabel}</h2>
      <p className="text-sm text-foreground/40 mb-6">Edit the content below and save your changes.</p>
      <div className="space-y-6">{renderForm()}</div>
      <div className="flex gap-3 mt-6 pt-4 border-t border-foreground/10">
        <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary text-foreground font-medium rounded-lg px-6 py-2.5 transition-colors hover:bg-sky-light disabled:opacity-50">
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
        <button onClick={handleReset} className="bg-foreground/5 text-foreground/60 font-medium rounded-lg px-6 py-2.5 transition-colors hover:bg-foreground/10">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---- Section-specific forms ---- */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function ArrayItemCard({ index, onRemove, children }: { index: number; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-lg p-4 space-y-3 relative group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground/30 flex items-center gap-1"><GripVertical className="w-3 h-3" /> Item {index + 1}</span>
        <button onClick={onRemove} className="text-destructive/60 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-primary hover:text-sky-light transition-colors font-medium">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

// ---- Hero ----
function HeroForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="Headlines">
        <FormFieldInput label="Badge Text" value={data.badge || ""} onChange={(v) => update("badge", v)} />
        <FormFieldInput label="Title Line 1" value={data.title_line1 || ""} onChange={(v) => update("title_line1", v)} />
        <FormFieldInput label="Title Line 2" value={data.title_line2 || ""} onChange={(v) => update("title_line2", v)} />
        <FormFieldInput label="Title Highlight" value={data.title_highlight || ""} onChange={(v) => update("title_highlight", v)} />
        <FormFieldInput label="Subtitle" value={data.subtitle || ""} onChange={(v) => update("subtitle", v)} multiline />
      </SectionCard>
      <SectionCard title="Stats">
        {data.stats?.map((s: any, i: number) => (
          <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("stats", i)}>
            <div className="grid grid-cols-2 gap-3">
              <FormFieldInput label="Number" value={s.num} onChange={(v) => updateArrayItem("stats", i, "num", v)} />
              <FormFieldInput label="Label" value={s.label} onChange={(v) => updateArrayItem("stats", i, "label", v)} />
            </div>
          </ArrayItemCard>
        ))}
        <AddButton label="Add stat" onClick={() => addArrayItem("stats", { num: "", label: "" })} />
      </SectionCard>
    </>
  );
}

// ---- Deals ----
function DealsForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="Section Text">
        <FormFieldInput label="Section Label" value={data.section_label || ""} onChange={(v) => update("section_label", v)} />
        <FormFieldInput label="Section Title" value={data.section_title || ""} onChange={(v) => update("section_title", v)} />
        <FormFieldInput label="View All Text" value={data.view_all_text || ""} onChange={(v) => update("view_all_text", v)} />
      </SectionCard>
      <SectionCard title="Deal Items">
        {data.items?.map((item: any, i: number) => (
          <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("items", i)}>
            <div className="grid grid-cols-2 gap-3">
              <FormFieldInput label="City" value={item.city} onChange={(v) => updateArrayItem("items", i, "city", v)} />
              <FormFieldInput label="Price" value={item.price} onChange={(v) => updateArrayItem("items", i, "price", v)} />
              <FormFieldInput label="Flight" value={item.flight} onChange={(v) => updateArrayItem("items", i, "flight", v)} />
              <FormFieldInput label="Nights" value={item.nights} onChange={(v) => updateArrayItem("items", i, "nights", v)} />
              <FormFieldInput label="Discount" value={item.discount} onChange={(v) => updateArrayItem("items", i, "discount", v)} />
              <FormFieldInput label="Gradient CSS" value={item.gradient} onChange={(v) => updateArrayItem("items", i, "gradient", v)} />
            </div>
          </ArrayItemCard>
        ))}
        <AddButton label="Add deal" onClick={() => addArrayItem("items", { city: "", price: "", flight: "", nights: "", discount: "", gradient: "" })} />
      </SectionCard>
    </>
  );
}

// ---- Features ----
function FeaturesForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="Section Text">
        <FormFieldInput label="Section Label" value={data.section_label || ""} onChange={(v) => update("section_label", v)} />
        <FormFieldInput label="Section Title" value={data.section_title || ""} onChange={(v) => update("section_title", v)} />
      </SectionCard>
      <SectionCard title="Feature Items">
        {data.items?.map((item: any, i: number) => (
          <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("items", i)}>
            <FormFieldInput label="Icon (emoji)" value={item.icon} onChange={(v) => updateArrayItem("items", i, "icon", v)} />
            <FormFieldInput label="Title" value={item.title} onChange={(v) => updateArrayItem("items", i, "title", v)} />
            <FormFieldInput label="Description" value={item.desc} onChange={(v) => updateArrayItem("items", i, "desc", v)} multiline />
          </ArrayItemCard>
        ))}
        <AddButton label="Add feature" onClick={() => addArrayItem("items", { icon: "✨", title: "", desc: "" })} />
      </SectionCard>
    </>
  );
}

// ---- How It Works ----
function HowItWorksForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="Section Text">
        <FormFieldInput label="Section Label" value={data.section_label || ""} onChange={(v) => update("section_label", v)} />
        <FormFieldInput label="Section Title" value={data.section_title || ""} onChange={(v) => update("section_title", v)} />
      </SectionCard>
      <SectionCard title="Steps">
        {data.items?.map((item: any, i: number) => (
          <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("items", i)}>
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <FormFieldInput label="Step #" value={String(item.num)} onChange={(v) => updateArrayItem("items", i, "num", parseInt(v) || 0)} />
              <FormFieldInput label="Title" value={item.title} onChange={(v) => updateArrayItem("items", i, "title", v)} />
            </div>
            <FormFieldInput label="Description" value={item.desc} onChange={(v) => updateArrayItem("items", i, "desc", v)} multiline />
          </ArrayItemCard>
        ))}
        <AddButton label="Add step" onClick={() => addArrayItem("items", { num: (data.items?.length || 0) + 1, title: "", desc: "" })} />
      </SectionCard>
    </>
  );
}

// ---- CTA ----
function CTAForm({ data, update }: any) {
  return (
    <SectionCard title="Newsletter CTA">
      <FormFieldInput label="Title Prefix" value={data.title_prefix || ""} onChange={(v) => update("title_prefix", v)} />
      <FormFieldInput label="Title Highlight" value={data.title_highlight || ""} onChange={(v) => update("title_highlight", v)} />
      <FormFieldInput label="Subtitle" value={data.subtitle || ""} onChange={(v) => update("subtitle", v)} multiline />
      <FormFieldInput label="Button Text" value={data.button_text || ""} onChange={(v) => update("button_text", v)} />
    </SectionCard>
  );
}

// ---- Trust Bar ----
function TrustBarForm({ data, updateStringArray, addStringArrayItem, removeStringArrayItem }: any) {
  return (
    <SectionCard title="Trust Bar Items">
      {data.items?.map((item: string, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={item} onChange={(e) => updateStringArray("items", i, e.target.value)} className="bg-foreground/5 border-foreground/10 text-foreground text-sm flex-1" />
          <button onClick={() => removeStringArrayItem("items", i)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <AddButton label="Add item" onClick={() => addStringArrayItem("items")} />
    </SectionCard>
  );
}

// ---- Navbar ----
function NavbarForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="General">
        <FormFieldInput label="CTA Button Text" value={data.cta_text || ""} onChange={(v) => update("cta_text", v)} />
      </SectionCard>
      <SectionCard title="Navigation Links">
        {data.links?.map((link: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <FormFieldInput label="Label" value={link.label} onChange={(v) => updateArrayItem("links", i, "label", v)} />
              <FormFieldInput label="Path" value={link.path} onChange={(v) => updateArrayItem("links", i, "path", v)} />
            </div>
            <button onClick={() => removeArrayItem("links", i)} className="text-destructive/60 hover:text-destructive mt-5"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <AddButton label="Add link" onClick={() => addArrayItem("links", { label: "", path: "/" })} />
      </SectionCard>
    </>
  );
}

// ---- Footer ----
function FooterForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem, updateStringArray, addStringArrayItem, removeStringArrayItem }: any) {
  return (
    <>
      <SectionCard title="Brand">
        <FormFieldInput label="Brand Description" value={data.brand_description || ""} onChange={(v) => update("brand_description", v)} multiline />
        <FormFieldInput label="Copyright" value={data.copyright || ""} onChange={(v) => update("copyright", v)} />
      </SectionCard>
      <SectionCard title="Company Links">
        {data.company_links?.map((link: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <FormFieldInput label="Label" value={link.label} onChange={(v) => updateArrayItem("company_links", i, "label", v)} />
              <FormFieldInput label="Path" value={link.path} onChange={(v) => updateArrayItem("company_links", i, "path", v)} />
            </div>
            <button onClick={() => removeArrayItem("company_links", i)} className="text-destructive/60 hover:text-destructive mt-5"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <AddButton label="Add link" onClick={() => addArrayItem("company_links", { label: "", path: "/" })} />
      </SectionCard>
      <StringArraySection title="Social Links" items={data.social_links} path="social_links" updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />
      <StringArraySection title="Travel Links" items={data.travel_links} path="travel_links" updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />
      <StringArraySection title="Support Links" items={data.support_links} path="support_links" updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />
      <StringArraySection title="Bottom Links" items={data.bottom_links} path="bottom_links" updateStringArray={updateStringArray} addStringArrayItem={addStringArrayItem} removeStringArrayItem={removeStringArrayItem} />
    </>
  );
}

function StringArraySection({ title, items, path, updateStringArray, addStringArrayItem, removeStringArrayItem }: any) {
  return (
    <SectionCard title={title}>
      {items?.map((item: string, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={item} onChange={(e) => updateStringArray(path, i, e.target.value)} className="bg-foreground/5 border-foreground/10 text-foreground text-sm flex-1" />
          <button onClick={() => removeStringArrayItem(path, i)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <AddButton label={`Add ${title.toLowerCase().replace(" links", " link")}`} onClick={() => addStringArrayItem(path)} />
    </SectionCard>
  );
}

// ---- About ----
function AboutForm({ data, update, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <>
      <SectionCard title="Hero">
        <FormFieldInput label="Title" value={data.hero?.title || ""} onChange={(v) => update("hero.title", v)} />
        <FormFieldInput label="Subtitle" value={data.hero?.subtitle || ""} onChange={(v) => update("hero.subtitle", v)} multiline />
      </SectionCard>
      {data.stats && (
        <SectionCard title="Stats">
          {data.stats.map((s: any, i: number) => (
            <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("stats", i)}>
              <div className="grid grid-cols-2 gap-3">
                <FormFieldInput label="Number" value={s.num || ""} onChange={(v) => updateArrayItem("stats", i, "num", v)} />
                <FormFieldInput label="Label" value={s.label || ""} onChange={(v) => updateArrayItem("stats", i, "label", v)} />
              </div>
            </ArrayItemCard>
          ))}
          <AddButton label="Add stat" onClick={() => addArrayItem("stats", { num: "", label: "" })} />
        </SectionCard>
      )}
      <SectionCard title="Story">
        <FormFieldInput label="Title" value={data.story?.title || ""} onChange={(v) => update("story.title", v)} />
        <FormFieldInput label="Paragraph 1" value={data.story?.p1 || ""} onChange={(v) => update("story.p1", v)} multiline />
        <FormFieldInput label="Paragraph 2" value={data.story?.p2 || ""} onChange={(v) => update("story.p2", v)} multiline />
      </SectionCard>
      {data.values && (
        <SectionCard title="Values">
          {data.values.map((v: any, i: number) => (
            <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("values", i)}>
              <FormFieldInput label="Icon" value={v.icon} onChange={(val) => updateArrayItem("values", i, "icon", val)} />
              <FormFieldInput label="Title" value={v.title} onChange={(val) => updateArrayItem("values", i, "title", val)} />
              <FormFieldInput label="Description" value={v.desc} onChange={(val) => updateArrayItem("values", i, "desc", val)} multiline />
            </ArrayItemCard>
          ))}
          <AddButton label="Add value" onClick={() => addArrayItem("values", { icon: "✨", title: "", desc: "" })} />
        </SectionCard>
      )}
      {data.team && (
        <SectionCard title="Team">
          {data.team.map((t: any, i: number) => (
            <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("team", i)}>
              <div className="grid grid-cols-2 gap-3">
                <FormFieldInput label="Name" value={t.name} onChange={(v) => updateArrayItem("team", i, "name", v)} />
                <FormFieldInput label="Role" value={t.role} onChange={(v) => updateArrayItem("team", i, "role", v)} />
              </div>
              <FormFieldInput label="Avatar (initials)" value={t.avatar} onChange={(v) => updateArrayItem("team", i, "avatar", v)} />
            </ArrayItemCard>
          ))}
          <AddButton label="Add team member" onClick={() => addArrayItem("team", { name: "", role: "", avatar: "" })} />
        </SectionCard>
      )}
      <SectionCard title="Contact">
        <FormFieldInput label="Title" value={data.contact?.title || ""} onChange={(v) => update("contact.title", v)} />
        <FormFieldInput label="Subtitle" value={data.contact?.subtitle || ""} onChange={(v) => update("contact.subtitle", v)} multiline />
      </SectionCard>
      {data.faq && (
        <SectionCard title="FAQ">
          {data.faq.map((f: any, i: number) => (
            <ArrayItemCard key={i} index={i} onRemove={() => removeArrayItem("faq", i)}>
              <FormFieldInput label="Question" value={f.q} onChange={(v) => updateArrayItem("faq", i, "q", v)} />
              <FormFieldInput label="Answer" value={f.a} onChange={(v) => updateArrayItem("faq", i, "a", v)} multiline />
            </ArrayItemCard>
          ))}
          <AddButton label="Add FAQ" onClick={() => addArrayItem("faq", { q: "", a: "" })} />
        </SectionCard>
      )}
      <SectionCard title="CTA Banner">
        <FormFieldInput label="Title" value={data.cta_banner?.title || ""} onChange={(v) => update("cta_banner.title", v)} />
        <FormFieldInput label="Subtitle" value={data.cta_banner?.subtitle || ""} onChange={(v) => update("cta_banner.subtitle", v)} multiline />
        <FormFieldInput label="Button Text" value={data.cta_banner?.button_text || ""} onChange={(v) => update("cta_banner.button_text", v)} />
      </SectionCard>
    </>
  );
}

// ---- Hotels Page ----
function HotelsPageForm({ data, update }: any) {
  return (
    <>
      <SectionCard title="Page Content">
        <FormFieldInput label="Page Title" value={data.page_title || ""} onChange={(v) => update("page_title", v)} />
        <FormFieldInput label="Page Subtitle" value={data.page_subtitle || ""} onChange={(v) => update("page_subtitle", v)} multiline />
        <FormFieldInput label="Search Placeholder" value={data.search_placeholder || ""} onChange={(v) => update("search_placeholder", v)} />
        <FormFieldInput label="Search Button Text" value={data.search_button_text || ""} onChange={(v) => update("search_button_text", v)} />
        <FormFieldInput label="Popular Title" value={data.popular_title || ""} onChange={(v) => update("popular_title", v)} />
        <FormFieldInput label="No Results Text" value={data.no_results_text || ""} onChange={(v) => update("no_results_text", v)} />
        <FormFieldInput label="Book Button Text" value={data.book_button_text || ""} onChange={(v) => update("book_button_text", v)} />
      </SectionCard>
    </>
  );
}

// ---- Generic fallback ----
function GenericJsonEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const [text, setText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState("");

  useEffect(() => { setText(JSON.stringify(data, null, 2)); }, [data]);

  return (
    <div className="space-y-2">
      {error && <div className="text-destructive text-sm">{error}</div>}
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setError(""); } catch { setError("Invalid JSON"); }
        }}
        className="bg-foreground/5 border-foreground/10 text-foreground font-mono text-sm min-h-[400px]"
      />
    </div>
  );
}
