import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/authOptions';
import fs from 'fs';
import path from 'path';
import { DashboardClient } from './DashboardClient';
import { SignInPromptClient } from './SignInPromptClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Internal Project Documentation & Onboarding',
    description: 'Engineering docs for onboarding, schemas, routes, environments, and tasks.',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function InternalDocsPage() {
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user?.email;

    if (!isAuthenticated) {
        return <SignInPromptClient />;
    }

    // Load generated documentation metadata
    let docsData = {
        generatedAt: new Date().toISOString(),
        routes: [],
        models: [],
        envs: [],
        todos: [],
    };

    try {
        const metadataPath = path.resolve(process.cwd(), 'src/data/internal-docs-metadata.json');
        if (fs.existsSync(metadataPath)) {
            docsData = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to read docs metadata:', e);
    }

    return <DashboardClient data={docsData} user={session?.user} />;
}
