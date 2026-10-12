import type { ExtractEntryMetadataType } from '@shrubs/studio';
import type studio from '@/../studio';

export type ContentCollection = keyof typeof studio.__;

export type ContentEntry<Collection extends ContentCollection> = {
	slug: string;
	metadata: ExtractEntryMetadataType<typeof studio, Collection> & Record<string, unknown>;
	content: string;
	renderedContent: string;
	readTime: string;
};

export type ContentManifest = {
	[Collection in ContentCollection]: ContentEntry<Collection>[];
};
