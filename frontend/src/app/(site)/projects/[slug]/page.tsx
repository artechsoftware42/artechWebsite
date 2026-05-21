import { notFound } from "next/navigation";

import ProjectDetailPage from "@/features/project-detail-page/ProjectDetailPage";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;
type LocalizedStringArray = Partial<Record<LanguageCode, string[]>>;

type MaybeLocalizedText = string | LocalizedText;
type MaybeLocalizedArray = string[] | LocalizedStringArray;

type ProjectItem = {
    id: number;
    slug: string;
    categoryKey: string;
    type: MaybeLocalizedText;
    company: MaybeLocalizedText;
    description: MaybeLocalizedText;
    year: string;
    primaryImage: string;
    secondaryImage: string;

    sector?: MaybeLocalizedText;
    duration?: MaybeLocalizedText;
    location?: MaybeLocalizedText;
    services?: MaybeLocalizedArray;
    technologies?: string[];
    challenge?: MaybeLocalizedText;
    solution?: MaybeLocalizedText;
    result?: MaybeLocalizedText;
    projectUrl?: string;
    galleryImages?: string[];
};

type ProjectsContent = {
    key: string;
    value: unknown;
};

type ProjectsSection = {
    name?: string;
    contents?: ProjectsContent[];
};

type ProjectsPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: ProjectsSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getProjectsPageData(): Promise<ProjectItem[] | null> {
    const response = await fetch(`${API_BASE}/api/pages/ProjectsPage`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const data = (await response.json()) as ProjectsPageResponse;

    const projectsSection =
        data.sections?.find((section) => {
            const sectionName = section.name?.toLowerCase();

            return (
                sectionName === "projects" ||
                sectionName === "projectspage" ||
                sectionName === "projects-page"
            );
        }) || data.sections?.[0];

    const projectsContent = projectsSection?.contents?.find(
        (content) => content.key === "projects"
    );

    if (!Array.isArray(projectsContent?.value)) {
        return [];
    }

    return projectsContent.value as ProjectItem[];
}

function getRandomRelatedProjects(projects: ProjectItem[], currentSlug: string) {
    const otherProjects = projects.filter((project) => project.slug !== currentSlug);

    return otherProjects
        .map((project) => ({
            project,
            sort: Math.random(),
        }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 3)
        .map((item) => item.project);
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const projects = await getProjectsPageData();

    if (!projects || projects.length === 0) {
        notFound();
    }

    const project = projects.find((item) => item.slug === slug);

    if (!project) {
        notFound();
    }

    const relatedProjects = getRandomRelatedProjects(projects, slug);

    return (
        <ProjectDetailPage
            project={project}
            relatedProjects={relatedProjects}
        />
    );
}