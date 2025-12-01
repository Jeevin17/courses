import { createClient } from '@supabase/supabase-js';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';

// NOTE: These should be environment variables in a real script
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('Starting migration...');

    const allData = [
        { source: 'ossu', data: ossuData },
        { source: 'roadmap-sh', data: roadmapShData },
        { source: 'physics', data: physicsData }
    ];

    for (const { source, data } of allData) {
        console.log(`Migrating ${source}...`);

        for (const section of data) {
            // Type assertion to handle different data structures
            const items = (section as any).courses || (section as any).topics || [];

            for (const item of items) {
                // 1. Insert Node
                const { data: nodeData, error: nodeError } = await supabase
                    .from('nodes')
                    .upsert({
                        title: item.title,
                        type: 'course', // Defaulting to course for now
                        slug: item.id, // Using existing ID as slug
                        metadata: {
                            description: item.description,
                            source: source,
                            section: section.title,
                            external_link: item.link,
                            duration: item.duration,
                            effort: item.effort
                        }
                    }, { onConflict: 'slug' })
                    .select()
                    .single();

                if (nodeError) {
                    console.error(`Error inserting node ${item.title}:`, nodeError);
                    continue;
                }

                // 2. Insert Edges (Prerequisites)
                if (item.prerequisites && item.prerequisites.length > 0) {
                    for (const prereqSlug of item.prerequisites) {
                        // Find prereq node ID
                        const { data: prereqNode } = await supabase
                            .from('nodes')
                            .select('id')
                            .eq('slug', prereqSlug)
                            .single();

                        if (prereqNode) {
                            const { error: edgeError } = await supabase
                                .from('edges')
                                .upsert({
                                    source_id: prereqNode.id,
                                    target_id: nodeData.id,
                                    type: 'prerequisite'
                                }, { onConflict: 'source_id, target_id' });

                            if (edgeError) console.error(`Error inserting edge ${prereqSlug} -> ${item.title}:`, edgeError);
                        } else {
                            console.warn(`Prerequisite ${prereqSlug} not found for ${item.title}`);
                        }
                    }
                }
            }
        }
    }

    console.log('Migration complete!');
}

migrate();
