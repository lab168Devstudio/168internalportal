import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Settings,
  Wrench,
  Users,
  LayoutGrid,
  GitBranch,
  Phone,
  Mail,
  Hash,
  CalendarDays,
  Tags as TagsIcon,
  FolderKanban,
  UserCircle2,
  Info,
  X
} from "lucide-react";
import orgChartData from "./data/orgChart.json";
import projectsData from "./data/projects.json";
import toolsData from "./data/tools.json";
import newsData from "./data/news.json";
import updatesData from "./data/updates.json";
import blogData from "./data/blog.json";
import packageJson from "../package.json";

// ------------------------------------------------------------------

// Data - Tools (JSON managed)

// ------------------------------------------------------------------


interface Tool {
  toolName: string;
  toolVersion: string;
  tags: string[];
  toolTagline: string;
  description: string;
  openLabel?: string;
  open: string;
  docsLabel?: string;
  docs: string;
}

const TOOLS: Tool[] = toolsData as Tool[];
interface UpdateEntry {
  articleId?: string;
  version: string;
  date: string;
  summary: string;
  highlights: string[];
}

const UPDATES: UpdateEntry[] = updatesData as UpdateEntry[];

interface BlogSection {
  heading?: string;
  body: string[];
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  tagline: string;
  sections: BlogSection[];
}

const BLOG_POSTS: BlogPost[] = blogData as BlogPost[];
const BLOG_LOOKUP: Record<string, BlogPost> = BLOG_POSTS.reduce(
  (acc, post) => {
    acc[post.id] = post;
    return acc;
  },
  {} as Record<string, BlogPost>
);

interface NewsPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  summary: string;
  body: string;
  links: Array<{ label: string; url: string }>;
}

const NEWS: NewsPost[] = newsData as NewsPost[];

const APP_VERSION = packageJson.version;

const PORTAL_GUIDE_STEPS = [
  {
    title: "Choose a workspace view",
    description: "Use the top navigation to jump between Tools, Internal Projects, News, Updates, and the Org Chart.",
  },
  {
    title: "Search and filter",
    description: "Filter tools instantly with the global search so results update as you type and match names, tags, and descriptions.",
  },
  {
    title: "Drill into details",
    description: "Select a tool or project card to open its side panel for documentation links, highlights, and delivery context.",
  },
  {
    title: "Share context quickly",
    description: "Copy deep links (like this guide) or use the What's New notes to broadcast the latest changes to the team.",
  },
];

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}



// ------------------------------------------------------------------

// Data - Org Chart (JSON managed)

// ------------------------------------------------------------------

interface OrgMember {

  id: string;

  name: string;

  jobTitle: string;

  businessUnit: string;

  phone: string;

  email: string;

  employeeId: string;

  tags: string[];

  startDate: string;

  summary: string;

  directReports: number;

  manager: string | null;

  projects: string[];

}

interface BusinessUnit {

  id: string;

  name: string;

  employees: OrgMember[];

}

interface OrgChartData {

  businessUnits: BusinessUnit[];

}

interface OrgTreeNode {
  member: OrgMember;
  children: OrgTreeNode[];
}

const ORG_DATA: OrgChartData = orgChartData;

interface InternalProject {
  projectName: string;
  projectId: string;
  startDate: string;
  dueDate: string;
  projectManager: string;
  revenueImpacting: boolean;
  cost: number;
  projectSummary: string;
  assignedBusinessUnits: string[];
  learnMoreLabel?: string;
  learnMore: string;
  lastUpdatedNote?: string;
  detailSummary?: string;
  detailHighlights?: string[];
}

const INTERNAL_PROJECTS: InternalProject[] = projectsData;


type View = "tools" | "projects" | "news" | "updates" | "org";
type OrgViewMode = "cards" | "tree";

const STATUS_COLORS: Record<string, string> = {

  Stable: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",

  Beta: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",

  Pilot: "bg-blue-500/20 text-blue-300 border-blue-500/30",

  Alpha: "bg-red-500/20 text-red-300 border-red-500/30",

};

function Tag({ t }: { t: string }) {

  return (

    <span className="px-2 py-0.5 rounded-full text-xs border border-white/10 bg-white/5">

      {t}

    </span>

  );

}


function ToolCard({ tool, onInfo }: { tool: Tool; onInfo: () => void }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-2xl border border-red-500/15 bg-gradient-to-br from-[#1a050c]/80 via-[#0a0208]/85 to-[#050108]/90 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-red-500/40 hover:shadow-[0_20px_45px_-25px_rgba(248,113,113,0.6)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),transparent_60%)] opacity-90 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight text-white">{tool.toolName}</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                <Hash className="h-3 w-3 text-white/50" />
                {tool.toolVersion}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/70 leading-relaxed">{tool.toolTagline}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tool.tags.map(tag => (
            <Tag key={tag} t={tag} />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={tool.open}
            target="_blank"
            rel="noreferrer"
            className="group/btn inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Open
            <ChevronRight className="h-4 w-4 transition -mr-1 group-hover/btn:translate-x-0.5" />
          </a>
          <button
            type="button"
            onClick={onInfo}
            className="group/btn-info inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
            aria-label={`More information about ${tool.toolName}`}
          >
            Info
            <Info className="h-4 w-4 text-white/60 transition group-hover/btn-info:text-white/80" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ------------------------------------------------------------------

// Org Chart Components
// ------------------------------------------------------------------
const normalizeKey = (value: string) => value.trim().toLowerCase();

function buildOrgTree(members: OrgMember[]): OrgTreeNode[] {
  if (members.length === 0) {
    return [];
  }

  const nodes = new Map<string, OrgTreeNode>();
  const byName = new Map<string, OrgTreeNode>();
  const byEmployeeId = new Map<string, OrgTreeNode>();

  members.forEach(member => {
    const node: OrgTreeNode = { member, children: [] };
    nodes.set(member.id, node);
    if (member.name) {
      byName.set(normalizeKey(member.name), node);
    }
    if (member.employeeId) {
      byEmployeeId.set(normalizeKey(member.employeeId), node);
    }
  });

  const roots: OrgTreeNode[] = [];

  members.forEach(member => {
    const node = nodes.get(member.id);
    if (!node) {
      return;
    }
    const managerValue = member.manager?.toString().trim();
    if (managerValue) {
      const managerKey = normalizeKey(managerValue);
      const managerNode = byEmployeeId.get(managerKey) ?? byName.get(managerKey);
      if (managerNode && managerNode !== node) {
        managerNode.children.push(node);
        return;
      }
    }
    roots.push(node);
  });

  const sortNodes = (list: OrgTreeNode[]) => {
    list.sort((a, b) => a.member.name.localeCompare(b.member.name));
    list.forEach(child => {
      if (child.children.length > 0) {
        sortNodes(child.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
}

function OrgMemberCard({ member }: { member: OrgMember }) {
  const [expanded, setExpanded] = useState(false);

  const startDateLabel = useMemo(() => {
    try {
      return new Date(member.startDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return member.startDate;
    }
  }, [member.startDate]);

  const managerLabel =
    typeof member.manager === "string" && member.manager.trim().length > 0 ? member.manager : "None";
  const tagsLabel = member.tags.join(", ");

  return (
    <motion.div
      layout
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold tracking-tight text-white">{member.name}</h4>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
              <Hash className="h-3 w-3 text-white/50" />
              {member.employeeId}
            </span>
          </div>
          <p className="text-sm text-white/70">{member.jobTitle}</p>
          <p className="text-xs text-white/50">Business Unit: {member.businessUnit}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
          aria-expanded={expanded}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-white/50" />
          <a href={`tel:${member.phone}`} className="hover:text-white">
            {member.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-white/50" />
          <a href={`mailto:${member.email}`} className="truncate hover:text-white">
            {member.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-white/50" />
          <span>Since {startDateLabel}</span>
        </div>
        {member.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <TagsIcon className="h-4 w-4 text-white/50" />
            <span className="truncate">{tagsLabel}</span>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-3 border-t border-white/10 pt-3 text-sm text-white/80"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Employee Responsibility Summary</div>
              <p className="mt-1 leading-relaxed text-white/80">{member.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-white/50">Direct Reports</div>
                <div className="mt-1 flex items-center gap-2 text-white">
                  <Users className="h-4 w-4 text-white/50" />
                  {member.directReports}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-white/50">Hiring Manager</div>
                <div className="mt-1 flex items-center gap-2 text-white">
                  <UserCircle2 className="h-4 w-4 text-white/50" />
                  {managerLabel}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-white/50">Employee ID</div>
                <div className="mt-1 flex items-center gap-2 text-white">
                  <Hash className="h-4 w-4 text-white/50" />
                  {member.employeeId}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Assigned Projects</div>
              {member.projects.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {member.projects.map(project => (
                    <span
                      key={project}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80"
                    >
                      <FolderKanban className="h-3 w-3 text-white/50" />
                      {project}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-white/60">No active projects assigned.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrgUnitSection({ unit }: { unit: BusinessUnit }) {
  return (
    <motion.section
      layout
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {unit.name} ({unit.employees.length})
        </h3>
      </div>
      {unit.employees.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {unit.employees.map(member => (
            <OrgMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-white/50">
          No active members assigned.
        </div>
      )}
    </motion.section>
  );
}

function OrgTreeNodeCard({ node, depth }: { node: OrgTreeNode; depth: number }) {
  const containerClasses =
    depth === 0 ? "space-y-3" : "space-y-3 border-l border-dashed border-white/15 pl-5 ml-3";
  const managerLabel =
    typeof node.member.manager === "string" && node.member.manager.trim().length > 0
      ? node.member.manager
      : "None";
  const hasChildren = node.children.length > 0;

  return (
    <div className={containerClasses}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold tracking-tight text-white">{node.member.name}</h4>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
            <Hash className="h-3 w-3 text-white/50" />
            {node.member.employeeId}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/60">{node.member.jobTitle}</p>
        <p className="mt-2 text-sm text-white/80">{node.member.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-white/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            <Users className="h-3 w-3 text-white/50" />
            Reports: {node.member.directReports}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            <UserCircle2 className="h-3 w-3 text-white/50" />
            Manager: {managerLabel}
          </span>
        </div>
      </div>
      {hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children.map(child => (
            <OrgTreeNodeCard key={child.member.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgTreeUnit({ unit }: { unit: BusinessUnit }) {
  const hierarchy = useMemo(() => buildOrgTree(unit.employees), [unit.employees]);

  return (
    <motion.section
      layout
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-white">{unit.name}</h3>
        <span className="text-xs uppercase tracking-wide text-white/60">{unit.employees.length} members</span>
      </div>
      {unit.employees.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-white/50">
          No active members assigned.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {hierarchy.length === 0 ? (
            <p className="text-sm text-white/60">Structure pending. Members will appear here once managers are set.</p>
          ) : (
            hierarchy.map(node => <OrgTreeNodeCard key={node.member.id} node={node} depth={0} />)
          )}
        </div>
      )}
    </motion.section>
  );
}

function OrgTreeView({ units }: { units: BusinessUnit[] }) {
  return (
    <div className="space-y-6">
      {units.map(unit => (
        <OrgTreeUnit key={unit.id} unit={unit} />
      ))}
    </div>
  );
}

function OrgChart({ data, mode }: { data: OrgChartData; mode: OrgViewMode }) {
  if (mode === "tree") {
    return <OrgTreeView units={data.businessUnits} />;
  }

  return (
    <div className="space-y-6">
      {data.businessUnits.map(unit => (
        <OrgUnitSection key={unit.id} unit={unit} />
      ))}
    </div>
  );
}


const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);

function NewsPage({ posts }: { posts: NewsPost[] }) {
  return (
    <section className="mt-6 space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Lab168 News</h2>
        <p className="text-sm text-white/70">Short notes from across the organization—launches, team updates, and experiments.</p>
      </div>
      <div className="space-y-4">
        {posts.map(post => (
          <motion.article
            key={post.slug}
            layout
            className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-[#17040f]/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.12),transparent_70%)] opacity-90" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{post.title}</h3>
                  <p className="text-xs uppercase tracking-wide text-white/50">{post.date} · {post.author}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{post.summary}</p>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">{post.body}</p>
              {post.links.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  {post.links.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
function UpdatesPage({
  updates,
  articles,
  onReadMore,
}: {
  updates: UpdateEntry[];
  articles: Record<string, BlogPost>;
  onReadMore: (post: BlogPost) => void;
}) {
  return (
    <section className="mt-6 space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">What's New</h2>
        <p className="text-sm text-white/70">Release notes and operational updates for the internal portal.</p>
      </div>
      <div className="space-y-4">
        {updates.map(note => {
          const linkedArticle = note.articleId ? articles[note.articleId] : null;
          return (
            <motion.article
              key={note.version}
              layout
              className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-[#1a0410]/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur"
              initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.15),transparent_70%)] opacity-90" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-red-300" />
                  <h3 className="text-lg font-semibold tracking-tight">{note.version}</h3>
                </div>
                <div className="text-xs uppercase tracking-wide text-white/50">{note.date}</div>
              </div>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{note.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {note.highlights.map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <TagsIcon className="h-4 w-4 text-white/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {linkedArticle && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                  <span>Deeper dive available: {linkedArticle.title}</span>
                  <button
                    type="button"
                    onClick={() => onReadMore(linkedArticle)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white/80 transition hover:bg-white/10"
                  >
                    Read article
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.article>
          );
        })}
      </div>
    </section>
  );
}
function ProjectsPage({
  projects,
  onSelect
}: {
  projects: InternalProject[];
  onSelect: (project: InternalProject) => void;
}) {
  return (
    <section className="mt-6 space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Internal Projects</h2>
        <p className="text-sm text-white/70">
          Active cross-unit initiatives with owners, key dates, and quick access to supporting documentation.
        </p>
      </div>
      <div className="space-y-4">
        {projects.map(project => (
          <motion.article
            key={project.projectId}
            layout
            className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-[#12030b]/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.14),transparent_70%)] opacity-90" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">Project</div>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">{project.projectName}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-white/70 leading-relaxed">{project.projectSummary}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-white/60">
                    <Hash className="h-3 w-3 text-white/50" />
                    {project.projectId}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/80 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-wide text-white/50">Timeline</div>
                  <div className="mt-1 flex flex-col gap-1">
                    <span>Start: {project.startDate}</span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-wide text-white/50">Ownership</div>
                  <div className="mt-1 flex flex-col gap-1">
                    <span>Project Manager: {project.projectManager}</span>
                    <span>Revenue Impacting: {project.revenueImpacting ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-wide text-white/50">Budget</div>
                  <div className="mt-1 flex flex-col gap-1">
                    <span>Cost: {formatCurrency(project.cost)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-[11px] uppercase tracking-wide text-white/50">Assigned Business Units</div>
                <div className="flex flex-wrap gap-2">
                  {project.assignedBusinessUnits.map(unit => (
                    <span
                      key={unit}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      <Users className="h-3 w-3 text-white/50" />
                      {unit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(project)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10"
                >
                  {project.learnMoreLabel ?? "Learn More"}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="text-xs text-white/60">
                  Last updated: {project.lastUpdatedNote ?? "FY26 program tracking"}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// App

// ------------------------------------------------------------------

export default function App() {

  const [view, setView] = useState<View>("tools");

  const [query, setQuery] = useState("");

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const [selectedProject, setSelectedProject] = useState<InternalProject | null>(null);

  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  const [isPortalGuideOpen, setPortalGuideOpen] = useState(false);

  const [orgViewMode, setOrgViewMode] = useState<OrgViewMode>("cards");

  const latestUpdate = useMemo(() => {
    if (UPDATES.length === 0) {
      return null;
    }
    return [...UPDATES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, []);

  const whatsNewVersionLabel = latestUpdate?.version ?? `Internal Portal v${APP_VERSION}`;



  useEffect(() => {

    const onMove = (e: MouseEvent) => {

      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);

    };

    window.addEventListener("mousemove", onMove);

    return () => window.removeEventListener("mousemove", onMove);

  }, []);

  useEffect(() => {
    if (!selectedTool && !selectedProject && !selectedArticle && !isPortalGuideOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedTool) {
          setSelectedTool(null);
        }
        if (selectedProject) {
          setSelectedProject(null);
        }
        if (selectedArticle) {
          setSelectedArticle(null);
        }
        if (isPortalGuideOpen) {
          setPortalGuideOpen(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTool, selectedProject, selectedArticle, isPortalGuideOpen]);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#docs/portal") {
        setPortalGuideOpen(true);
      } else {
        setPortalGuideOpen(false);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (isPortalGuideOpen) {
      if (window.location.hash !== "#docs/portal") {
        window.location.hash = "docs/portal";
      }
    } else if (window.location.hash === "#docs/portal") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [isPortalGuideOpen]);


const visibleTools = useMemo(() => {
  const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
  const baseList = [...TOOLS];

  if (tokens.length === 0) {
    return baseList.sort((a, b) => a.toolName.localeCompare(b.toolName));
  }

  const filtered = baseList.filter(tool => {
    const searchable = normalizeForSearch(
      [
        tool.toolName,
        tool.toolTagline,
        tool.toolVersion,
        ...(tool.tags ?? []),
        tool.description,
        tool.open,
        tool.docs,
      ]
        .filter(Boolean)
        .join(" ")
    );

    return tokens.every(token => searchable.includes(token));
  });

  return filtered.sort((a, b) => a.toolName.localeCompare(b.toolName));
}, [query]);
const trimmedQuery = query.trim();
const hasQuery = trimmedQuery.length > 0;



  const navItems: Array<{ key: View; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
    { key: "tools", label: "Tools", icon: Wrench },
    { key: "projects", label: "Internal Projects", icon: FolderKanban },
    { key: "news", label: "News", icon: TagsIcon },
    { key: "updates", label: "Updates", icon: Sparkles },
    { key: "org", label: "Org Chart", icon: Users },
  ];
  const orgViewOptions: Array<{ key: OrgViewMode; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> =
    [
      { key: "cards", label: "Card View", icon: LayoutGrid },
      { key: "tree", label: "Tree View", icon: GitBranch },
    ];

  const renderActiveView = () => {
    switch (view) {
      case "tools":
        return (
          <>
            {/* Search / toolbar */}
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-white/40 focus:bg-white/7 focus:ring-1 focus:ring-red-500/40"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              </div>
            </div>

            {/* Tools grid */}
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Available Tools</h2>
              <div className="text-xs text-white/50">
                {visibleTools.length} result{visibleTools.length !== 1 ? "s" : ""}
              </div>
            </div>

            {visibleTools.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
                {hasQuery ? (
                  <>
                    <p>No tools match "{trimmedQuery}".</p>
                    <p className="mt-2">Try a different keyword or tag.</p>
                  </>
                ) : (
                  <p>Tools will appear here once they are published.</p>
                )}
              </div>
            ) : (
              <motion.div layout className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTools.map(tool => (
                  <ToolCard
                    key={`${tool.toolName}-${tool.toolVersion}`}
                    tool={tool}
                    onInfo={() => setSelectedTool(tool)}
                  />
                ))}
              </motion.div>
            )}
          </>
        );
      case "projects":
        return <ProjectsPage projects={INTERNAL_PROJECTS} onSelect={project => setSelectedProject(project)} />;
      case "news":
        return <NewsPage posts={NEWS} />;
      case "updates":
        return <UpdatesPage updates={UPDATES} articles={BLOG_LOOKUP} onReadMore={post => setSelectedArticle(post)} />;
      case "org":
        return (
          <section className="mt-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">Organization Chart</h2>
                <p className="text-sm text-white/70">
                  Expand teams to see ownership, responsibilities, and quick contact details for the Lab168 crew.
                </p>
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs"
                role="group"
                aria-label="Org chart view mode"
              >
                {orgViewOptions.map(option => {
                  const active = orgViewMode === option.key;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setOrgViewMode(option.key)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                        active
                          ? "bg-red-500/30 text-white shadow-[0_0_0_1px_rgba(248,113,113,0.4)]"
                          : "text-white/70 hover:text-white"
                      }`}
                      aria-pressed={active}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <OrgChart data={ORG_DATA} mode={orgViewMode} />
          </section>
        );
      default:
        return null;
    }
  };

  const activeView = renderActiveView();

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#050208] text-white" id="top">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_rgba(248,113,113,0.2),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(135deg,_#0b0206,_#010104_55%,_#0d0311)] opacity-90" />

      <header className="sticky top-0 z-40 border-b border-red-500/20 bg-[#0b0206]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

          <div className="flex items-center gap-2">

            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-600/20 border border-red-500/30">

              <Settings className="h-5 w-5 text-red-400" />

            </div>

            <div>

              <div className="text-xs uppercase tracking-widest text-white/50">Lab168 Internal</div>

              <div className="text-sm font-semibold">Lab168 - Internal Portal</div>

            </div>

          </div>

          <nav className="flex items-center gap-3">

            {navItems.map((item) => {

              const active = view === item.key;

              const Icon = item.icon;

              return (

                <button

                  key={item.key}

                  type="button"

                  onClick={() => setView(item.key)}

                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${

                    active

                      ? "border-red-500/40 bg-red-500/20 text-white shadow-[0_0_0_1px_rgba(255,0,0,0.25)]"

                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"

                  }`}

                  aria-pressed={active}

                >

                  <Icon className="h-4 w-4" /> {item.label}

                </button>

              );

            })}

          </nav>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-4">
        {activeView && (
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {activeView}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedTool && (
            <motion.div
              key="tool-info-modal"
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedTool(null)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#16040d]/95 p-6 shadow-xl"
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white">{selectedTool.toolName}</h3>
                    <p className="mt-1 text-sm text-white/70">{selectedTool.toolTagline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTool(null)}
                    className="rounded-lg border border-transparent p-1 text-white/60 transition hover:border-white/20 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                  <Hash className="h-3 w-3 text-white/50" />
                  v{selectedTool.toolVersion}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTool.tags.map(tag => (
                    <Tag key={tag} t={tag} />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">{selectedTool.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={selectedTool.open}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-sm text-white/80 transition hover:bg-red-500/20"
                  >
                    {selectedTool.openLabel ?? "Open Tool"}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href={selectedTool.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
                  >
                    {selectedTool.docsLabel ?? "Documentation"}
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
          {selectedProject && (
            <motion.div
              key="project-info-modal"
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedProject(null)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-2xl rounded-2xl border border-red-500/20 bg-[#16040d]/95 p-6 shadow-xl"
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white">{selectedProject.projectName}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/60">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                        <Hash className="h-3 w-3 text-white/50" />
                        {selectedProject.projectId}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                        <CalendarDays className="h-3 w-3 text-white/50" />
                        {selectedProject.startDate} to {selectedProject.dueDate}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="rounded-lg border border-transparent p-1 text-white/60 transition hover:border-white/20 hover:text-white"
                    aria-label="Close project details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 text-sm leading-relaxed text-white/70">
                  {selectedProject.detailSummary ?? selectedProject.projectSummary}
                </div>
                <div className="mt-5 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">Project Manager</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-white/80">
                      <UserCircle2 className="h-4 w-4 text-white/50" />
                      <span>{selectedProject.projectManager}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">Investment</div>
                    <div className="mt-1 flex flex-col gap-1">
                      <span>Cost: {formatCurrency(selectedProject.cost)}</span>
                      <span>Revenue Impacting: {selectedProject.revenueImpacting ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
                {selectedProject.detailHighlights && selectedProject.detailHighlights.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">Key Highlights</div>
                    <ul className="mt-2 space-y-2 text-sm text-white/80">
                      {selectedProject.detailHighlights.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <ChevronRight className="mt-0.5 h-4 w-4 text-white/50" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedProject.assignedBusinessUnits.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">Assigned Business Units</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProject.assignedBusinessUnits.map(unit => (
                        <span
                          key={unit}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                        >
                          <Users className="h-3 w-3 text-white/50" />
                          {unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {selectedProject.learnMore && (
                    <a
                      href={selectedProject.learnMore}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-sm text-white/80 transition hover:bg-red-500/20"
                    >
                      {selectedProject.learnMoreLabel ?? "Open Project Docs"}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  )}
                  {selectedProject.lastUpdatedNote && (
                    <div className="text-xs text-white/60">Last updated: {selectedProject.lastUpdatedNote}</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          {selectedArticle && (
            <motion.div
              key="article-modal"
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedArticle(null)}
              />
              <motion.article
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-3xl rounded-2xl border border-red-500/20 bg-[#14030d]/95 p-6 shadow-2xl"
                initial={{ scale: 0.97, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 10 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Release Article</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">{selectedArticle.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      {selectedArticle.date} • {selectedArticle.author}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:text-white"
                    aria-label="Close article"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{selectedArticle.tagline}</p>
                <div className="mt-5 space-y-5">
                  {selectedArticle.sections.map((section, sectionIndex) => (
                    <section
                      key={`${section.heading ?? "section"}-${sectionIndex}`}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      {section.heading && (
                        <h4 className="text-base font-semibold text-white">{section.heading}</h4>
                      )}
                      <div className="mt-2 space-y-3">
                        {section.body.map((paragraph, paragraphIndex) => (
                          <p
                            key={`paragraph-${sectionIndex}-${paragraphIndex}`}
                            className="text-sm leading-relaxed text-white/80"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}

        <div className="mt-10 space-y-2 border-t border-white/10 py-6 text-center text-xs text-white/50">
          <div>
            Proprietary technology developed by <span className="text-white">LAB168 Digital Solutions</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/60">
            <a href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="hover:text-white">
              Terms of Service
            </a>
          </div>
          <div className="text-white/40">Version {APP_VERSION}</div>
        </div>

      </div>

      <button
        type="button"
        onClick={() => setPortalGuideOpen(true)}
        className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-4 py-2 text-xs text-white/80 backdrop-blur transition hover:bg-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        title="Portal docs"
        aria-haspopup="dialog"
        aria-expanded={isPortalGuideOpen}
      >
        <Wrench className="h-4 w-4" />
        Portal Guide
      </button>

      <AnimatePresence>
        {isPortalGuideOpen && (
          <motion.div
            key="portal-guide"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPortalGuideOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b0206] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Internal Portal Guide"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Portal Support</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Internal Portal Guide</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Quick onboarding notes plus the latest release context for teammates dropping in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPortalGuideOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close portal guide</span>
                </button>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-white">
                    <Info className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-white/60">How to use</p>
                      <h3 className="text-lg font-semibold text-white">Internal Portal</h3>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-white/80">
                    {PORTAL_GUIDE_STEPS.map(step => (
                      <li
                        key={step.title}
                        className="rounded-xl border border-white/5 bg-black/20 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                      >
                        <p className="font-medium text-white">{step.title}</p>
                        <p className="mt-1 text-white/70">{step.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-red-200" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-white/70">What's new</p>
                      <h3 className="text-lg font-semibold text-white">{whatsNewVersionLabel}</h3>
                    </div>
                  </div>
                  {latestUpdate ? (
                    <>
                      <p className="mt-2 text-sm text-white/80">{latestUpdate.summary}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-white/60">{latestUpdate.date}</p>
                      <ul className="mt-4 space-y-2 text-sm text-white">
                        {latestUpdate.highlights.map(item => (
                          <li key={item} className="flex items-start gap-2">
                            <Sparkles className="mt-0.5 h-4 w-4 text-white/70" />
                            <span className="text-white/90">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setView("updates")}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 underline-offset-4 hover:underline"
                      >
                        View full release log
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-white/80">
                      We're finalizing release notes for this build. Check back soon for the highlights.
                    </p>
                  )}
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>

  );

}

































